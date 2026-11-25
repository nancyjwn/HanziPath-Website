"""
Kamus Pemetaan Bahasa Indonesia ke Karakter Mandarin dan Bahasa Inggris.
Membantu pencarian kamus agar mahasiswa/pelajar Indonesia yang mencari
kata dalam Bahasa Indonesia (seperti 'halo', 'terima kasih', 'apa kabar', dsb.)
mendapatkan kosakata Mandarin yang tepat dan relevan.
"""

INDONESIAN_MAP = {
    # -------------------------------------------------------------------------
    # Salam & Kesopanan (Greetings & Politeness)
    # -------------------------------------------------------------------------
    "halo": {
        "hanzi": ["你好", "您好", "喂", "哈啰", "哈喽"],
        "english": ["hello", "hi"],
        "note": "Halo / Salam"
    },
    "helo": {
        "hanzi": ["你好", "您好", "喂", "哈啰"],
        "english": ["hello", "hi"],
    },
    "hai": {
        "hanzi": ["你好", "嗨", "哈啰"],
        "english": ["hi", "hello"],
    },
    "apa kabar": {
        "hanzi": ["你好吗", "近来好吗", "怎么样"],
        "english": ["how are you"],
        "note": "Apa kabar?"
    },
    "kabar": {
        "hanzi": ["消息", "情况", "你好吗"],
        "english": ["news", "how are you"],
    },
    "terima kasih": {
        "hanzi": ["谢谢", "多谢", "感谢"],
        "english": ["thank you", "thanks"],
        "note": "Terima kasih"
    },
    "terimakasih": {
        "hanzi": ["谢谢", "多谢", "感谢"],
        "english": ["thank you", "thanks"],
    },
    "makasih": {
        "hanzi": ["谢谢", "多谢"],
        "english": ["thanks", "thank you"],
    },
    "trims": {
        "hanzi": ["谢谢"],
        "english": ["thanks", "thank you"],
    },
    "sama-sama": {
        "hanzi": ["不客气", "不用谢", "别客气"],
        "english": ["you're welcome", "you are welcome"],
        "note": "Sama-sama"
    },
    "sama sama": {
        "hanzi": ["不客气", "不用谢"],
        "english": ["you're welcome"],
    },
    "kembali": {
        "hanzi": ["回", "回来", "回去", "不客气"],
        "english": ["return", "come back", "you're welcome"],
    },
    "selamat pagi": {
        "hanzi": ["早上好", "早安", "早"],
        "english": ["good morning"],
        "note": "Selamat pagi"
    },
    "pagi": {
        "hanzi": ["早", "早上", "早安"],
        "english": ["morning", "good morning"],
    },
    "selamat siang": {
        "hanzi": ["中午好", "午安"],
        "english": ["good afternoon"],
        "note": "Selamat siang"
    },
    "siang": {
        "hanzi": ["中午", "白天"],
        "english": ["noon", "daytime"],
    },
    "selamat sore": {
        "hanzi": ["下午好"],
        "english": ["good afternoon"],
        "note": "Selamat sore"
    },
    "sore": {
        "hanzi": ["下午", "傍晚"],
        "english": ["afternoon", "late afternoon"],
    },
    "selamat malam": {
        "hanzi": ["晚上好", "晚安"],
        "english": ["good evening", "good night"],
        "note": "Selamat malam"
    },
    "malam": {
        "hanzi": ["晚上", "夜", "晚安"],
        "english": ["night", "evening"],
    },
    "selamat tinggal": {
        "hanzi": ["再见", "慢走"],
        "english": ["goodbye", "farewell"],
        "note": "Selamat tinggal"
    },
    "sampai jumpa": {
        "hanzi": ["再见", "明天见", "回头见"],
        "english": ["goodbye", "see you"],
        "note": "Sampai jumpa"
    },
    "dadah": {
        "hanzi": ["再见", "拜拜"],
        "english": ["bye", "goodbye"],
    },
    "bye": {
        "hanzi": ["再见", "拜拜"],
        "english": ["bye", "goodbye"],
    },
    "maaf": {
        "hanzi": ["对不起", "不好意思", "抱歉"],
        "english": ["sorry", "apologize", "excuse me"],
        "note": "Maaf"
    },
    "permisi": {
        "hanzi": ["请问", "打扰一下", "劳驾", "不好意思"],
        "english": ["excuse me", "pardon me", "may i ask"],
        "note": "Permisi"
    },
    "tolong": {
        "hanzi": ["请", "帮", "帮助", "帮忙"],
        "english": ["please", "help"],
        "note": "Tolong / Mohon"
    },
    "bantu": {
        "hanzi": ["帮", "帮助", "帮忙"],
        "english": ["help", "assist"],
    },
    "ya": {
        "hanzi": ["是", "对", "好的"],
        "english": ["yes", "right", "correct"],
    },
    "iya": {
        "hanzi": ["是", "对"],
        "english": ["yes", "right"],
    },
    "tidak": {
        "hanzi": ["不", "不是", "没有"],
        "english": ["no", "not"],
        "note": "Tidak"
    },
    "bukan": {
        "hanzi": ["不是", "不"],
        "english": ["not", "is not"],
    },

    # -------------------------------------------------------------------------
    # Kata Ganti & Orang (Pronouns & People)
    # -------------------------------------------------------------------------
    "saya": {
        "hanzi": ["我"],
        "english": ["i", "me", "my"],
    },
    "aku": {
        "hanzi": ["我"],
        "english": ["i", "me"],
    },
    "kamu": {
        "hanzi": ["你"],
        "english": ["you"],
    },
    "anda": {
        "hanzi": ["您", "你"],
        "english": ["you (respectful)", "you"],
    },
    "dia": {
        "hanzi": ["他", "她", "它"],
        "english": ["he", "she", "it", "him", "her"],
    },
    "kami": {
        "hanzi": ["我们"],
        "english": ["we", "us"],
    },
    "kita": {
        "hanzi": ["我们", "咱们"],
        "english": ["we", "us"],
    },
    "mereka": {
        "hanzi": ["他们", "她们", "它们"],
        "english": ["they", "them"],
    },
    "siapa": {
        "hanzi": ["谁"],
        "english": ["who", "whom"],
    },
    "apa": {
        "hanzi": ["什么"],
        "english": ["what"],
    },
    "mana": {
        "hanzi": ["哪", "哪里", "哪儿"],
        "english": ["which", "where"],
    },
    "di mana": {
        "hanzi": ["哪里", "哪儿", "在哪"],
        "english": ["where"],
    },
    "dimana": {
        "hanzi": ["哪里", "哪儿", "在哪"],
        "english": ["where"],
    },
    "kapan": {
        "hanzi": ["什么时候", "几时"],
        "english": ["when"],
    },
    "kenapa": {
        "hanzi": ["为什么", "怎么"],
        "english": ["why"],
    },
    "mengapa": {
        "hanzi": ["为什么"],
        "english": ["why"],
    },
    "bagaimana": {
        "hanzi": ["怎么", "怎么样", "如何"],
        "english": ["how"],
    },
    "gimana": {
        "hanzi": ["怎么样", "怎么"],
        "english": ["how"],
    },
    "berapa": {
        "hanzi": ["多少", "几"],
        "english": ["how many", "how much"],
    },
    "ini": {
        "hanzi": ["这", "这个"],
        "english": ["this", "these"],
    },
    "itu": {
        "hanzi": ["那", "那个"],
        "english": ["that", "those"],
    },
    "orang": {
        "hanzi": ["人"],
        "english": ["person", "people"],
    },
    "teman": {
        "hanzi": ["朋友"],
        "english": ["friend"],
    },
    "kawan": {
        "hanzi": ["朋友", "伙伴"],
        "english": ["friend", "companion"],
    },
    "guru": {
        "hanzi": ["老师", "教师"],
        "english": ["teacher"],
    },
    "murid": {
        "hanzi": ["学生"],
        "english": ["student", "pupil"],
    },
    "siswa": {
        "hanzi": ["学生"],
        "english": ["student"],
    },
    "mahasiswa": {
        "hanzi": ["大学生", "学生"],
        "english": ["college student", "university student"],
    },
    "dokter": {
        "hanzi": ["医生", "大夫"],
        "english": ["doctor"],
    },
    "keluarga": {
        "hanzi": ["家", "家庭", "家人"],
        "english": ["family", "household"],
    },
    "ayah": {
        "hanzi": ["爸爸", "父亲"],
        "english": ["father", "dad"],
    },
    "bapak": {
        "hanzi": ["爸爸", "父亲"],
        "english": ["father"],
    },
    "papa": {
        "hanzi": ["爸爸"],
        "english": ["dad", "papa"],
    },
    "ibu": {
        "hanzi": ["妈妈", "母亲"],
        "english": ["mother", "mom"],
    },
    "mama": {
        "hanzi": ["妈妈"],
        "english": ["mom", "mama"],
    },
    "kakak": {
        "hanzi": ["哥哥", "姐姐"],
        "english": ["elder brother", "elder sister"],
    },
    "abang": {
        "hanzi": ["哥哥"],
        "english": ["older brother"],
    },
    "adik": {
        "hanzi": ["弟弟", "妹妹"],
        "english": ["younger brother", "younger sister"],
    },
    "anak": {
        "hanzi": ["孩子", "儿子", "女儿"],
        "english": ["child", "kid", "son", "daughter"],
    },
    "suami": {
        "hanzi": ["丈夫", "老公"],
        "english": ["husband"],
    },
    "istri": {
        "hanzi": ["妻子", "老婆"],
        "english": ["wife"],
    },

    # -------------------------------------------------------------------------
    # Kata Kerja Sehari-hari (Verbs)
    # -------------------------------------------------------------------------
    "makan": {
        "hanzi": ["吃", "吃饭"],
        "english": ["eat", "have a meal"],
    },
    "minum": {
        "hanzi": ["喝"],
        "english": ["drink"],
    },
    "tidur": {
        "hanzi": ["睡觉", "睡"],
        "english": ["sleep", "go to bed"],
    },
    "bangun": {
        "hanzi": ["起床", "醒"],
        "english": ["wake up", "get up"],
    },
    "belajar": {
        "hanzi": ["学", "学习"],
        "english": ["study", "learn"],
    },
    "baca": {
        "hanzi": ["看", "看书", "读"],
        "english": ["read"],
    },
    "membaca": {
        "hanzi": ["看书", "读", "阅读"],
        "english": ["read"],
    },
    "tulis": {
        "hanzi": ["写", "写字"],
        "english": ["write"],
    },
    "menulis": {
        "hanzi": ["写", "写字"],
        "english": ["write"],
    },
    "bicara": {
        "hanzi": ["说", "说话", "讲"],
        "english": ["speak", "talk", "say"],
    },
    "dengar": {
        "hanzi": ["听", "听到"],
        "english": ["listen", "hear"],
    },
    "mendengar": {
        "hanzi": ["听", "听到"],
        "english": ["listen", "hear"],
    },
    "lihat": {
        "hanzi": ["看", "看见"],
        "english": ["look", "see", "watch"],
    },
    "melihat": {
        "hanzi": ["看", "看见"],
        "english": ["look", "see", "watch"],
    },
    "nonton": {
        "hanzi": ["看"],
        "english": ["watch", "view"],
    },
    "jalan": {
        "hanzi": ["走", "走路"],
        "english": ["walk", "go"],
    },
    "berjalan": {
        "hanzi": ["走", "走路"],
        "english": ["walk"],
    },
    "lari": {
        "hanzi": ["跑", "跑步"],
        "english": ["run"],
    },
    "duduk": {
        "hanzi": ["坐"],
        "english": ["sit"],
    },
    "berdiri": {
        "hanzi": ["站", "起立"],
        "english": ["stand"],
    },
    "datang": {
        "hanzi": ["来", "来到"],
        "english": ["come", "arrive"],
    },
    "pergi": {
        "hanzi": ["去", "离开"],
        "english": ["go", "leave"],
    },
    "pulang": {
        "hanzi": ["回", "回家"],
        "english": ["return", "go home"],
    },
    "kerja": {
        "hanzi": ["工作", "上班"],
        "english": ["work", "job"],
    },
    "bekerja": {
        "hanzi": ["工作", "上班"],
        "english": ["work", "job"],
    },
    "beli": {
        "hanzi": ["买"],
        "english": ["buy", "purchase"],
    },
    "membeli": {
        "hanzi": ["买"],
        "english": ["buy"],
    },
    "jual": {
        "hanzi": ["卖"],
        "english": ["sell"],
    },
    "menjual": {
        "hanzi": ["卖"],
        "english": ["sell"],
    },
    "cinta": {
        "hanzi": ["爱", "爱情"],
        "english": ["love"],
    },
    "suka": {
        "hanzi": ["喜欢", "爱"],
        "english": ["like", "love"],
    },
    "tahu": {
        "hanzi": ["知道", "了解", "认识"],
        "english": ["know"],
    },
    "mengerti": {
        "hanzi": ["懂", "明白", "理解"],
        "english": ["understand"],
    },
    "paham": {
        "hanzi": ["懂", "明白"],
        "english": ["understand"],
    },
    "bisa": {
        "hanzi": ["能", "可以", "会"],
        "english": ["can", "able to"],
    },
    "mau": {
        "hanzi": ["要", "想"],
        "english": ["want", "wish"],
    },
    "ingin": {
        "hanzi": ["想", "想要", "希望"],
        "english": ["want", "wish"],
    },
    "punya": {
        "hanzi": ["有"],
        "english": ["have", "own"],
    },
    "ada": {
        "hanzi": ["有", "在"],
        "english": ["have", "exist", "at"],
    },

    # -------------------------------------------------------------------------
    # Angka (Numbers)
    # -------------------------------------------------------------------------
    "nol": {"hanzi": ["零"], "english": ["zero"]},
    "satu": {"hanzi": ["一"], "english": ["one"]},
    "dua": {"hanzi": ["二", "两"], "english": ["two"]},
    "tiga": {"hanzi": ["三"], "english": ["three"]},
    "empat": {"hanzi": ["四"], "english": ["four"]},
    "lima": {"hanzi": ["五"], "english": ["five"]},
    "enam": {"hanzi": ["六"], "english": ["six"]},
    "tujuh": {"hanzi": ["七"], "english": ["seven"]},
    "delapan": {"hanzi": ["八"], "english": ["eight"]},
    "sembilan": {"hanzi": ["九"], "english": ["nine"]},
    "sepuluh": {"hanzi": ["十"], "english": ["ten"]},
    "ratus": {"hanzi": ["百"], "english": ["hundred"]},
    "seratus": {"hanzi": ["一百", "百"], "english": ["one hundred"]},
    "ribu": {"hanzi": ["千"], "english": ["thousand"]},
    "seribu": {"hanzi": ["一千", "千"], "english": ["one thousand"]},
    "juta": {"hanzi": ["百万"], "english": ["million"]},

    # -------------------------------------------------------------------------
    # Benda & Tempat (Objects & Places)
    # -------------------------------------------------------------------------
    "rumah": {"hanzi": ["家", "房子"], "english": ["home", "house"]},
    "sekolah": {"hanzi": ["学校"], "english": ["school"]},
    "kampus": {"hanzi": ["大学", "校园"], "english": ["university", "campus"]},
    "universitas": {"hanzi": ["大学"], "english": ["university"]},
    "kelas": {"hanzi": ["教室", "班"], "english": ["classroom", "class"]},
    "kamar": {"hanzi": ["房间"], "english": ["room"]},
    "kantor": {"hanzi": ["办公室"], "english": ["office"]},
    "rumah sakit": {"hanzi": ["医院"], "english": ["hospital"]},
    "restoran": {"hanzi": ["饭馆", "餐厅"], "english": ["restaurant"]},
    "toko": {"hanzi": ["商店"], "english": ["shop", "store"]},
    "pasar": {"hanzi": ["市场", "菜市场"], "english": ["market"]},
    "buku": {"hanzi": ["书", "书本"], "english": ["book"]},
    "uang": {"hanzi": ["钱"], "english": ["money"]},
    "air": {"hanzi": ["水"], "english": ["water"]},
    "teh": {"hanzi": ["茶"], "english": ["tea"]},
    "kopi": {"hanzi": ["咖啡"], "english": ["coffee"]},
    "nasi": {"hanzi": ["米饭", "饭"], "english": ["rice", "cooked rice"]},
    "roti": {"hanzi": ["面包"], "english": ["bread"]},
    "mie": {"hanzi": ["面条", "面"], "english": ["noodles"]},
    "mi": {"hanzi": ["面条", "面"], "english": ["noodles"]},
    "daging": {"hanzi": ["肉"], "english": ["meat"]},
    "ayam": {"hanzi": ["鸡", "鸡肉"], "english": ["chicken"]},
    "ikan": {"hanzi": ["鱼"], "english": ["fish"]},
    "sapi": {"hanzi": ["牛", "牛肉"], "english": ["cow", "beef"]},
    "buah": {"hanzi": ["水果"], "english": ["fruit"]},
    "apel": {"hanzi": ["苹果"], "english": ["apple"]},
    "sayur": {"hanzi": ["菜", "蔬菜"], "english": ["vegetable"]},
    "mobil": {"hanzi": ["车", "汽车"], "english": ["car"]},
    "motor": {"hanzi": ["摩托车"], "english": ["motorcycle"]},
    "sepeda": {"hanzi": ["自行车"], "english": ["bicycle"]},
    "bus": {"hanzi": ["公共汽车", "公交车", "巴士"], "english": ["bus"]},
    "kereta": {"hanzi": ["火车"], "english": ["train"]},
    "pesawat": {"hanzi": ["飞机"], "english": ["airplane", "plane"]},
    "telepon": {"hanzi": ["电话", "手机"], "english": ["telephone", "phone"]},
    "hp": {"hanzi": ["手机"], "english": ["cellphone", "mobile phone"]},
    "komputer": {"hanzi": ["电脑"], "english": ["computer"]},
    "meja": {"hanzi": ["桌子"], "english": ["table", "desk"]},
    "kursi": {"hanzi": ["椅子"], "english": ["chair"]},
    "pintu": {"hanzi": ["门"], "english": ["door"]},
    "baju": {"hanzi": ["衣服"], "english": ["clothes", "clothing"]},
    "pakaian": {"hanzi": ["衣服"], "english": ["clothes"]},
    "celana": {"hanzi": ["裤子"], "english": ["pants", "trousers"]},
    "sepatu": {"hanzi": ["鞋", "鞋子"], "english": ["shoes"]},

    # -------------------------------------------------------------------------
    # Waktu & Hari (Time & Dates)
    # -------------------------------------------------------------------------
    "hari ini": {"hanzi": ["今天"], "english": ["today"]},
    "besok": {"hanzi": ["明天"], "english": ["tomorrow"]},
    "kemarin": {"hanzi": ["昨天"], "english": ["yesterday"]},
    "sekarang": {"hanzi": ["现在"], "english": ["now"]},
    "hari": {"hanzi": ["日", "天"], "english": ["day"]},
    "minggu": {"hanzi": ["星期", "周", "星期日", "星期天"], "english": ["week", "Sunday"]},
    "bulan": {"hanzi": ["月"], "english": ["month", "moon"]},
    "tahun": {"hanzi": ["年"], "english": ["year"]},
    "jam": {"hanzi": ["点", "小时", "时间"], "english": ["hour", "o'clock", "time"]},
    "waktu": {"hanzi": ["时间"], "english": ["time"]},
    "menit": {"hanzi": ["分", "分钟"], "english": ["minute"]},

    # -------------------------------------------------------------------------
    # Kata Sifat (Adjectives)
    # -------------------------------------------------------------------------
    "bagus": {"hanzi": ["好"], "english": ["good", "fine"]},
    "baik": {"hanzi": ["好"], "english": ["good", "fine", "kind"]},
    "buruk": {"hanzi": ["坏"], "english": ["bad"]},
    "jelek": {"hanzi": ["难看", "丑", "坏"], "english": ["ugly", "bad"]},
    "besar": {"hanzi": ["大"], "english": ["big", "large"]},
    "kecil": {"hanzi": ["小"], "english": ["small", "little"]},
    "panjang": {"hanzi": ["长"], "english": ["long"]},
    "pendek": {"hanzi": ["短", "矮"], "english": ["short"]},
    "tinggi": {"hanzi": ["高"], "english": ["tall", "high"]},
    "rendah": {"hanzi": ["低", "矮"], "english": ["low"]},
    "banyak": {"hanzi": ["多"], "english": ["many", "much"]},
    "sedikit": {"hanzi": ["少"], "english": ["few", "little"]},
    "cepat": {"hanzi": ["快"], "english": ["fast", "quick"]},
    "lambat": {"hanzi": ["慢"], "english": ["slow"]},
    "panas": {"hanzi": ["热"], "english": ["hot"]},
    "dingin": {"hanzi": ["冷"], "english": ["cold"]},
    "baru": {"hanzi": ["新"], "english": ["new"]},
    "lama": {"hanzi": ["旧", "久", "老"], "english": ["old", "long time"]},
    "tua": {"hanzi": ["老"], "english": ["old"]},
    "muda": {"hanzi": ["年轻"], "english": ["young"]},
    "cantik": {"hanzi": ["漂亮", "美丽"], "english": ["beautiful", "pretty"]},
    "indah": {"hanzi": ["美丽", "漂亮"], "english": ["beautiful"]},
    "ganteng": {"hanzi": ["帅"], "english": ["handsome"]},
    "tampan": {"hanzi": ["帅"], "english": ["handsome"]},
    "pintar": {"hanzi": ["聪明"], "english": ["smart", "clever"]},
    "cerdas": {"hanzi": ["聪明"], "english": ["smart"]},
    "mahal": {"hanzi": ["贵"], "english": ["expensive"]},
    "murah": {"hanzi": ["便宜"], "english": ["cheap", "inexpensive"]},
    "mudah": {"hanzi": ["容易", "简单"], "english": ["easy", "simple"]},
    "gampang": {"hanzi": ["容易", "简单"], "english": ["easy"]},
    "sulit": {"hanzi": ["难"], "english": ["difficult", "hard"]},
    "susah": {"hanzi": ["难"], "english": ["difficult", "hard"]},
    "senang": {"hanzi": ["高兴", "快乐", "开心"], "english": ["happy", "glad"]},
    "bahagia": {"hanzi": ["幸福", "快乐"], "english": ["happy", "blessed"]},
    "sedih": {"hanzi": ["难过", "伤心"], "english": ["sad"]},
    "marah": {"hanzi": ["生气"], "english": ["angry"]},
    "takut": {"hanzi": ["怕", "害怕"], "english": ["afraid", "fear"]},
    "capek": {"hanzi": ["累"], "english": ["tired"]},
    "lelah": {"hanzi": ["累"], "english": ["tired"]},
    "lapar": {"hanzi": ["饿"], "english": ["hungry"]},
    "haus": {"hanzi": ["渴"], "english": ["thirsty"]},
    "enak": {"hanzi": ["好吃", "好喝", "美味"], "english": ["delicious", "tasty"]},
    "bersih": {"hanzi": ["干净"], "english": ["clean"]},
    "kotor": {"hanzi": ["脏"], "english": ["dirty"]},
    "jauh": {"hanzi": ["远"], "english": ["far"]},
    "dekat": {"hanzi": ["近"], "english": ["near", "close"]},
    "benar": {"hanzi": ["对", "正确"], "english": ["correct", "right"]},
    "salah": {"hanzi": ["错", "错误"], "english": ["wrong", "mistake"]},

    # -------------------------------------------------------------------------
    # Warna (Colors)
    # -------------------------------------------------------------------------
    "merah": {"hanzi": ["红", "红色"], "english": ["red"]},
    "putih": {"hanzi": ["白", "白色"], "english": ["white"]},
    "hitam": {"hanzi": ["黑", "黑色"], "english": ["black"]},
    "biru": {"hanzi": ["蓝", "蓝色"], "english": ["blue"]},
    "kuning": {"hanzi": ["黄", "黄色"], "english": ["yellow"]},
    "hijau": {"hanzi": ["绿", "绿色"], "english": ["green"]},
}


def lookup_indonesian_query(keyword: str):
    """
    Memeriksa apakah keyword pencarian adalah kata/frasa dalam Bahasa Indonesia.
    Mengembalikan dictionary berisi target hanzi, english, dan note jika ditemukan.
    """
    if not keyword:
        return None

    cleaned = keyword.strip().lower()
    # Bersihkan tanda baca umum (tanya, seru, titik, koma)
    cleaned_no_punct = cleaned.rstrip("?!.,;:")

    # 1. Cek kecocokan langsung
    if cleaned_no_punct in INDONESIAN_MAP:
        return INDONESIAN_MAP[cleaned_no_punct]

    # 2. Cek variasi spasi
    compact = "".join(cleaned_no_punct.split())
    for k, v in INDONESIAN_MAP.items():
        if "".join(k.split()) == compact:
            return v

    return None

