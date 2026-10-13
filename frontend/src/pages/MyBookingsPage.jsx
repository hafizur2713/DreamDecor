import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

export default function MyBookingsPage() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/bookings/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load bookings')
        return result
      })
      .then(setBookings)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <main className="container py-5">
      <h1 className="h3 mb-4">My bookings</h1>

      {loading && <p>Loading bookings...</p>}
      {error && <p className="alert alert-warning">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p>
          You haven’t made any bookings yet. <Link to="/">Browse packages</Link>.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Package</th>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.decorationPackage?.name || 'Decoration package'}</td>
                  <td>{booking.eventType}</td>
                  <td>{new Date(booking.eventDate).toLocaleString()}</td>
                  <td>{booking.status}</td>
                  <td>{booking.paymentStatus}</td>
                  <td>{formatPrice(booking.priceAtBooking)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}