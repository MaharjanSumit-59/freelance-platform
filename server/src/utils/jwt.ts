import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  role: 'client' | 'freelancer' | 'admin';
}

export function signToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
