import { useLocation, Link } from 'react-router'

export default function Footer() {
  const location = useLocation()

  // Hide footer on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="seven-footer-wrapper">
      {/* 1. Top Trust Features Bar */}
      <div className="seven-trust-bar">
        <div className="container">
          <div className="row g-4 align-items-center">
            {/* Feature 1: 10L+ Celebrations */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="seven-trust-item">
                <div className="seven-trust-icon-box trust-yellow">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <h6 className="seven-trust-title">10L+ Celebrations</h6>
                  <p className="seven-trust-sub">Loved by customers India-wide</p>
                </div>
              </div>
            </div>

            {/* Feature 2: Verified Decorators */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="seven-trust-item">
                <div className="seven-trust-icon-box trust-purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h6 className="seven-trust-title">Verified Decorators</h6>
                  <p className="seven-trust-sub">Trained &amp; background-checked</p>
                </div>
              </div>
            </div>

            {/* Feature 3: On-Time, Guaranteed */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="seven-trust-item">
                <div className="seven-trust-icon-box trust-blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h6 className="seven-trust-title">On-Time, Guaranteed</h6>
                  <p className="seven-trust-sub">Setup within your time slot</p>
                </div>
              </div>
            </div>

            {/* Feature 4: 100% Secure Payments */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="seven-trust-item">
                <div className="seven-trust-icon-box trust-green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h6 className="seven-trust-title">100% Secure Payments</h6>
                  <p className="seven-trust-sub">Easy refunds, no hidden charges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 4-Column Footer */}
      <div className="seven-main-footer">
        <div className="container">
          <div className="row g-4 g-lg-5">
            {/* Column 1: Brand & Contact */}
            <div className="col-12 col-lg-5">
              <Link to="/" className="seven-logo mb-3 d-inline-flex">
                <span className="seven-logo-main">DreamDecor</span>
                <span className="seven-logo-tagline">decor you trust</span>
              </Link>

              <p className="seven-footer-desc">
                India&apos;s trusted home decoration service — birthdays, anniversaries, weddings &amp; more.
                Serving 40+ cities with professional setups.
              </p>

              <div className="seven-footer-contact">
                <a href="tel:+919395236443" className="seven-contact-phone">
                  +91 9395236443
                </a>
                <a href="mailto:info@dreamdecor.com" className="seven-contact-email">
                  info@dreamdecor.com
                </a>
              </div>

              {/* Social Round Buttons */}
              <div className="seven-social-icons">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="seven-social-btn" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="seven-social-btn" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="seven-social-btn" aria-label="YouTube">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="seven-social-btn" aria-label="X">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="seven-social-btn" aria-label="LinkedIn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: TOP CATEGORIES */}
            <div className="col-6 col-md-6 col-lg-3 ms-lg-auto">
              <h5 className="seven-col-heading">TOP CATEGORIES</h5>
              <ul className="seven-footer-list">
                <li><Link to="/#packages">Birthday Decoration</Link></li>
                <li><Link to="/#packages">Anniversary Decoration</Link></li>
                <li><Link to="/#packages">Baby Shower</Link></li>
                <li><Link to="/#packages">Welcome Baby</Link></li>
                <li><Link to="/#packages">Kids Theme</Link></li>
                <li><Link to="/#packages">Balloon Decoration</Link></li>
                <li><Link to="/#packages">First Night Decoration</Link></li>
              </ul>
            </div>

            {/* Column 3: COMPANY */}
            <div className="col-6 col-md-6 col-lg-3">
              <h5 className="seven-col-heading">COMPANY</h5>
              <ul className="seven-footer-list">
                <li><Link to="/">About Us</Link></li>
                <li><Link to="/">Contact Us</Link></li>
                <li><Link to="/">Terms &amp; Conditions</Link></li>
                <li><Link to="/">Return &amp; Refund</Link></li>
                <li><Link to="/">Privacy Policy</Link></li>
                <li><Link to="/">Disclaimer</Link></li>
                <li><Link to="/">Sitemap</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Subtle bottom bar */}
      <div className="seven-bottom-bar">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span>&copy; {new Date().getFullYear()} DreamDecor Experiences Pvt. Ltd. All rights reserved.</span>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-decoration-none">Terms</Link>
            <span>&bull;</span>
            <Link to="/" className="text-decoration-none">Privacy</Link>
            <span>&bull;</span>
            <Link to="/" className="text-decoration-none">Refunds</Link>
          </div>
        </div>
      </div>

      {/* 4. Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/919395236443?text=Hi%20DreamDecor%2C%20I%20would%20like%20to%20inquire%20about%20a%20celebration%20setup"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <span className="floating-whatsapp-pulse"></span>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12.01 2.01c-5.5 0-9.98 4.47-9.98 9.97 0 1.76.46 3.47 1.33 4.99L2 22.01l5.17-1.33c1.47.8 3.13 1.23 4.84 1.23 5.5 0 9.98-4.47 9.98-9.97 0-5.5-4.48-9.97-9.98-9.97zm0 18.23c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.2.82.85-3.1-.2-.32a8.217 8.217 0 0 1-1.26-4.42c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.02 2.58c.12.17 1.75 2.68 4.25 3.75.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
        </svg>
      </a>
    </footer>
  )
}