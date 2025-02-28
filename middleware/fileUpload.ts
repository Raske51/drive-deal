import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import crypto from 'crypto';
import { extname } from 'path';

// Simple security configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

// Configure multer for local disk storage
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error('Type de fichier non autorisé'));
      return;
    }

    // Check file extension
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      cb(new Error('Extension de fichier non autorisée'));
      return;
    }

    cb(null, true);
  },
});

// Middleware for handling file uploads
export const handleFileUpload = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req as any, res as any, (err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    const file = (req as any).file;
    if (!file) {
      throw new Error('Aucun fichier téléchargé');
    }

    // Add file URL to request
    (req as any).fileUrl = `/uploads/${file.filename}`;

    next();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Simple metadata validation middleware
export const validateFileMetadata = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ error: 'Nom de fichier manquant' });
  }

  // Basic filename validation
  if (!/^[a-zA-Z0-9-_\.]+$/.test(filename)) {
    return res.status(400).json({ error: 'Nom de fichier invalide' });
  }

  next();
}; 