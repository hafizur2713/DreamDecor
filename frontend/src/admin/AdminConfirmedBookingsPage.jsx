import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext.jsx'

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString('en-IN')}`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminConfirmedBookingsPage() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadBookings() {
    try {
      const response = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Could not load bookings')
      }

      const all = Array.isArray(result) ? result : []
      setTotalCount(all.length)
      setPendingCount(all.filter((b) => b.status === 'PENDING').length)
      setBookings(all.filter((b) => b.status === 'CONFIRMED'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadBookings()
    } else {
      setLoading(false)
      setError('Please log in as admin.')
    }
  }, [token])

  async function updateBookingStatus(bookingId, newStatus) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      )

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Could not update status')
      }

      if (newStatus !== 'CONFIRMED') {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      }

      Swal.fire({
        icon: 'success',
        title: `Booking #${bookingId} Updated`,
        text: `Status changed to ${newStatus}.`,
        timer: 1400,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: err.message,
        confirmButtonColor: '#49372f',
      })
    }
  }

  return (
    <main className="container py-5">
      {/* Top Navigation */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-muted text-decoration-none small"
          >
            ← Back to dashboard
          </Link>
          <p className="admin-dashboard-eyebrow mt-1 mb-0">DreamDecor administration</p>
          <h1 className="h2 mb-1">Confirmed bookings</h1>
          <p className="text-muted mb-0">
            Active and approved bookings scheduled for upcoming celebrations.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link className="btn btn-outline-dark btn-sm" to="/admin/packages">
            Manage packages
          </Link>
          <Link className="btn btn-outline-dark btn-sm" to="/">
            Back to store
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom mb-4 gap-2">
        <Link
          to="/admin/bookings"
          className="btn btn-link text-decoration-none text-muted py-2 px-3 fw-semibold"
        >
          All bookings ({totalCount})
        </Link>
        <Link
          to="/admin/bookings/pending"
          className="btn btn-link text-decoration-none text-muted py-2 px-3 fw-semibold"
        >
          Awaiting review ({pendingCount})
        </Link>
        <Link
          to="/admin/bookings/confirmed"
          className="btn btn-link text-decoration-none text-dark border-bottom border-dark border-2 py-2 px-3 fw-bold"
        >
          Confirmed bookings ({bookings.length})
        </Link>
      </div>

      {loading && <p>Loading confirmed bookings...</p>}
      {error && <p className="alert alert-warning">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
          <div className="fs-1 text-muted mb-2">✦</div>
          <h3 className="h5 fw-bold text-dark">No confirmed bookings yet</h3>
          <p className="text-muted mb-4">
            Pending booking requests will appear here once approved.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link className="btn btn-outline-dark btn-sm" to="/admin/bookings/pending">
              Check pending requests ({pendingCount})
            </Link>
            <Link className="btn btn-dark btn-sm" to="/admin/dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Confirmed Bookings List */}
      {!loading && bookings.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="card border-0 shadow-sm rounded-4 overflow-hidden"
              style={{ borderLeft: '5px solid #16a34a' }}
            >
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <span className="badge bg-success px-3 py-2 rounded-pill fw-semibold me-2">
                      ✓ Confirmed
                    </span>
                    <span className="text-muted small">Booking #{booking.id}</span>
                    <h2 className="h5 fw-bold mt-2 mb-0 text-dark">
                      {booking.decorationPackage?.name || 'Decoration Package'}
                    </h2>
                  </div>

                  <div className="text-sm-end">
                    <div className="fs-4 fw-bold" style={{ color: '#754d35' }}>
                      {formatPrice(booking.priceAtBooking)}
                    </div>
                    <span className="badge bg-light text-dark border">
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="row g-3 py-3 border-top border-bottom my-2 bg-light rounded-3 px-2">
                  <div className="col-md-4">
                    <span className="text-muted small d-block">Customer</span>
                    <strong className="text-dark">{booking.user?.name || 'Customer'}</strong>
                    <div className="small text-muted">{booking.user?.email}</div>
                    {booking.user?.phone && (
                      <div className="small text-muted">{booking.user.phone}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <span className="text-muted small d-block">Event details</span>
                    <strong className="text-dark">{booking.eventType}</strong>
                    <div className="small text-secondary">{formatDate(booking.eventDate)}</div>
                  </div>

                  <div className="col-md-4">
                    <span className="text-muted small d-block">Venue</span>
                    <div className="small text-dark text-break">
                      {booking.venueAddress || 'Address not specified'}
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-3 mt-2 p-2 bg-white rounded border-start border-3 border-secondary small text-muted">
                    <strong>Customer note:</strong> {booking.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3 pt-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">Change status:</span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="PENDING">Revert to PENDING</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm px-3 fw-semibold"
                    style={{ backgroundColor: '#49372f', borderColor: '#49372f' }}
                    onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                  >
                    Mark Event Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
