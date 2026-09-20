import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err && typeof err === 'object' && 'name' in err && (err as Error).name === 'ValidationError') {
    return res.status(400).json({ error: (err as Error).message });
  }

  if (err && typeof err === 'object' && 'name' in err && (err as Error).name === 'MulterError') {
  const code = (err as { code?: string }).code;
  const message = code === 'LIMIT_FILE_SIZE' ? 'CV file must be under 5MB.' : 'Could not upload your CV.';
  return res.status(400).json({ error: message });
}

  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on our end.' });
}
