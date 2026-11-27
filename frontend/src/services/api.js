import axios from 'axios'

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const hostname = (typeof window !== 'undefined' && window.location?.hostname) || 'localhost'
  const protocol = (typeof window !== 'undefined' && window.location?.protocol) || 'http:'
  return `${protocol}//${hostname}:5000/api/v1`
}

const API_BASE_URL = getApiBaseUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Bearer token to all requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chinese_access_token') || localStorage.getItem('mandarin_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercept 401 response to handle expired sessions cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes('/auth/login') &&
      !error.config.url.includes('/auth/register')
    ) {
      localStorage.removeItem('chinese_access_token')
      localStorage.removeItem('mandarin_access_token')
      localStorage.removeItem('chinese_user')
      localStorage.removeItem('mandarin_user')
      // Optional: dispatch custom event or reload if needed
    }
    return Promise.reject(error)
  }
)

// API Services Helper
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (name) => api.put('/auth/profile', { name }),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
}

export const handwritingService = {
  warmup: () => api.get('/handwriting/warmup').catch(() => {}),
  recognize: (formData) =>
    api.post('/handwriting/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
}

export const dictionaryService = {
  search: (q, page = 1, perPage = 20) =>
    api.get('/dictionary', { params: { q, page, per_page: perPage } }),
  getDetail: (id) => api.get(`/dictionary/${id}`),
}

export const hskService = {
  getWordsByLevel: (level, q = '', page = 1, perPage = 20) =>
    api.get(`/hsk/${level}`, { params: { q, page, per_page: perPage } }),
}

export const dailyWordService = {
  getDailyWords: () => api.get('/daily-words'),
}

export const flashcardService = {
  getProgress: () => api.get('/flashcards/progress'),
  createSession: (level, jumlahSoal) =>
    api.post('/flashcards/sessions', {
      level: Number(level),
      jumlah_soal: Number(jumlahSoal),
    }),
  getSessionDetail: (sessionId) => api.get(`/flashcards/sessions/${sessionId}`),
  submitAnswer: (sessionId, questionId, jawabanPengguna) =>
    api.post(`/flashcards/sessions/${sessionId}/answer`, {
      question_id: Number(questionId),
      jawaban_pengguna: String(jawabanPengguna),
    }),
  cancelSession: (sessionId) =>
    api.post(`/flashcards/sessions/${sessionId}/cancel`),
}

export const savedCharacterService = {
  getSaved: (source = '', page = 1, perPage = 20) =>
    api.get('/saved-characters', {
      params: { source, page, per_page: perPage },
    }),
  saveCharacter: (entryId, source = 'kamus') =>
    api.post('/saved-characters', {
      entry_id: Number(entryId),
      source,
    }),
  deleteSaved: (id) => api.delete(`/saved-characters/${id}`),
}

export const statisticsService = {
  getOverview: () => api.get('/statistics/overview'),
  getDaily: () => api.get('/statistics/daily'),
  getWeekly: () => api.get('/statistics/weekly'),
  getProgress: () => api.get('/statistics/progress'),
  getLeitnerBoxes: () => api.get('/statistics/leitner-boxes'),
  getHistory: (page = 1, perPage = 10) =>
    api.get('/statistics/history', { params: { page, per_page: perPage } }),
  getHistoryDetail: (sessionId) => api.get(`/statistics/history/${sessionId}`),
}

export default api

