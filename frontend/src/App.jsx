import { Navigate, Route, Routes } from 'react-router'
import AdminBookingsPage from './admin/AdminBookingsPage.jsx'
import AdminConfirmedBookingsPage from './admin/AdminConfirmedBookingsPage.jsx'
import AdminDashboardPage from './admin/AdminDashboardPage.jsx'
import AdminLoginPage from './admin/AdminLoginPage.jsx'
import AdminPackagesPage from './admin/AdminPackagesPage.jsx'
import AdminPendingBookingsPage from './admin/AdminPendingBookingsPage.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import BookingPage from './pages/BookingPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyBookingsPage from './pages/MyBookingsPage.jsx'
import PackageDetailsPage from './pages/PackageDetailsPage.jsx'

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/packages/:packageId" element={<PackageDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />

        <Route
          path="/booking/:packageId"
          element={
            <RequireAuth>
              <BookingPage />
            </RequireAuth>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth adminOnly>
              <AdminDashboardPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <RequireAuth adminOnly>
              <AdminBookingsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/bookings/pending"
          element={
            <RequireAuth adminOnly>
              <AdminPendingBookingsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/bookings/confirmed"
          element={
            <RequireAuth adminOnly>
              <AdminConfirmedBookingsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/packages"
          element={
            <RequireAuth adminOnly>
              <AdminPackagesPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  )
}