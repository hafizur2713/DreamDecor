const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const requireAuth = require('./middleware/requireAuth')
const requireAdmin = require('./middleware/requireAdmin')
const upload = require('./middleware/upload')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

if (!process.env.JWT_SECRET) {
  throw new Error('Add JWT_SECRET to your backend .env file')
}

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

function createToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  )
}

function uploadedImageData(files, startingOrder = 0) {
  return files.map((file, index) => ({
    url: `/uploads/${file.filename}`,
    altText: file.originalname,
    sortOrder: startingOrder + index,
  }))
}

app.get('/', (_req, res) => {
  res.json({ message: 'DreamDecor API is running' })
})

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ server: 'ok', database: 'connected' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ server: 'ok', database: 'connection failed' })
  }
})

// Public package list, including photos for the details page carousel.
app.get('/api/packages', async (_req, res) => {
  try {
    const packages = await prisma.decorationPackage.findMany({
      where: { isActive: true },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(packages)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not load packages.' })
  }
})

// Admin package list, including inactive packages.
app.get('/api/admin/packages', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const packages = await prisma.decorationPackage.findMany({
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(packages)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not load admin packages.' })
  }
})

// Create a package. Photo files use the multipart form field name "photos".
app.post(
  '/api/admin/packages',
  requireAuth,
  requireAdmin,
  upload.array('photos', 8),
  async (req, res) => {
    try {
      const { name, description, details, price } = req.body
      const numericPrice = Number(price)

      if (
        typeof name !== 'string' ||
        !name.trim() ||
        price === undefined ||
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          error: 'Enter a package name and a valid price.',
        })
      }

      const newPackage = await prisma.decorationPackage.create({
        data: {
          name: name.trim(),
          description:
            typeof description === 'string' && description.trim()
              ? description.trim()
              : null,
          details:
            typeof details === 'string' && details.trim()
              ? details.trim()
              : null,
          price: numericPrice,
          images: {
            create: uploadedImageData(req.files || []),
          },
        },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      })

      res.status(201).json(newPackage)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Could not create package.' })
    }
  },
)

// Update package information and optionally add photos.
app.patch(
  '/api/admin/packages/:id',
  requireAuth,
  requireAdmin,
  upload.array('photos', 8),
  async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid package ID.' })
    }

    try {
      const currentPackage = await prisma.decorationPackage.findUnique({
        where: { id },
        include: { images: true },
      })

      if (!currentPackage) {
        return res.status(404).json({ error: 'Package not found.' })
      }

      const data = {}

      if (typeof req.body.name === 'string') {
        if (!req.body.name.trim()) {
          return res.status(400).json({ error: 'Package name cannot be empty.' })
        }
        data.name = req.body.name.trim()
      }

      if (typeof req.body.description === 'string') {
        data.description = req.body.description.trim() || null
      }

      if (typeof req.body.details === 'string') {
        data.details = req.body.details.trim() || null
      }

      if (req.body.price !== undefined) {
        const numericPrice = Number(req.body.price)

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
          return res.status(400).json({ error: 'Enter a valid package price.' })
        }

        data.price = numericPrice
      }

      if (req.body.isActive !== undefined) {
        if (!['true', 'false'].includes(req.body.isActive)) {
          return res.status(400).json({
            error: 'isActive must be true or false.',
          })
        }

        data.isActive = req.body.isActive === 'true'
      }

      const photos = req.files || []

      if (photos.length > 0) {
        const highestSortOrder =
          currentPackage.images.length > 0
            ? Math.max(...currentPackage.images.map((image) => image.sortOrder))
            : -1

        data.images = {
          create: uploadedImageData(photos, highestSortOrder + 1),
        }
      }

      const updatedPackage = await prisma.decorationPackage.update({
        where: { id },
        data,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      })

      res.json(updatedPackage)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Could not update package.' })
    }
  },
)

// Delete one photo from a package gallery.
app.delete(
  '/api/admin/package-images/:imageId',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const imageId = Number(req.params.imageId)

    if (!Number.isInteger(imageId) || imageId < 1) {
      return res.status(400).json({ error: 'Invalid photo ID.' })
    }

    try {
      const image = await prisma.packageImage.findUnique({
        where: { id: imageId },
      })

      if (!image) {
        return res.status(404).json({ error: 'Photo not found.' })
      }

      await prisma.packageImage.delete({
        where: { id: imageId },
      })

      if (image.url.startsWith('/uploads/')) {
        const filename = path.basename(image.url)

        try {
          await fs.promises.unlink(path.join(__dirname, 'uploads', filename))
        } catch (fileError) {
          if (fileError.code !== 'ENOENT') throw fileError
        }
      }

      res.json({ message: 'Photo deleted.' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Could not delete photo.' })
    }
  },
)

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof password !== 'string' ||
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return res.status(400).json({
        error: 'Enter a name, valid email, and password of 8–72 bytes.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'That email is already registered.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
      },
    })

    res.status(201).json({
      message: 'Account created',
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not create account.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Enter your email and password.' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' })
    }

    res.json({
      message: 'Login successful',
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not log in.' })
  }
})

// Firebase Customer Login / Registration Endpoint
app.post('/api/auth/firebase', async (req, res) => {
  try {
    const { email, name, firebaseUid } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required from Firebase.' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name && typeof name === 'string' && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: 'FIREBASE_AUTH_' + (firebaseUid || Date.now()),
          role: 'CUSTOMER',
        },
      })
    }

    res.json({
      message: 'Firebase login successful',
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Firebase auth error:', error)
    res.status(500).json({ error: 'Could not complete Firebase authentication.' })
  }
})

// Admin login uses credentials from backend/.env.
// It issues a token for an existing database user with the ADMIN role.
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      return res.status(500).json({
        error: 'Set ADMIN_USERNAME and ADMIN_PASSWORD in the backend .env file.',
      })
    }

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        error: 'Incorrect admin username or password.',
      })
    }

    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { id: 'asc' },
    })

    if (!adminUser) {
      return res.status(403).json({
        error: 'No admin account exists in the database yet.',
      })
    }

    res.json({
      message: 'Admin login successful',
      token: createToken(adminUser),
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not log in as admin.' })
  }
})

app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const {
      packageId,
      eventType,
      eventDate,
      venueAddress,
      notes,
      paymentMethod,
    } = req.body

    const id = Number(packageId)
    const date = new Date(eventDate)
    const selectedPaymentMethod = paymentMethod ?? 'CASH_ON_SITE'
    const allowedPaymentMethods = ['CASH_ON_SITE', 'ONLINE']

    if (
      !Number.isInteger(id) ||
      typeof eventType !== 'string' ||
      !eventType.trim() ||
      Number.isNaN(date.getTime()) ||
      date <= new Date() ||
      typeof venueAddress !== 'string' ||
      !venueAddress.trim() ||
      !allowedPaymentMethods.includes(selectedPaymentMethod)
    ) {
      return res.status(400).json({
        error:
          'Enter a package, event type, future date, venue address, and valid payment method.',
      })
    }

    const selectedPackage = await prisma.decorationPackage.findFirst({
      where: { id, isActive: true },
    })

    if (!selectedPackage) {
      return res.status(404).json({ error: 'Active package not found.' })
    }

    const booking = await prisma.booking.create({
      data: {
        eventType: eventType.trim(),
        eventDate: date,
        venueAddress: venueAddress.trim(),
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
        userId: req.user.id,
        decorationPackageId: selectedPackage.id,
        priceAtBooking: selectedPackage.price,
        paymentMethod: selectedPaymentMethod,
      },
      include: { decorationPackage: true },
    })

    res.status(201).json(booking)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not create booking.' })
  }
})

app.get('/api/bookings/my', requireAuth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        decorationPackage: {
          select: { name: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(bookings)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not load your bookings.' })
  }
})

app.get('/api/admin/bookings', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        decorationPackage: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(bookings)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not load bookings.' })
  }
})

app.patch(
  '/api/admin/bookings/:id/status',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = Number(req.params.id)
    const allowedStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

    if (
      !Number.isInteger(id) ||
      id < 1 ||
      !allowedStatuses.includes(req.body.status)
    ) {
      return res.status(400).json({ error: 'Invalid booking ID or status.' })
    }

    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: req.body.status },
      })

      res.json(booking)
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Booking not found.' })
      }

      console.error(error)
      res.status(500).json({ error: 'Could not update booking.' })
    }
  },
)

app.listen(port, () => {
  console.log(`DreamDecor backend running at http://localhost:${port}`)
})