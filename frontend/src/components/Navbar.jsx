import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext.jsx'

const ASSAM_CITIES = [
  'Guwahati',
  'Silchar',
  'Dibrugarh',
  'Jorhat',
  'Tezpur',
  'Tinsukia',
  'Nagaon',
  'Sivasagar',
  'Bongaigaon',
  'Diphu',
  'North Lakhimpur',
  'Goalpara',
  'Kokrajhar',
  'Haflong',
  'Barpeta',
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCity, setSelectedCity] = useState('Guwahati')
  const [showCityModal, setShowCityModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Keep navbar hidden on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  // Handle Ctrl+K shortcut to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('nav-celebration-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}#packages`)
    }
  }

  function handleLogout() {
    Swal.fire({
      title: 'Log out?',
      text: 'Are you sure you want to log out of DreamDecor?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6d28d9',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        navigate('/')
      }
    })
  }

  function handleHelpClick() {
    Swal.fire({
      icon: 'info',
      title: 'Need Celebration Help?',
      html: `
        <p class="text-muted mb-2">Our decoration specialists are here to plan your setup:</p>
        <p class="fw-bold fs-5 mb-1" style="color: #6d28d9;">📞 +91 9395236443</p>
        <p class="small text-muted">WhatsApp / Call available 9 AM to 11 PM IST</p>
      `,
      confirmButtonColor: '#6d28d9',
      confirmButtonText: 'Got it, thank you!',
    })
  }

  function handleCartClick() {
    if (user) {
      navigate('/my-bookings')
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      <header className="seven-header">
        {/* Main Navbar Top Row (Screenshot 1) */}
        <div className="container py-2 d-flex align-items-center justify-content-between gap-3">
          {/* Logo & City Selector */}
          <div className="d-flex align-items-center gap-3 gap-lg-4">
            <Link to="/" className="seven-logo">
              <span className="seven-logo-main">DreamDecor</span>
              <span className="seven-logo-tagline">decor you trust</span>
            </Link>

            <button
              type="button"
              className="location-btn d-none d-md-flex"
              onClick={() => setShowCityModal(true)}
              title="Change setup city"
            >
              <span className="location-pin-icon">📍</span>
              <div>
                <span className="location-text-sub">Setting up in</span>
                <span className="location-text-main">
                  {selectedCity} <span style={{ fontSize: '0.65rem' }}>▼</span>
                </span>
              </div>
            </button>
          </div>

          {/* Search Pill (Screenshot 1) */}
          <form
            className="search-pill-wrapper flex-grow-1 mx-2 d-none d-sm-block"
            onSubmit={handleSearchSubmit}
          >
            <span className="search-pill-icon">🔍</span>
            <input
              id="nav-celebration-search"
              type="text"
              className="search-pill-input"
              placeholder="Find your next celebration"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-ctrl-badge">Ctrl K</span>
          </form>

          {/* Right Action Icons (Help, Sign in, Cart) */}
          <div className="d-flex align-items-center gap-1 gap-md-2">
            {/* Help */}
            <button
              type="button"
              className="header-action-item"
              onClick={handleHelpClick}
            >
              <span className="header-action-icon">🎧</span>
              <span>Help</span>
            </button>

            {/* Sign In / Account */}
            {user ? (
              <div className="dropdown">
                <button
                  type="button"
                  className="header-action-item dropdown-toggle"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={() => {
                    if (user.role === 'ADMIN') {
                      navigate('/admin/dashboard')
                    } else {
                      navigate('/my-bookings')
                    }
                  }}
                >
                  <span className="header-action-icon">👤</span>
                  <span>{user.name.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="header-action-item">
                <span className="header-action-icon">👤</span>
                <span>Sign in</span>
              </Link>
            )}

            {/* Cart */}
            <button
              type="button"
              className="header-action-item"
              onClick={handleCartClick}
              title="Cart / My Bookings"
            >
              <span
                className="header-action-icon"
                style={{ color: '#7c3aed' }}
              >
                🛍️
              </span>
              <span>Cart</span>
            </button>

            {user && (
              <button
                type="button"
                className="btn btn-sm btn-link text-danger text-decoration-none small p-0 ms-1 d-none d-lg-inline"
                onClick={handleLogout}
                title="Log out"
              >
                Log out
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="container pb-2 d-sm-none">
          <form className="search-pill-wrapper" onSubmit={handleSearchSubmit}>
            <span className="search-pill-icon">🔍</span>
            <input
              type="text"
              className="search-pill-input py-2"
              placeholder="Find your next celebration"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Sub-Navigation Strip (Screenshot 1) */}
        <div className="subnav-strip">
          <div className="container">
            <div className="d-flex align-items-center justify-content-start justify-content-md-center gap-1 gap-md-2 overflow-auto py-1">
              <a href="#birthday" className="subnav-link">
                Birthday ▾
              </a>
              <a href="#packages" className="subnav-link">
                Balloon Decor ▾
              </a>
              <a href="#anniversary" className="subnav-link">
                Anniversary ▾
              </a>
              <a href="#kids" className="subnav-link">
                Baby & Kids ▾
              </a>
              <a href="#wedding" className="subnav-link">
                Wedding ▾
              </a>
              <button
                type="button"
                className="subnav-link border-0 bg-transparent"
                onClick={() => setShowCityModal(true)}
              >
                Assam Cities <span className="cities-badge-purple">15</span> ▾
              </button>
              <a href="#more" className="subnav-link">
                More ▾
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Select City Modal */}
      {showCityModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom px-4 pt-4">
                <div>
                  <span className="text-muted small">Setting up in</span>
                  <h5 className="modal-title fw-bold">Select City in Assam</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCityModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  DreamDecor provides certified decorators with same-day setup in Assam:
                </p>
                <div className="row g-2">
                  {ASSAM_CITIES.map((city) => (
                    <div key={city} className="col-6 col-sm-4">
                      <button
                        type="button"
                        className={`btn w-100 py-2 small fw-semibold text-start rounded-3 ${
                          selectedCity === city
                            ? 'btn-dark'
                            : 'btn-outline-light text-dark border'
                        }`}
                        onClick={() => {
                          setSelectedCity(city)
                          setShowCityModal(false)
                        }}
                      >
                        📍 {city}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}