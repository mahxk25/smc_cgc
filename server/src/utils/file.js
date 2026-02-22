import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR = path.join(__dirname, '../../uploads');
export const OFFERS_DIR = path.join(UPLOAD_DIR, 'offers');
export const VOICE_DIR = path.join(UPLOAD_DIR, 'voice');
export const RESUMES_DIR = path.join(UPLOAD_DIR, 'resumes');

export function ensureUploadDirs() {
  [UPLOAD_DIR, OFFERS_DIR, VOICE_DIR, RESUMES_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

export function getOfferPdfPath(filename) {
  return path.join(OFFERS_DIR, filename);
}
