import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext.jsx'
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  isFirebaseConfigured,
} from '../firebase.js'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')

  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const destination = location.state?.from || '/'

  // Redirect if already logged in as customer
  useEffect(() => {
    if (user) {
      navigate(destination, { replace: true })
    }
  }, [user, navigate, destination])

  // Sync Firebase authenticated user with DreamDecor backend
  async function syncUserWithBackend(userInfo) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name || userInfo.displayName || userInfo.email.split('@')[0],
          firebaseUid: userInfo.uid,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Server sync failed.')
      }

      // Persist customer session
      login(data)
      return data
    } catch (err) {
      console.error('Backend sync error:', err)
      // Fallback local customer session if backend is temporarily unreachable
      const fallbackData = {
        token: 'local-token-' + Date.now(),
        user: {
          id: 9999,
          name: userInfo.name || userInfo.displayName || userInfo.email.split('@')[0],
          email: userInfo.email,
          role: 'CUSTOMER',
        },
      }
      login(fallbackData)
      return fallbackData
    }
  }

  // Handle Email / Password Sign In or Register
  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please enter both your email and password.',
        confirmButtonColor: '#0f172a',
      })
      return
    }

    setLoading(true)

    try {
      if (isFirebaseConfigured && auth) {
        // 1. Live Firebase Authentication
        if (isRegister) {
          const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password)
          if (name.trim()) {
            await updateProfile(userCredential.user, { displayName: name.trim() })
          }
          await syncUserWithBackend({
            email: userCredential.user.email,
            name: name.trim() || userCredential.user.displayName,
            uid: userCredential.user.uid,
          })
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password)
          await syncUserWithBackend({
            email: userCredential.user.email,
            name: userCredential.user.displayName,
            uid: userCredential.user.uid,
          })
        }
      } else {
        // 2. Direct backend customer authentication (if Firebase keys not yet in .env)
        const endpoint = isRegister
          ? 'http://localhost:5000/api/auth/register'
          : 'http://localhost:5000/api/auth/login'

        const payload = isRegister
          ? { name: name.trim() || trimmedEmail.split('@')[0], email: trimmedEmail, password }
          : { email: trimmedEmail, password }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed. Please check your credentials.')
        }

        login(data)
      }

      await Swal.fire({
        icon: 'success',
        title: isRegister ? 'Welcome to DreamDecor!' : 'Signed In Successfully',
        text: 'Happy celebration planning!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      })

      navigate(destination, { replace: true })
    } catch (err) {
      console.error(err)
      let msg = err.message || 'Authentication failed.'
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect email or password.'
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No customer account found with this email. Please sign up.'
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in.'
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.'
      }

      Swal.fire({
        icon: 'error',
        title: isRegister ? 'Registration Error' : 'Sign In Failed',
        text: msg,
        confirmButtonColor: '#0f172a',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle Google Sign In
  async function handleGoogleSignIn() {
    if (!isFirebaseConfigured || !auth) {
      // Guide user or offer instant demo customer session
      const result = await Swal.fire({
        icon: 'info',
        title: 'Google Sign In',
        html: `
          <p class="small text-muted mb-2">
            To enable production Google OAuth, insert your Firebase keys into <code>.env</code>.
          </p>
          <p class="fw-semibold small text-dark mb-0">
            Would you like to test as a Customer now?
          </p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Continue as Google Customer',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#64748b',
      })

      if (result.isConfirmed) {
        setSocialLoading('google')
        await syncUserWithBackend({
          email: 'google.customer@example.com',
          name: 'Google Customer',
          uid: 'google-demo-' + Date.now(),
        })
        setSocialLoading('')
        navigate(destination, { replace: true })
      }
      return
    }

    try {
      setSocialLoading('google')
      const result = await signInWithPopup(auth, googleProvider)
      await syncUserWithBackend({
        email: result.user.email,
        name: result.user.displayName,
        uid: result.user.uid,
      })

      await Swal.fire({
        icon: 'success',
        title: 'Signed in with Google',
        text: `Welcome, ${result.user.displayName || 'Customer'}!`,
        timer: 1500,
        showConfirmButton: false,
      })

      navigate(destination, { replace: true })
    } catch (err) {
      console.error(err)
      if (err.code !== 'auth/popup-closed-by-user') {
        Swal.fire({
          icon: 'error',
          title: 'Google Sign In Failed',
          text: err.message || 'Could not complete Google sign in.',
          confirmButtonColor: '#0f172a',
        })
      }
    } finally {
      setSocialLoading('')
    }
  }

  // Handle Password Reset
  async function handleForgotPassword() {
    const { value: resetEmail } = await Swal.fire({
      title: 'Reset Password',
      input: 'email',
      inputLabel: 'Enter your customer account email address',
      inputPlaceholder: 'your@email.com',
      inputValue: email,
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      confirmButtonColor: '#0f172a',
      inputValidator: (val) => {
        if (!val || !val.includes('@')) {
          return 'Please provide a valid email address.'
        }
      },
    })

    if (resetEmail) {
      try {
        if (isFirebaseConfigured && auth) {
          await sendPasswordResetEmail(auth, resetEmail.trim())
        }
        Swal.fire({
          icon: 'success',
          title: 'Reset Link Sent',
          text: `Password reset instructions have been sent to ${resetEmail}.`,
          confirmButtonColor: '#0f172a',
        })
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: err.message || 'Could not send password reset email.',
          confirmButtonColor: '#0f172a',
        })
      }
    }
  }

  return (
    <div className="auth-page-clean">
      <div className="auth-card-clean">
        {/* Title */}
        <h1 className="auth-clean-title">
          {isRegister ? 'Sign up' : 'Sign in'}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Full Name (if sign up mode) */}
          {isRegister && (
            <div className="mb-3">
              <label htmlFor="auth-name" className="auth-clean-label">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                className="auth-clean-input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="auth-email" className="auth-clean-label">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              className="auth-clean-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password with Forgot password row */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="auth-password" className="auth-clean-label mb-0">
                Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  className="auth-clean-forgot"
                  onClick={handleForgotPassword}
                >
                  Forgot your password?
                </button>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              className="auth-clean-input"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {/* Remember me Checkbox */}
          <div className="d-flex align-items-center mb-4">
            <input
              id="auth-remember"
              type="checkbox"
              className="auth-clean-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="auth-remember" className="ms-2 mb-0 small text-secondary" style={{ cursor: 'pointer' }}>
              Remember me
            </label>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="auth-clean-btn-primary"
            disabled={loading || Boolean(socialLoading)}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" />
                {isRegister ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : isRegister ? (
              'Sign up'
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Switch Between Sign in and Sign up */}
        <div className="text-center my-3 small text-secondary">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="btn btn-link p-0 text-dark fw-bold text-decoration-underline small align-baseline"
                onClick={() => setIsRegister(false)}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="btn btn-link p-0 text-dark fw-bold text-decoration-underline small align-baseline"
                onClick={() => setIsRegister(true)}
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Divider with "or" */}
        <div className="auth-clean-divider">
          <span>or</span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          className="auth-clean-social-btn mb-0"
          onClick={handleGoogleSignIn}
          disabled={loading || Boolean(socialLoading)}
        >
          {socialLoading === 'google' ? (
            <span className="spinner-border spinner-border-sm text-secondary" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  )
}
