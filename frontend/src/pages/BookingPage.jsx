import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

export default function BookingPage() {
  const { packageId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [packageInfo, setPackageInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    eventType: '',
    eventDate: '',
    venueAddress: '',
    notes: '',
    paymentMethod: 'CASH_ON_SITE',
  })

  useEffect(() => {
    fetch('http://localhost:5000/api/packages')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load packages')
        return response.json()
      })
      .then((items) => {
        const selected = items.find((item) => String(item.id) === packageId)
        if (!selected) throw new Error('That package could not be found.')
        setPackageInfo(selected)
      })
      .catch((requestError) => setMessage(requestError.message))
      .finally(() => setLoading(false))
  }, [packageId])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: Number(packageId),
          eventType: form.eventType,
          eventDate: new Date(form.eventDate).toISOString(),
          venueAddress: form.venueAddress,
          notes: form.notes,
          paymentMethod: form.paymentMethod,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Could not create booking')
      }

      const paymentStatus = result.paymentStatus || 'UNPAID'
      setMessage(`Booking confirmed, Payment status: ${paymentStatus}`)
      setForm({
        eventType: '',
        eventDate: '',
        venueAddress: '',
        notes: '',
        paymentMethod: 'CASH_ON_SITE',
      })

      Swal.fire({
        icon: 'success',
        title: 'Booking confirmed',
        text: `Booking confirmed, Payment status: ${paymentStatus}`,
        confirmButtonText: 'View My Bookings',
        confirmButtonColor: '#49372f',
        showCancelButton: true,
        cancelButtonText: 'Close',
        cancelButtonColor: '#8c8077',
      }).then((swalResult) => {
        if (swalResult.isConfirmed) {
          navigate('/my-bookings')
        }
      })
    } catch (requestError) {
      setMessage(requestError.message)
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: requestError.message || 'Could not create booking. Please try again.',
        confirmButtonColor: '#49372f',
      })
    }
  }

  if (loading) return <main className="container py-5">Loading package...</main>

  if (!packageInfo) {
    return (
      <main className="container py-5">
        <p className="alert alert-warning">{message}</p>
        <Link to="/">Back to packages</Link>
      </main>
    )
  }

  return (
    <main className="container booking-panel my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <Link to="/" className="text-muted">← Back to packages</Link>
              <h1 className="h3 mt-3">Book: {packageInfo.name}</h1>
              <p>Package price: <strong>{formatPrice(packageInfo.price)}</strong></p>

              <form onSubmit={handleSubmit}>
                <label className="form-label">Event type</label>
                <input
                  className="form-control mb-3"
                  placeholder="For example, Wedding"
                  value={form.eventType}
                  onChange={(event) =>
                    setForm({ ...form, eventType: event.target.value })
                  }
                  required
                />

                <label className="form-label">Event date and time</label>
                <input
                  className="form-control mb-3"
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(event) =>
                    setForm({ ...form, eventDate: event.target.value })
                  }
                  required
                />

                <label className="form-label">Venue address</label>
                <textarea
                  className="form-control mb-3"
                  value={form.venueAddress}
                  onChange={(event) =>
                    setForm({ ...form, venueAddress: event.target.value })
                  }
                  required
                />

                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-control mb-3"
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                />

                <label className="form-label">Payment preference</label>
                <select
                  className="form-select mb-3"
                  value={form.paymentMethod}
                  onChange={(event) =>
                    setForm({ ...form, paymentMethod: event.target.value })
                  }
                >
                  <option value="CASH_ON_SITE">Cash on site</option>
                  <option value="ONLINE">Online payment</option>
                </select>

                <button
                  className="btn text-white w-100 py-3 fw-bold rounded-pill shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--primary), #9333ea)' }}
                  type="submit"
                >
                  Confirm & Book Setup →
                </button>
              </form>

              {message && <p className="alert alert-info mt-3 mb-0">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}