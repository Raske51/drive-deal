import { NextApiRequest, NextApiResponse } from 'next';
import multer, { FileFilterCallback } from 'multer';
import crypto from 'crypto';
import { extname } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { security } from '../config/security';
import { encrypt } from '../utils/encryption';
import { isFileInfected } from '../utils/malwareScanner';

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: security.fileUpload.maxSize, // Max file size in bytes
  },
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    // Check file type
    if (!security.fileUpload.allowedTypes.includes(file.mimetype)) {
      cb(new Error('File type not allowed'));
      return;
    }

    // Check file extension
    const ext = extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    if (!allowedExts.includes(ext)) {
      cb(new Error('File extension not allowed'));
      return;
    }

    cb(null, true);
  },
});

// Generate secure filename
const generateSecureFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const ext = extname(originalname);
  return `${timestamp}-${random}${ext}`;
};

// Scan file for malware (using ClamAV)
const scanFile = async (buffer: Buffer): Promise<boolean> => {
  try {
    const infected = await isFileInfected(buffer);
    return !infected;
  } catch (error) {
    console.error('Malware scan error:', error);
    return false; // Fail closed - reject file if scan fails
  }
};

// Upload file to S3 with encryption
const uploadToS3 = async (
  file: Express.Multer.File,
  userId: string
): Promise<string> => {
  const filename = generateSecureFilename(file.originalname);
  const encryptionKey = process.env.ENCRYPTION_KEY!;

  // Encrypt file if enabled
  let fileBuffer = file.buffer;
  if (security.encryption.enabled) {
    const encrypted = await encrypt(fileBuffer, encryptionKey);
    fileBuffer = Buffer.from(JSON.stringify(encrypted));
  }

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `uploads/${userId}/${filename}`,
    Body: fileBuffer,
    ContentType: file.mimetype,
    Metadata: {
      'original-name': file.originalname,
      'user-id': userId,
      encrypted: security.encryption.enabled.toString(),
    },
  });

  await s3Client.send(command);

  // Generate signed URL for temporary access
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
};

interface FileUploadRequest extends NextApiRequest {
  file?: Express.Multer.File;
  user?: {
    _id: string;
  };
  fileUrl?: string;
}

// Middleware for handling file uploads
export const handleFileUpload = async (
  req: FileUploadRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    // Use multer to handle file upload
    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req as any, res as any, (err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Scan file for malware
    const isSafe = await scanFile(req.file.buffer);
    if (!isSafe) {
      throw new Error('File failed security scan');
    }

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    // Upload file to S3
    const url = await uploadToS3(req.file, req.user._id);

    // Add file URL to request
    req.fileUrl = url;

    next();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Middleware for validating file metadata
export const validateFileMetadata = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const { filename, contentType } = req.body;

  if (!filename || !contentType) {
    return res.status(400).json({ error: 'Missing file metadata' });
  }

  // Validate filename
  if (!/^[a-zA-Z0-9-_\.]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // Validate content type
  if (!security.fileUpload.allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Invalid content type' });
  }

  next();
}; 