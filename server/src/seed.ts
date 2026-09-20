import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Job } from './models/Job.js';
import mongoose from 'mongoose';

dotenv.config();

async function seed() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/freelancehub';
  await connectDB(uri);

  await Promise.all([User.deleteMany({}), Job.deleteMany({})]);

  const passwordHash = await bcrypt.hash('password123', 10);

  const sarah = await User.create({
    name: 'Sarah Chen',
    email: 'sarah@acme.com',
    passwordHash,
    role: 'client',
  });

  await User.create({
    name: 'John Doe',
    email: 'john@dev.com',
    passwordHash,
    role: 'freelancer',
    freelancerProfile: {
      title: 'Full Stack Developer',
      about: 'Full-stack developer specializing in React and Node.js.',
      hourlyRate: 35,
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      portfolio: [],
    },
  });

  await User.create({
    name: 'Maria Lopez',
    email: 'maria@design.co',
    passwordHash,
    role: 'freelancer',
    freelancerProfile: {
      title: 'Product Designer',
      about: 'I design clean, usable interfaces for web and mobile products.',
      hourlyRate: 45,
      skills: ['Figma', 'UI Design', 'Prototyping'],
      portfolio: [],
    },
  });

  await Job.create([
    {
      clientId: sarah._id,
      title: 'Build a React Dashboard',
      description: 'I need a dashboard for my SaaS application with charts, tables, and a settings panel.',
      category: 'Web Development',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      budgetMin: 500,
      budgetMax: 800,
      jobType: 'fixed',
      experienceLevel: 'intermediate',
      deadlineDays: 30,
    },
    {
      clientId: sarah._id,
      title: 'Redesign Marketing Website',
      description: 'Looking for a designer + frontend dev combo to refresh our marketing site.',
      category: 'Design',
      skills: ['Figma', 'React', 'UI Design'],
      budgetMin: 1200,
      budgetMax: 2000,
      jobType: 'fixed',
      experienceLevel: 'expert',
      deadlineDays: 45,
    },
  ]);

  console.log('Seed complete.');
  console.log(`  Client login:     sarah@acme.com / password123`);
  console.log(`  Freelancer login: john@dev.com / password123`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
