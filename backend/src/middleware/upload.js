/**
 * Multer Upload Middleware — Member 2 (SE331 Group 04 Section C2)
 * Configures file upload handling for verification documents.
 * Stores files to backend/uploads/documents/ with descriptive filenames.
 */
const multer = require('multer');
const path = require('path');

// ─── Storage configuration ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/documents'));
  },
  filename: (req, file, cb) => {
    // Format: {documentType}-{timestamp}-{random}.{ext}
    const ext = path.extname(file.originalname).toLowerCase();
    const docType = (req.body.documentType || 'doc').toLowerCase();
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e6);
    cb(null, `${docType}-${timestamp}-${random}${ext}`);
  },
});

// ─── File filter ────────────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: JPEG, PNG, PDF. Received: ${file.mimetype}`
      ),
      false
    );
  }
};

// ─── Multer instance ────────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

module.exports = upload;
