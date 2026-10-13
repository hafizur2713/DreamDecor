import { useEffect, useState } from 'react'
import { Link } from 'react-router'
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

export default function AdminBookingsPage() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  async function loadBookings() {
    try {
      const response = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load bookings')
      setBookings(Array.isArray(result) ? result : [])
    } catch (requestError) {
      setError(requestError.message)
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

  async function changeStatus(bookingId, status) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      )

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Could not update booking status')
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: result.status }
            : booking,
        ),
      )

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Booking #${bookingId} status changed to ${result.status}`,
        timer: 1400,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      })
    } catch (requestError) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: requestError.message,
        confirmButtonColor: '#49372f',
      })
    }
  }

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === 'ALL' || b.status === statusFilter

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.decorationPackage?.name?.toLowerCase().includes(q) ||
      b.eventType?.toLowerCase().includes(q) ||
      String(b.id).includes(q)

    return matchesStatus && matchesSearch
  })

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'PENDING':
        return 'bg-warning text-dark'
      case 'CONFIRMED':
        return 'bg-success text-white'
      case 'COMPLETED':
        return 'bg-primary text-white'
      case 'CANCELLED':
        return 'bg-danger text-white'
      default:
        return 'bg-secondary text-white'
    }
  }

  return (
    <main className="container py-5">
      {/* Top Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-muted text-decoration-none small"
          >
            ← Back to dashboard
          </Link>
          <p className="admin-dashboard-eyebrow mt-1 mb-0">DreamDecor administration</p>
          <h1 className="h2 mb-1">Total bookings</h1>
          <p className="text-muted mb-0">
            Complete list of all customer decoration bookings.
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
          className="btn btn-link text-decoration-none text-dark border-bottom border-dark border-2 py-2 px-3 fw-bold"
        >
          All bookings ({bookings.length})
        </Link>
        <Link
          to="/admin/bookings/pending"
          className="btn btn-link text-decoration-none text-muted py-2 px-3 fw-semibold"
        >
          Awaiting review ({pendingCount})
        </Link>
        <Link
          to="/admin/bookings/confirmed"
          className="btn btn-link text-decoration-none text-muted py-2 px-3 fw-semibold"
        >
          Confirmed bookings ({confirmedCount})
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search by customer name, email, package or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="PENDING">PENDING ({pendingCount})</option>
            <option value="CONFIRMED">CONFIRMED ({confirmedCount})</option>
            <option value="COMPLETED">
              COMPLETED ({bookings.filter((b) => b.status === 'COMPLETED').length})
            </option>
            <option value="CANCELLED">
              CANCELLED ({bookings.filter((b) => b.status === 'CANCELLED').length})
            </option>
          </select>
        </div>
      </div>

      {loading && <p>Loading bookings...</p>}
      {error && <p className="alert alert-warning">{error}</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="text-muted">No bookings found in database.</p>
      )}

      {/* Bookings Table */}
      {!loading && filteredBookings.length > 0 && (
        <div className="table-responsive bg-white rounded-4 border shadow-sm p-3">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#ID</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Event Type & Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="text-muted small">#{booking.id}</td>
                  <td>
                    <strong className="text-dark d-block">
                      {booking.user?.name || 'Customer'}
                    </strong>
                    <small className="text-muted d-block">{booking.user?.email}</small>
                    {booking.user?.phone && (
                      <small className="text-muted">{booking.user.phone}</small>
                    )}
                  </td>
                  <td>
                    <strong>{booking.decorationPackage?.name || 'Package'}</strong>
                    {booking.venueAddress && (
                      <div className="small text-muted text-truncate" style={{ maxWidth: '220px' }}>
                        📍 {booking.venueAddress}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{booking.eventType}</div>
                    <small className="text-muted">{formatDate(booking.eventDate)}</small>
                  </td>
                  <td>
                    <strong style={{ color: '#754d35' }}>
                      {formatPrice(booking.priceAtBooking)}
                    </strong>
                    <div className="small text-muted">{booking.paymentStatus}</div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: '130px' }}
                      value={booking.status}
                      onChange={(event) =>
                        changeStatus(booking.id, event.target.value)
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
        <div className="p-4 bg-white rounded-4 border text-center text-muted">
          No bookings match your search query or filter.
        </div>
      )}
    </main>
  )
}