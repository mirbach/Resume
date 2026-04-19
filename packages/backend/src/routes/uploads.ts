import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { readdirSync, unlinkSync } from 'fs';
import { getDataPath } from '../lib/storage.js';

const UPLOADS_DIR = getDataPath('uploads');

// SVG is intentionally excluded: SVGs can contain embedded scripts (stored XSS) and
// are not needed for profile photos or logos (PNG/JPG/WebP are sufficient). (A03)
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Remove any previous file with the given base name (photo or logo) regardless
 * of extension, so each new upload replaces the old one instead of accumulating
 * files on disk.
 */
function removePrevious(baseName: string): void {
  try {
    const existing = readdirSync(UPLOADS_DIR);
    for (const f of existing) {
      if (f.startsWith(`${baseName}.`)) {
        unlinkSync(path.join(UPLOADS_DIR, f));
      }
    }
  } catch {
    // uploads dir may not exist yet on first run — ignore
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      cb(new Error('Invalid file type'), '');
      return;
    }
    // Use a fixed name per upload type so the new file replaces the old one
    const type = req.params.type === 'logo' ? 'logo' : 'photo';
    removePrevious(type);
    cb(null, `${type}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

const router = Router();

// POST /api/upload/:type - upload a photo or logo (replaces any previous file)
router.post('/:type', upload.single('file'), (req: Request, res: Response) => {
  const type = req.params.type;
  if (type !== 'photo' && type !== 'logo') {
    res.status(400).json({ success: false, error: 'Upload type must be "photo" or "logo"' });
    return;
  }
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }
  const filePath = `/api/uploads/${req.file.filename}`;
  res.json({ success: true, data: { path: filePath, filename: req.file.filename } });
});

// GET /api/uploads/:filename - serve uploaded files
router.get('/:filename', (req: Request, res: Response) => {
  const raw = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filename = raw.replace(/[^a-zA-Z0-9._-]/g, '');
  const filePath = path.join(UPLOADS_DIR, filename);
  // Verify file is within uploads directory (prevent path traversal)
  if (!filePath.startsWith(UPLOADS_DIR)) {
    res.status(403).json({ success: false, error: 'Access denied' });
    return;
  }
  // Set Content-Disposition to prevent browsers from executing unexpected content (A03)
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filePath);
});

export default router;
