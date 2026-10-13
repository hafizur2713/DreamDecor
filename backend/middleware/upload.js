const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')

const uploadFolder = path.join(__dirname, '..', 'uploads')

fs.mkdirSync(uploadFolder, { recursive: true })

const allowedTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadFolder)
  },

  filename: (_req, file, callback) => {
    const extension = allowedTypes[file.mimetype]
    callback(null, `${crypto.randomUUID()}${extension}`)
  },
})

const fileFilter = (_req, file, callback) => {
  if (!allowedTypes[file.mimetype]) {
    return callback(new Error('Only JPG, PNG, and WebP images are allowed.'))
  }

  callback(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
})

module.exports = upload