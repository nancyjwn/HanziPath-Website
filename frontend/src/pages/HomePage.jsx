import { useAuth } from '../context/AuthContext'
import GuestHome from '../components/home/GuestHome'
import UserHome from '../components/home/UserHome'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <UserHome /> : <GuestHome />
}
