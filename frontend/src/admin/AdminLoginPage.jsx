import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Admin login failed.')
      }

      login(result.token, result.user)

      await Swal.fire({
        icon: 'success',
        title: 'Welcome, Admin',
        text: 'You have logged in successfully.',
        timer: 1400,
        showConfirmButton: false,
      })

      navigate('/admin/dashboard')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login failed',
        text: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p className="admin-login-eyebrow">DreamDecor Administration</p>
        <h1>Admin login</h1>
        <p className="admin-login-description">
          Sign in to manage bookings and decoration packages.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="admin-username">
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            className="form-control mb-3"
            placeholder="Enter admin username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />

          <label className="form-label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            className="form-control mb-4"
            placeholder="Enter admin password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            className="btn btn-dark w-100 admin-login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <Link className="admin-login-back-link" to="/">
          Back to DreamDecor
        </Link>
      </section>
    </main>
  )
}