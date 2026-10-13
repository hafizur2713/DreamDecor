import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext.jsx'

const API = 'http://localhost:5000'

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString('en-IN')}`
}

function getPhotoUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API}${url}`
}

export default function AdminPackagesPage() {
  const { token } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal / Form state for Add or Edit
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    details: '',
    isActive: true,
  })
  const [selectedPhotos, setSelectedPhotos] = useState([])

  async function loadPackages() {
    try {
      const response = await fetch(`${API}/api/admin/packages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not load packages.')
      }
      setPackages(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadPackages()
    } else {
      setLoading(false)
      setError('Please log in as admin.')
    }
  }, [token])

  function openCreateModal() {
    setEditingPackage(null)
    setFormData({
      name: '',
      price: '',
      description: '',
      details: '',
      isActive: true,
    })
    setSelectedPhotos([])
    setShowModal(true)
  }

  function openEditModal(pkg) {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name || '',
      price: pkg.price || '',
      description: pkg.description || '',
      details: pkg.details || '',
      isActive: pkg.isActive !== false,
    })
    setSelectedPhotos([])
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingPackage(null)
    setSelectedPhotos([])
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handlePhotoSelect(e) {
    if (e.target.files) {
      setSelectedPhotos(Array.from(e.target.files))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Package name required',
        confirmButtonColor: '#49372f',
      })
      return
    }

    if (!formData.price || Number(formData.price) < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Valid price required',
        confirmButtonColor: '#49372f',
      })
      return
    }

    setSaving(true)

    try {
      const formPayload = new FormData()
      formPayload.append('name', formData.name.trim())
      formPayload.append('price', formData.price)
      formPayload.append('description', formData.description.trim())
      formPayload.append('details', formData.details.trim())
      formPayload.append('isActive', formData.isActive ? 'true' : 'false')

      selectedPhotos.forEach((file) => {
        formPayload.append('photos', file)
      })

      let response
      if (editingPackage) {
        response = await fetch(`${API}/api/admin/packages/${editingPackage.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formPayload,
        })
      } else {
        response = await fetch(`${API}/api/admin/packages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formPayload,
        })
      }

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save package.')
      }

      await Swal.fire({
        icon: 'success',
        title: editingPackage ? 'Package Updated!' : 'Package Created!',
        text: `"${result.name}" has been successfully saved.`,
        timer: 1500,
        showConfirmButton: false,
      })

      closeModal()
      loadPackages()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#49372f',
      })
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(pkg) {
    const nextStatus = !pkg.isActive
    try {
      const formPayload = new FormData()
      formPayload.append('isActive', nextStatus ? 'true' : 'false')

      const response = await fetch(`${API}/api/admin/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Could not update status.')
      }

      setPackages((prev) =>
        prev.map((item) =>
          item.id === pkg.id ? { ...item, isActive: result.isActive } : item,
        ),
      )

      Swal.fire({
        icon: 'success',
        title: nextStatus ? 'Package Activated' : 'Package Hidden',
        text: `"${pkg.name}" is now ${nextStatus ? 'visible to customers' : 'hidden from public view'}.`,
        timer: 1300,
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

  async function handleDeleteImage(pkgId, imageId) {
    const confirmation = await Swal.fire({
      title: 'Delete this photo?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#8c8077',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    })

    if (!confirmation.isConfirmed) return

    try {
      const response = await fetch(`${API}/api/admin/package-images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete photo.')
      }

      setPackages((prev) =>
        prev.map((pkg) => {
          if (pkg.id === pkgId) {
            return {
              ...pkg,
              images: pkg.images.filter((img) => img.id !== imageId),
            }
          }
          return pkg
        }),
      )

      Swal.fire({
        icon: 'success',
        title: 'Photo deleted',
        timer: 1200,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: err.message,
        confirmButtonColor: '#49372f',
      })
    }
  }

  const activeCount = packages.filter((p) => p.isActive).length
  const inactiveCount = packages.length - activeCount

  return (
    <main className="container py-5">
      {/* Top Navigation & Title */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-muted text-decoration-none small"
          >
            ← Back to dashboard
          </Link>
          <p className="admin-dashboard-eyebrow mt-1 mb-0">DreamDecor administration</p>
          <h1 className="h2 mb-1">Decoration packages</h1>
          <p className="text-muted mb-0">
            Create, edit, and manage your luxury decoration catalog.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link className="btn btn-outline-dark btn-sm" to="/admin/bookings">
            Bookings
          </Link>
          <Link className="btn btn-outline-dark btn-sm" to="/">
            Back to store
          </Link>
          <button
            type="button"
            className="btn btn-dark btn-sm px-3"
            onClick={openCreateModal}
          >
            + Add new package
          </button>
        </div>
      </div>

      {/* Package Stats Summary */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm text-center">
            <span className="small text-muted d-block">Total packages</span>
            <strong className="fs-3 text-dark">{packages.length}</strong>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm text-center">
            <span className="small text-muted d-block">Active in store</span>
            <strong className="fs-3 text-success">{activeCount}</strong>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm text-center">
            <span className="small text-muted d-block">Hidden / Inactive</span>
            <strong className="fs-3 text-secondary">{inactiveCount}</strong>
          </div>
        </div>
      </div>

      {loading && <p className="mt-4">Loading packages...</p>}
      {error && <p className="alert alert-warning mt-4">{error}</p>}

      {!loading && !error && packages.length === 0 && (
        <div className="text-center py-5 bg-white rounded-4 border">
          <p className="text-muted mb-3">No decoration packages created yet.</p>
          <button
            type="button"
            className="btn btn-dark"
            onClick={openCreateModal}
          >
            Create your first package
          </button>
        </div>
      )}

      {/* Package Grid */}
      <div className="row g-4">
        {packages.map((pkg) => {
          const mainImage =
            pkg.images && pkg.images.length > 0
              ? getPhotoUrl(pkg.images[0].url)
              : pkg.imageUrl
                ? getPhotoUrl(pkg.imageUrl)
                : null

          return (
            <div key={pkg.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                {/* Status Badge */}
                <div
                  className="position-absolute top-0 end-0 m-3"
                  style={{ zIndex: 2 }}
                >
                  <span
                    className={`badge ${
                      pkg.isActive
                        ? 'bg-success text-white'
                        : 'bg-secondary text-white'
                    }`}
                  >
                    {pkg.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Cover Image */}
                <div
                  style={{
                    height: '200px',
                    backgroundColor: '#f1ede8',
                    overflow: 'hidden',
                  }}
                  className="d-flex align-items-center justify-content-center"
                >
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={pkg.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span className="text-muted fs-1 opacity-50">✦</span>
                  )}
                </div>

                {/* Card Content */}
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h2 className="h5 fw-bold mb-0 text-dark">{pkg.name}</h2>
                    <span className="text-primary fw-bold fs-5 text-nowrap ms-2" style={{ color: '#754d35' }}>
                      {formatPrice(pkg.price)}
                    </span>
                  </div>

                  <p className="text-muted small mb-3 flex-grow-1" style={{ minHeight: '40px' }}>
                    {pkg.description || 'No description provided.'}
                  </p>

                  {/* Photo Thumbnails */}
                  {pkg.images && pkg.images.length > 0 && (
                    <div className="mb-3">
                      <div className="small text-muted mb-1">
                        Gallery ({pkg.images.length} photos):
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {pkg.images.map((img) => (
                          <div
                            key={img.id}
                            className="position-relative"
                            style={{ width: '42px', height: '42px' }}
                          >
                            <img
                              src={getPhotoUrl(img.url)}
                              alt="thumb"
                              className="rounded border"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 rounded-circle"
                              style={{
                                width: '16px',
                                height: '16px',
                                fontSize: '10px',
                                lineHeight: '1',
                                transform: 'translate(30%, -30%)',
                              }}
                              title="Delete photo"
                              onClick={() => handleDeleteImage(pkg.id, img.id)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-2 border-top d-flex gap-2 align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark flex-fill"
                      onClick={() => openEditModal(pkg)}
                    >
                      Edit details
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm flex-fill ${
                        pkg.isActive ? 'btn-outline-secondary' : 'btn-outline-success'
                      }`}
                      onClick={() => toggleStatus(pkg)}
                    >
                      {pkg.isActive ? 'Hide' : 'Activate'}
                    </button>

                    <Link
                      to={`/packages/${pkg.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-light border"
                      title="Preview customer view"
                    >
                      ↗
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add / Edit Package Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom px-4 pt-4">
                <h5 className="modal-title fw-bold">
                  {editingPackage ? 'Edit Package' : 'Create New Package'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={saving}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">
                        Package name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="e.g. Royal Gold Wedding Decor"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">
                        Price (₹ INR) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        className="form-control"
                        placeholder="45000"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Short description
                      </label>
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        placeholder="Brief summary shown on package cards"
                        value={formData.description}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Detailed features & specifications
                      </label>
                      <textarea
                        name="details"
                        rows="4"
                        className="form-control"
                        placeholder="Included elements, stage setup, lighting specifications, flower arrangements..."
                        value={formData.details}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Upload photos {editingPackage ? '(Add more photos)' : ''}
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoSelect}
                      />
                      <div className="form-text small">
                        Select one or more images (PNG, JPG, WEBP).
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActiveCheck"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleFormChange}
                        />
                        <label
                          className="form-check-label small fw-semibold"
                          htmlFor="isActiveCheck"
                        >
                          Package is active and visible in store
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-dark px-4"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingPackage ? 'Update package' : 'Create package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}