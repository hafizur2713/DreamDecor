import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext.jsx'

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString('en-IN')}`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminDashboardPage() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function handleLogout() {
    Swal.fire({
      title: 'Log out?',
      text: 'Are you sure you want to log out of DreamDecor admin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#49372f',
      cancelButtonColor: '#8c8077',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        navigate('/admin')
      }
    })
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('Please log in as an admin to view the dashboard.')
      return
    }

    async function loadDashboard() {
      try {
        const headers = { Authorization: `Bearer ${token}` }

        const [bookingsResponse, packagesResponse] = await Promise.all([
          fetch('http://localhost:5000/api/admin/bookings', { headers }),
          fetch('http://localhost:5000/api/admin/packages', { headers }),
        ])

        const [bookingsData, packagesData] = await Promise.all([
          bookingsResponse.json(),
          packagesResponse.json(),
        ])

        if (!bookingsResponse.ok) {
          throw new Error(bookingsData.error || 'Could not load bookings.')
        }

        if (!packagesResponse.ok) {
          throw new Error(packagesData.error || 'Could not load packages.')
        }

        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
        setPackages(Array.isArray(packagesData) ? packagesData : [])
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [token])

  const pendingCount = bookings.filter(
    (booking) => booking.status === 'PENDING',
  ).length

  const confirmedCount = bookings.filter(
    (booking) => booking.status === 'CONFIRMED',
  ).length

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <main className="admin-dashboard container py-5">
      <div className="admin-dashboard-heading">
        <div>
          <p className="admin-dashboard-eyebrow">DreamDecor administration</p>
          <h1>Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Overview of your bookings and decoration packages.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link className="btn btn-outline-dark" to="/">
            Back to store
          </Link>
          <Link className="btn btn-dark" to="/admin/bookings">
            Manage bookings
          </Link>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>

      {loading && <p className="mt-4">Loading dashboard...</p>}

      {error && <p className="alert alert-warning mt-4">{error}</p>}

      {!loading && !error && (
        <>
          <section className="admin-dashboard-stats">
            <article className="admin-stat-card">
              <span>Total bookings</span>
              <strong>{bookings.length}</strong>
              <Link to="/admin/bookings">View bookings</Link>
            </article>

            <article className="admin-stat-card">
              <span>Awaiting review</span>
              <strong>{pendingCount}</strong>
              <Link to="/admin/bookings/pending">Review pending bookings</Link>
            </article>

            <article className="admin-stat-card">
              <span>Confirmed bookings</span>
              <strong>{confirmedCount}</strong>
              <Link to="/admin/bookings/confirmed">View confirmed bookings</Link>
            </article>

            <article className="admin-stat-card">
              <span>Decoration packages</span>
              <strong>{packages.length}</strong>
              <Link to="/admin/packages">Manage packages</Link>
            </article>
          </section>

          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-heading">
              <div>
                <h2>Recent bookings</h2>
                <p className="text-muted mb-0">
                  The latest bookings from your customers.
                </p>
              </div>

              <Link to="/admin/bookings">View all</Link>
            </div>

            {recentBookings.length === 0 ? (
              <p className="text-muted mb-0">No bookings yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Package</th>
                      <th>Event date</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          {booking.user?.name || 'Customer'}
                          <br />
                          <small className="text-muted">
                            {booking.user?.email}
                          </small>
                        </td>
                        <td>{booking.decorationPackage?.name || 'Package'}</td>
                        <td>{formatDate(booking.eventDate)}</td>
                        <td>{formatPrice(booking.priceAtBooking)}</td>
                        <td>
                          <span className="admin-booking-status">
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-dashboard-actions">
            <Link className="admin-action-card" to="/admin/bookings">
              <strong>Manage bookings</strong>
              <span>Review bookings and update their status.</span>
            </Link>

            <Link className="admin-action-card" to="/admin/packages">
              <strong>Manage packages</strong>
              <span>Update package prices, descriptions, and photos.</span>
            </Link>
          </section>
        </>
      )}
    </main>
  )
}
