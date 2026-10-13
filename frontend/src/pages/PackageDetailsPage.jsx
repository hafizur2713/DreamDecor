import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

const API = 'http://localhost:5000'

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString('en-IN')}`
}

function calculateMrp(price) {
  return `₹${Math.round(Number(price || 0) * 1.4).toLocaleString('en-IN')}`
}

function getPhotoUrl(url) {
  if (!url) {
    return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80'
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API}${url}`
}

export default function PackageDetailsPage() {
  const { packageId } = useParams()
  const [packageInfo, setPackageInfo] = useState(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/api/packages`)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load packages')
        return response.json()
      })
      .then((packages) => {
        const selected = packages.find((item) => String(item.id) === packageId)
        if (!selected) throw new Error('Package not found.')
        setPackageInfo(selected)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [packageId])

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading package details...</p>
      </main>
    )
  }

  if (error || !packageInfo) {
    return (
      <main className="container py-5 text-center">
        <div className="alert alert-warning d-inline-block px-4 py-3 rounded-4">
          {error || 'Package not found.'}
        </div>
        <div className="mt-3">
          <Link to="/" className="btn btn-dark rounded-pill px-4">
            ← Back to all packages
          </Link>
        </div>
      </main>
    )
  }

  const photos =
    packageInfo.images && packageInfo.images.length > 0
      ? packageInfo.images
      : packageInfo.imageUrl
        ? [{ url: packageInfo.imageUrl, altText: packageInfo.name }]
        : [{ url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' }]

  return (
    <main className="container py-5">
      <Link to="/" className="text-muted text-decoration-none small fw-semibold">
        ← Back to packages
      </Link>

      <div className="row g-5 mt-1 align-items-start">
        {/* Photo Gallery Column */}
        <div className="col-lg-6">
          <div className="card border-0 rounded-4 overflow-hidden shadow-sm bg-white p-2">
            <div
              style={{
                height: '420px',
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
              }}
            >
              <img
                src={getPhotoUrl(photos[photoIndex]?.url)}
                alt={packageInfo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {photos.length > 1 && (
              <div className="d-flex gap-2 mt-3 overflow-auto pb-1">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn p-0 rounded-3 border-2 overflow-hidden ${
                      idx === photoIndex ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ width: '70px', height: '70px', flexShrink: 0 }}
                    onClick={() => setPhotoIndex(idx)}
                  >
                    <img
                      src={getPhotoUrl(p.url)}
                      alt="thumb"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details & Booking Column */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-warning text-dark px-3 py-1 rounded-pill small fw-bold">
              ★ 4.9 (1.4k Reviews)
            </span>
            <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small fw-bold">
              ✓ Verified Bestseller
            </span>
          </div>

          <h1 className="h2 fw-bold text-dark mb-2">{packageInfo.name}</h1>
          <p className="text-muted leading-relaxed mb-4">{packageInfo.description}</p>

          {/* Pricing Box */}
          <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-subtle)' }}>
            <div className="d-flex align-items-baseline gap-3">
              <span className="fs-2 fw-extrabold text-dark" style={{ color: 'var(--primary)' }}>
                {formatPrice(packageInfo.price)}
              </span>
              <span className="text-muted text-decoration-line-through">
                {calculateMrp(packageInfo.price)}
              </span>
              <span className="badge bg-success text-white px-2 py-1 rounded">
                30% OFF
              </span>
            </div>
            <div className="small text-muted mt-1">
              Inclusive of all taxes, materials & professional decorator charges.
            </div>
          </div>

          {/* Detailed Inclusions */}
          {packageInfo.details && (
            <div className="mb-4">
              <h2 className="h6 fw-bold text-dark text-uppercase tracking-wider mb-2">
                What's Included in This Setup:
              </h2>
              <div className="p-3 bg-white rounded-3 border small text-secondary leading-relaxed">
                {packageInfo.details}
              </div>
            </div>
          )}

          {/* Quality Guarantees */}
          <div className="row g-2 mb-4">
            <div className="col-6">
              <div className="p-2 bg-light rounded-3 small text-dark d-flex align-items-center gap-2">
                <span>⚡</span> <strong>2-Hour Setup</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="p-2 bg-light rounded-3 small text-dark d-flex align-items-center gap-2">
                <span>🛡️</span> <strong>Certified Decorator</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="p-2 bg-light rounded-3 small text-dark d-flex align-items-center gap-2">
                <span>🎈</span> <strong>Premium Metallic Foil</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="p-2 bg-light rounded-3 small text-dark d-flex align-items-center gap-2">
                <span>🔄</span> <strong>Free Rescheduling</strong>
              </div>
            </div>
          </div>

          {/* Booking CTA */}
          <Link
            to={`/booking/${packageInfo.id}`}
            className="btn btn-lg w-100 py-3 fw-bold rounded-pill text-white shadow"
            style={{ background: 'linear-gradient(135deg, var(--primary), #9333ea)' }}
          >
            Book This Package Now →
          </Link>
        </div>
      </div>
    </main>
  )
}
