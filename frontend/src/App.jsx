import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import ScrollToTop from './components/common/ScrollToTop'

import HomePage from './pages/HomePage'
import HandwritingPage from './pages/HandwritingPage'
import DictionaryPage from './pages/DictionaryPage'
import FlashcardPage from './pages/FlashcardPage'
import FlashcardDetailPage from './pages/FlashcardDetailPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Dedicated full-screen Auth Pages with oriental landscape backdrop */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/handwriting" element={<HandwritingPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/flashcards" element={<FlashcardPage />} />
            <Route path="/flashcards/detail" element={<FlashcardDetailPage />} />
            <Route path="/flashcards/detail/:level" element={<FlashcardDetailPage />} />
            <Route path="/detailflashcard" element={<Navigate to="/flashcards/detail" replace />} />
            <Route path="/detailflashcard/:level" element={<FlashcardDetailPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
