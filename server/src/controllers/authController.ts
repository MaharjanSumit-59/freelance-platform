import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

function toSafeUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: 'client' | 'freelancer';
  };

  if (!name || !email || !password || !role) {
    throw new AppError('Name, email, password, and role are all required.');
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters.');
  }
  if (!['client', 'freelancer'].includes(role)) {
    throw new AppError('Role must be either client or freelancer.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    freelancerProfile:
      role === 'freelancer'
        ? { title: '', about: '', hourlyRate: 0, skills: [], portfolio: [] }
        : undefined,
  });

  const secret = process.env.JWT_SECRET!;
  const token = signToken({ userId: user._id.toString(), role: user.role }, secret);

  res.status(201).json({ token, user: toSafeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    throw new AppError('Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('Invalid email or password.', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password.', 401);

  const secret = process.env.JWT_SECRET!;
  const token = signToken({ userId: user._id.toString(), role: user.role }, secret);

  res.json({ token, user: toSafeUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError('User not found.', 404);
  res.json({ user: toSafeUser(user) });
});
