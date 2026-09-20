import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { AppError } from './errorHandler.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'cvs');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(16).toString('hex');
    cb(null, `${unique}.pdf`);
  },
});

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new AppError('CV must be a PDF file.'));
  }
  cb(null, true);
}

export const uploadCv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});