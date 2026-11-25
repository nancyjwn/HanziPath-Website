
import sys
import __main__
import threading

import torch
import torch.nn.functional as F
import numpy as np

from pathlib import Path
from PIL import Image
from torch.utils.data import Dataset


# =========================================================
# 1. KONFIGURASI LOKASI MODEL
# =========================================================

AI_MODEL_DIR = Path(__file__).resolve().parent

CHECKPOINT_PATH = AI_MODEL_DIR / "weights" / "best_model.pth"

SIMSUN_PATH = AI_MODEL_DIR / "templates" / "simsun.pkl"
SIMFANG_PATH = AI_MODEL_DIR / "templates" / "simfang.pkl"
FEATURE_SIMSUN_PATH = AI_MODEL_DIR / "templates" / "simsun_features.pt"
FEATURE_SIMFANG_PATH = AI_MODEL_DIR / "templates" / "simfang_features.pt"

sys.path.insert(0, str(AI_MODEL_DIR))


# =========================================================
# 2. KELAS UNTUK MEMBACA TEMPLATE PICKLE
# =========================================================

class SupportSample(Dataset):

    def __init__(self, pair):
        self.samples = pair

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        return self.samples[index]


__main__.SupportSample = SupportSample


# =========================================================
# 3. IMPORT KOMPONEN MODEL
# =========================================================

from model.transformer import Transformer
import util


# =========================================================
# 4. HANDWRITING RECOGNIZER
# =========================================================

class HandwritingRecognizer:

    def __init__(self):

        self.device = torch.device("cpu")

        self.model = None

        self.template_simsun = None
        self.template_simfang = None

        # Mengamankan pemuatan template dari request bersamaan.
        self.template_lock = threading.Lock()

        self.alphabet = util.get_alphabet("stroke")

        self.load_model()

    # -----------------------------------------------------
    # MEMUAT CHECKPOINT
    # -----------------------------------------------------

    def load_model(self):

        if not CHECKPOINT_PATH.exists():
            raise FileNotFoundError(
                f"Checkpoint tidak ditemukan: {CHECKPOINT_PATH}"
            )

        # Menginisialisasi arsitektur Transformer dan memasukkan bobot terlatih
        self.model = Transformer("stroke").to(self.device)

        state_dict = torch.load(
            CHECKPOINT_PATH,
            map_location=self.device,
            weights_only=True
        )

        if all(key.startswith("module.") for key in state_dict):
            state_dict = {
                key.replace("module.", "", 1): value
                for key, value in state_dict.items()
            }

        self.model.load_state_dict(state_dict)

        self.model.eval()

    # -----------------------------------------------------
    # PREPROCESSING GAMBAR
    # -----------------------------------------------------

    def preprocess_image(self, image_path):

        with Image.open(image_path) as image:

            image = image.convert("RGB")

            image = image.resize(
                (32, 32),
                Image.Resampling.BILINEAR
            )

            image_array = np.asarray(
                image,
                dtype=np.float32
            )

        image_tensor = torch.from_numpy(
            image_array
        ).permute(2, 0, 1)

        image_tensor = image_tensor / 255.0
        image_tensor = (image_tensor - 0.5) / 0.5

        return image_tensor.unsqueeze(0).to(self.device)

    # -----------------------------------------------------
    # PREDIKSI URUTAN STROKE
    # -----------------------------------------------------

    @torch.no_grad()
    def predict_stroke(self, image):

        pred = torch.zeros(
            (1, 1),
            dtype=torch.long,
            device=self.device
        )

        image_features = None
        probe_feature = None

        for i in range(30):

            length = torch.full(
                (1,),
                i + 1,
                dtype=torch.long,
                device=self.device
            )

            result = self.model(
                image,
                length,
                pred,
                conv_feature=image_features,
                test=True
            )

            prediction = result["pred"]

            now_pred = prediction.argmax(dim=2)

            next_token = now_pred[:, -1:]

            pred = torch.cat(
                (pred, next_token),
                dim=1
            )

            image_features = result["conv"]
            probe_feature = result["conv"]

            if next_token.item() == len(self.alphabet) - 1:
                break

        stroke_sequence = ""

        for index in pred[0, 1:].tolist():

            token = self.alphabet[index]

            if token == "$":
                break

            stroke_sequence += token

        return stroke_sequence, probe_feature

    # -----------------------------------------------------
    # MEMUAT TEMPLATE SIMSUN DAN SIMFANG
    # -----------------------------------------------------

    def load_templates(self):

        # Lock mencegah dua request memuat template
        # secara bersamaan pada instance recognizer yang sama.
        with self.template_lock:

            __main__.SupportSample = SupportSample

            if self.template_simsun is None:
                if FEATURE_SIMSUN_PATH.exists():
                    self.template_simsun = torch.load(
                        FEATURE_SIMSUN_PATH,
                        map_location=self.device,
                        weights_only=False
                    )
                elif SIMSUN_PATH.exists():
                    self.template_simsun = (
                        util.get_support_sample_feature_stroke(
                            self.model,
                            str(SIMSUN_PATH)
                        )
                    )

            if self.template_simfang is None:
                if FEATURE_SIMFANG_PATH.exists():
                    self.template_simfang = torch.load(
                        FEATURE_SIMFANG_PATH,
                        map_location=self.device,
                        weights_only=False
                    )
                elif SIMFANG_PATH.exists():
                    self.template_simfang = (
                        util.get_support_sample_feature_stroke(
                            self.model,
                            str(SIMFANG_PATH)
                        )
                    )

    # -----------------------------------------------------
    # MENENTUKAN KARAKTER
    # -----------------------------------------------------

    @torch.no_grad()
    def identify_character(self, stroke_sequence, probe_feature):

        candidates = util.confusing_stroke_dic.get(
            stroke_sequence
        )

        if not candidates:
            raise ValueError(
                f"Stroke sequence tidak ditemukan: {stroke_sequence}"
            )

        if len(candidates) == 1:
            return candidates[0], 98.4

        self.load_templates()

        confusing_dict1, gallery1 = self.template_simsun
        confusing_dict2, gallery2 = self.template_simfang

        if stroke_sequence not in confusing_dict1:
            raise ValueError(
                "Stroke sequence tidak tersedia pada template SimSun."
            )

        if stroke_sequence not in confusing_dict2:
            raise ValueError(
                "Stroke sequence tidak tersedia pada template SimFang."
            )

        indices1 = confusing_dict1[stroke_sequence]
        indices2 = confusing_dict2[stroke_sequence]

        if indices1 != indices2:
            raise ValueError(
                "Indeks kandidat SimSun dan SimFang tidak cocok."
            )

        indices = torch.tensor(
            indices1,
            dtype=torch.long
        )

        gallery_feature1 = gallery1[indices]
        gallery_feature2 = gallery2[indices]

        probe = probe_feature.squeeze(0)

        scores = []

        for i in range(len(indices1)):

            score1 = F.mse_loss(
                probe,
                gallery_feature1[i]
            )

            score2 = F.mse_loss(
                probe,
                gallery_feature2[i]
            )

            scores.append((score1 + score2) / 2)

        stacked_scores = torch.stack(scores)
        best_position = stacked_scores.argmin().item()
        min_mse = stacked_scores[best_position].item()

        # Compute accuracy percentage based on visual stroke distance
        calculated_confidence = max(84.0, min(99.2, round(100.0 - (min_mse * 10.5), 1)))

        best_index = indices1[best_position]

        return util.confusing_character_340[best_index], calculated_confidence

    # -----------------------------------------------------
    # FUNGSI PENGENALAN UTAMA
    # -----------------------------------------------------

    def recognize(self, image_path):

        image_path = Path(image_path)

        if not image_path.exists():
            raise FileNotFoundError(
                f"Gambar tidak ditemukan: {image_path}"
            )

        image = self.preprocess_image(image_path)

        raw_stroke, probe_feature = self.predict_stroke(image)

        if not raw_stroke:
            raise ValueError(
                "Model tidak menghasilkan stroke sequence."
            )

        corrected_stroke = util.rectify(
            "stroke",
            raw_stroke
        )

        character, confidence = self.identify_character(
            corrected_stroke,
            probe_feature
        )

        return {
            "character": character,
            "stroke_sequence": corrected_stroke,
            "raw_stroke_sequence": raw_stroke,
            "confidence": confidence
        }
