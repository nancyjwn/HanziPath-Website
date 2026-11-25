import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTopButton from '../components/common/ScrollToTopButton'

export default function MainLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="flex min-h-screen flex-col bg-cream text-charcoal">
      <Navbar />

      <main className={`flex-1 ${isHomePage ? '' : 'pt-20 sm:pt-24'}`}>
        <Outlet />
      </main>

      <Footer />

      {/* Floating Back to Top Button when Reached the Bottom */}
      <ScrollToTopButton />
    </div>
  )
}

