import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router'

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString('en-IN')}`
}

function calculateMrp(price, pct = 15) {
  const p = Number(price || 0)
  return `₹${Math.round(p * (1 + pct / 100)).toLocaleString('en-IN')}`
}

function getPhotoUrl(url) {
  if (!url) {
    return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80'
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `http://localhost:5000${url}`
}

// 6 Top Balloon Decoration Categories (Screenshot 2)
const TOP_CATEGORIES = [
  {
    id: 'cat-birthday',
    name: 'Birthday Decor',
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    target: '#birthday',
  },
  {
    id: 'cat-kids',
    name: 'Kids Birthday',
    img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    target: '#kids',
  },
  {
    id: 'cat-newborn',
    name: 'Newborn Welcome',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    target: '#kids',
  },
  {
    id: 'cat-baby-shower',
    name: 'Baby Shower',
    img: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=600&q=80',
    target: '#kids',
  },
  {
    id: 'cat-romantic',
    name: 'Romantic',
    img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
    target: '#anniversary',
  },
  {
    id: 'cat-wedding',
    name: 'Wedding Decor',
    img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
    target: '#wedding',
  },
]

// 6 Kids Special Categories (Screenshot 4)
const KIDS_SPECIAL_CATEGORIES = [
  {
    id: 'kids-baby',
    name: 'Baby Ceremony',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kids-first',
    name: '1st Birthday',
    img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kids-activity',
    name: 'Kids Activity',
    img: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kids-stage',
    name: 'Stage Decor',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kids-annaprashan',
    name: 'Annaprashan',
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kids-naming',
    name: 'Naming Ceremony',
    img: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80',
  },
]

// Auto Carousel Hero Slides
const HERO_SLIDES = [
  {
    id: 'slide-1',
    gradient: 'linear-gradient(135deg, #f4ebff 0%, #ebe0fd 55%, #f5effe 100%)',
    themeColor: '#6d28d9',
    eyebrow: "✦ INDIA'S ✦",
    title: 'NO.1',
    badge: 'DECORATION WEBSITE',
    features: [
      { icon: '👥', label: 'Trusted by', value: '5 Lacs+ Users' },
      { icon: '🚚', label: 'Fast & Prompt', value: 'Same Day Service' },
    ],
    ctaText: 'Explore Top Packages →',
    ctaLink: '#packages',
    image: '/hero-ambassador.jpg',
    imageAlt: "India's No. 1 Decoration Ambassador",
    isAmbassador: true,
  },
  {
    id: 'slide-2',
    gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)',
    themeColor: '#ea580c',
    eyebrow: '🎈 BIRTHDAY SPECIAL 🎈',
    title: 'POP & GLOW',
    badge: 'SETUPS STARTING @ ₹1,499',
    features: [
      { icon: '✨', label: 'Balloon Themes', value: 'Pastel & Metallic' },
      { icon: '⚡', label: 'Speed Setup', value: '2-Hour Guarantee' },
    ],
    ctaText: 'View Birthday Decor →',
    ctaLink: '#birthday',
    image: '/hero-birthday.jpg',
    imageAlt: 'Birthday Balloon Celebration Setup',
    isAmbassador: false,
  },
  {
    id: 'slide-3',
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fae8ff 100%)',
    themeColor: '#db2777',
    eyebrow: '💖 ROMANTIC SURPRISES 💖',
    title: 'MAGIC NIGHTS',
    badge: 'CABANA & CANDLELIGHT',
    features: [
      { icon: '🌹', label: 'Fresh Florals', value: 'Rose Petal Aisle' },
      { icon: '🕯️', label: 'Warm Ambiance', value: 'Fairy Light Canopy' },
    ],
    ctaText: 'Book Romantic Setup →',
    ctaLink: '#anniversary',
    image: '/hero-anniversary.jpg',
    imageAlt: 'Romantic Anniversary Canopy Setup',
    isAmbassador: false,
  },
]

export default function HomePage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const location = useLocation()

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-cycle carousel every 4.5 seconds
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused])

  // References for horizontal scrolling rows
  const birthdayRowRef = useRef(null)
  const anniversaryRowRef = useRef(null)

  const searchParams = new URLSearchParams(location.search)
  const queryParam = searchParams.get('q') || ''

  useEffect(() => {
    fetch('http://localhost:5000/api/packages')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load packages')
        return res.json()
      })
      .then((data) => setPackages(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not connect to backend server.'))
      .finally(() => setLoading(false))
  }, [])

  function scrollRow(ref, direction) {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Filtered packages when search query is active
  const filteredPackages = useMemo(() => {
    if (!queryParam.trim()) return packages
    const q = queryParam.toLowerCase().trim()
    return packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(q) ||
        (pkg.description && pkg.description.toLowerCase().includes(q)),
    )
  }, [packages, queryParam])

  // Birthday items (Screenshot 3)
  const birthdayPackages = useMemo(() => {
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes('birthday') ||
        p.name.toLowerCase().includes('hall') ||
        p.name.toLowerCase().includes('indoor'),
    )
  }, [packages])

  // Romantic Anniversary items (Screenshot 4)
  const romanticPackages = useMemo(() => {
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes('anniversary') ||
        p.name.toLowerCase().includes('romantic') ||
        p.name.toLowerCase().includes('love') ||
        p.name.toLowerCase().includes('heart'),
    )
  }, [packages])

  function renderCard(pkg, defaultDiscount = '12% OFF', defaultRating = '4.9', defaultReviews = '450') {
    const photo =
      pkg.images && pkg.images.length > 0
        ? getPhotoUrl(pkg.images[0].url)
        : getPhotoUrl(pkg.imageUrl)

    // Format review data
    const rating = pkg.name.includes('Simple Hall') ? '5.0' : pkg.name.includes('Room') ? '4.6' : '4.8'
    const reviews = pkg.name.includes('Simple Birthday Decoration at Home') ? '472' : '450+'

    return (
      <div key={pkg.id} style={{ minWidth: '225px', maxWidth: '245px', flex: '0 0 auto' }}>
        <Link to={`/packages/${pkg.id}`} className="card-seven">
          <div className="card-seven-thumb">
            <img src={photo} alt={pkg.name} loading="lazy" />
          </div>

          <div className="card-seven-body">
            <h3 className="card-seven-title">{pkg.name}</h3>

            <div className="card-seven-rating-row">
              <span className="badge-green-solid">★ {rating}</span>
              <span className="rating-count-text">{reviews} reviews</span>
            </div>

            <div className="card-seven-price-row">
              <div className="card-seven-prices">
                <span className="price-bold">{formatPrice(pkg.price)}</span>
                <span className="price-mrp">{calculateMrp(pkg.price, 14)}</span>
              </div>
              <span className="badge-discount-green">{defaultDiscount}</span>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <main className="container pb-5">
      {/* ===================================================
          1. Hero Section Auto Carousel Banner
         =================================================== */}
      <section
        className="hero-banner-seven-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="hero-carousel-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="hero-carousel-slide p-4 p-md-5"
              style={{ background: slide.gradient }}
            >
              {/* Dotted Grid Accents */}
              <div className="dotted-grid-decor dotted-grid-top-right"></div>
              <div className="dotted-grid-decor dotted-grid-bottom-left"></div>

              <div className="row align-items-center g-4">
                {/* Left Hero Content */}
                <div className="col-lg-7 col-md-7 ps-md-4">
                  <div className="hero-sparkle-eyebrow">
                    <span>{slide.eyebrow}</span>
                  </div>

                  <div className="hero-giant-no1" style={{ color: slide.themeColor }}>
                    {slide.title}
                  </div>

                  <div>
                    <span className="hero-pill-badge">{slide.badge}</span>
                  </div>

                  <div className="hero-features-row mb-4">
                    {slide.features.map((feat, idx) => (
                      <div key={idx} className="hero-feature-item">
                        <div
                          className="hero-feature-icon-circle"
                          style={{ background: slide.themeColor }}
                        >
                          {feat.icon}
                        </div>
                        <div>
                          <span className="hero-feature-label">{feat.label}</span>
                          <span className="hero-feature-value">{feat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <a
                      href={slide.ctaLink}
                      className="btn hero-cta-btn"
                      style={{ background: slide.themeColor }}
                    >
                      {slide.ctaText}
                    </a>
                  </div>
                </div>

                {/* Right Hero Content */}
                <div className="col-lg-5 col-md-5 text-center">
                  {slide.isAmbassador ? (
                    <div className="hero-ambassador-wrapper">
                      <div className="hero-ambassador-circle-glow"></div>
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        className="hero-ambassador-img"
                      />
                    </div>
                  ) : (
                    <div className="hero-slide-image-wrapper">
                      <div
                        className="hero-slide-glow"
                        style={{ background: slide.themeColor }}
                      ></div>
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        className="hero-slide-img-rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Button */}
        <button
          type="button"
          className="hero-carousel-nav-btn hero-carousel-prev"
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
            )
          }
          aria-label="Previous slide"
        >
          ‹
        </button>

        {/* Next Button */}
        <button
          type="button"
          className="hero-carousel-nav-btn hero-carousel-next"
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
          }
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Indicators Dots */}
        <div className="hero-carousel-dots">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-dot-btn ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                backgroundColor:
                  currentSlide === idx ? slide.themeColor : undefined,
              }}
            />
          ))}
        </div>
      </section>

      {/* If Search is Active */}
      {queryParam && (
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-4 rounded-3">
          <div>
            Showing search results for: <strong>"{queryParam}"</strong> ({filteredPackages.length} packages found)
          </div>
          <Link to="/" className="btn btn-sm btn-outline-dark">
            Clear Search
          </Link>
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Loading celebrations...</p>
        </div>
      )}

      {error && <p className="alert alert-warning text-center mt-4">{error}</p>}

      {/* Render Search Results */}
      {!loading && queryParam && (
        <section id="packages" className="py-3">
          <div className="row g-4">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="col-6 col-md-4 col-lg-3">
                {renderCard(pkg)}
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && !queryParam && (
        <>
          {/* ===================================================
              2. Top Balloon Decoration Categories (Screenshot 2)
             =================================================== */}
          <section className="py-4 my-2">
            <div>
              <h2 className="section-title-seven">Top Balloon Decoration Categories</h2>
              <div className="section-subtitle-seven">Trusted Decorators for All Events</div>
            </div>

            <div className="row g-3 g-md-4 mt-1">
              {TOP_CATEGORIES.map((cat) => (
                <div key={cat.id} className="col-4 col-md-2">
                  <a href={cat.target} className="category-card-warm">
                    <div className="category-thumb-warm">
                      <img src={cat.img} alt={cat.name} loading="lazy" />
                    </div>
                    <span className="category-label-seven">{cat.name}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ===================================================
              3. Birthday Balloon Decoration (Screenshot 3)
             =================================================== */}
          <section id="birthday" className="py-4 my-2">
            <div className="d-flex align-items-end justify-content-between mb-3">
              <div>
                <h2 className="section-title-seven">Birthday Balloon Decoration</h2>
              </div>
              <div className="d-flex align-items-center gap-3">
                <a
                  href="#packages"
                  className="text-decoration-none fw-bold small"
                  style={{ color: '#7c3aed' }}
                >
                  View all →
                </a>
                <div className="section-nav-arrows">
                  <button
                    type="button"
                    className="btn-arrow-circle"
                    onClick={() => scrollRow(birthdayRowRef, 'left')}
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn-arrow-circle"
                    onClick={() => scrollRow(birthdayRowRef, 'right')}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Row (Screenshot 3) */}
            <div
              ref={birthdayRowRef}
              className="d-flex gap-3 overflow-auto pb-3"
              style={{ scrollbarWidth: 'none' }}
            >
              {birthdayPackages.map((pkg) => renderCard(pkg, '11% OFF'))}
            </div>
          </section>

          {/* ===================================================
              4. Kids Special (Screenshot 4)
             =================================================== */}
          <section id="kids" className="py-4 my-2">
            <div>
              <h2 className="section-title-seven">Kids Special</h2>
            </div>

            <div className="row g-3 g-md-4 mt-2">
              {KIDS_SPECIAL_CATEGORIES.map((cat) => (
                <div key={cat.id} className="col-4 col-md-2">
                  <a href="#kids-packages" className="category-card-warm">
                    <div className="category-thumb-purple">
                      <img src={cat.img} alt={cat.name} loading="lazy" />
                    </div>
                    <span className="category-label-seven">{cat.name}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ===================================================
              5. Romantic Anniversary Decoration (Screenshot 4)
             =================================================== */}
          <section id="anniversary" className="py-4 my-2">
            <div className="d-flex align-items-end justify-content-between mb-3">
              <div>
                <h2 className="section-title-seven">Romantic Anniversary Decoration</h2>
              </div>
              <div className="section-nav-arrows">
                <button
                  type="button"
                  className="btn-arrow-circle"
                  onClick={() => scrollRow(anniversaryRowRef, 'left')}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="btn-arrow-circle"
                  onClick={() => scrollRow(anniversaryRowRef, 'right')}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Row (Screenshot 4) */}
            <div
              ref={anniversaryRowRef}
              className="d-flex gap-3 overflow-auto pb-3"
              style={{ scrollbarWidth: 'none' }}
            >
              {romanticPackages.map((pkg) => renderCard(pkg, '16% OFF'))}
            </div>
          </section>

          {/* ===================================================
              6. All Packages Grid
             =================================================== */}
          <section id="packages" className="py-5 mt-2 border-top">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="section-title-seven">All Decoration Packages ({packages.length})</h2>
                <div className="section-subtitle-seven">
                  Handcrafted setups available for same-day booking
                </div>
              </div>
            </div>

            <div className="row g-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="col-6 col-md-4 col-lg-3">
                  {renderCard(pkg)}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}