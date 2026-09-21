import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Job, type ExperienceLevel, type JobType, type JobStatus } from './models/Job.js';
import { Proposal } from './models/Proposal.js';
import { Contract, type MilestoneStatus } from './models/Contract.js';
import { Message } from './models/Message.js';
import { Review } from './models/Review.js';
import { Notification } from './models/Notification.js';

import { defaultMilestones } from './utils/milestones.js';

dotenv.config();



// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

// Sample `n` distinct items from arr (n capped to arr.length).
function pickN<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    out.push(pool.splice(randInt(0, pool.length - 1), 1)[0]);
  }
  return out;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}


// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Writing'] as const;
type Category = (typeof CATEGORIES)[number];

interface ClientSeed {
  name: string;
  email: string;
  company: string;
  location: string;
  about: string;
}

const CLIENTS: ClientSeed[] = [
  { name: 'Sarah Chen', email: 'sarah@acme.com', company: 'Acme Analytics', location: 'San Francisco, CA', about: 'We build data dashboards for mid-market SaaS companies.' },
  { name: 'Michael Rivera', email: 'michael@brightpath.com', company: 'BrightPath Media', location: 'Austin, TX', about: 'A boutique media agency producing content for consumer brands.' },
  { name: 'Priya Nair', email: 'priya@nimbuscloud.com', company: 'Nimbus Cloud Co', location: 'Seattle, WA', about: 'Cloud infrastructure consulting for early-stage startups.' },
  { name: 'Daniel Kim', email: 'daniel@kimconsulting.com', company: 'Kim & Co Consulting', location: 'New York, NY', about: 'Strategy consulting for small and mid-sized businesses.' },
  { name: 'Emma Wilson', email: 'emma@greenleaforganics.com', company: 'GreenLeaf Organics', location: 'Portland, OR', about: 'Organic food brand selling direct-to-consumer online.' },
  { name: 'Carlos Mendez', email: 'carlos@mendezrealty.com', company: 'Mendez Realty Group', location: 'Miami, FL', about: 'Residential and commercial real estate brokerage.' },
  { name: 'Olivia Brown', email: 'olivia@brownbright.com', company: 'Brown & Bright Design Co', location: 'Chicago, IL', about: 'Interior design studio expanding into e-commerce.' },
  { name: 'James Anderson', email: 'james@andersonfitness.com', company: 'Anderson Fitness', location: 'Denver, CO', about: 'A chain of boutique fitness studios launching an app.' },
  { name: 'Sophia Martinez', email: 'sophia@martinezlegal.com', company: 'Martinez Legal Group', location: 'Los Angeles, CA', about: 'Small law firm specializing in family and immigration law.' },
  { name: 'Liam Johnson', email: 'liam@johnsonventures.com', company: 'Johnson Ventures', location: 'Boston, MA', about: 'Early-stage venture fund backing consumer startups.' },
  { name: 'Ava Thompson', email: 'ava@thompsonretail.com', company: 'Thompson Retail Co', location: 'Dallas, TX', about: 'Multi-brand retail company moving more of its business online.' },
  { name: 'Noah Garcia', email: 'noah@garcialogistics.com', company: 'Garcia Logistics', location: 'Phoenix, AZ', about: 'Regional freight and logistics operator.' },
  { name: 'Isabella Lee', email: 'isabella@leebeauty.com', company: 'Lee Beauty Brands', location: 'San Diego, CA', about: 'Indie beauty brand selling on Shopify and Amazon.' },
  { name: 'Ethan Walker', email: 'ethan@walkerstudios.com', company: 'Walker Studios', location: 'Nashville, TN', about: 'Independent music and podcast production studio.' },
  { name: 'Mia Robinson', email: 'mia@robinsonalliance.org', company: 'Robinson Nonprofit Alliance', location: 'Atlanta, GA', about: 'Nonprofit focused on youth education programs.' },
  { name: 'Lucas Hall', email: 'lucas@hallsoftware.com', company: 'Hall Software Solutions', location: 'Raleigh, NC', about: 'B2B software company serving the construction industry.' },
  { name: 'Charlotte Young', email: 'charlotte@youngpublishing.com', company: 'Young & Co Publishing', location: 'Minneapolis, MN', about: 'Independent publisher of nonfiction and business books.' },
  { name: 'Benjamin King', email: 'benjamin@kingauto.com', company: 'King Automotive Group', location: 'Detroit, MI', about: 'Regional auto dealership group modernizing its online presence.' },
  { name: 'Amelia Scott', email: 'amelia@scottwellness.com', company: 'Scott Wellness Studio', location: 'San Jose, CA', about: 'Wellness studio offering yoga, massage, and nutrition coaching.' },
  { name: 'Henry Adams', email: 'henry@adamsfinancial.com', company: 'Adams Financial Group', location: 'Charlotte, NC', about: 'Independent financial advisory firm for small businesses.' },
];

interface FreelancerSeed {
  name: string;
  email: string;
  category: Category;
  title: string;
  skills: string[];
  hourlyRate: number;
  about: string;
  portfolio: { title: string; description: string }[];
}

const FREELANCERS: FreelancerSeed[] = [
  // Web Development
  { name: 'John Doe', email: 'john@dev.com', category: 'Web Development', title: 'Full Stack Developer', skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'], hourlyRate: 35, about: 'Full-stack developer specializing in React and Node.js.', portfolio: [{ title: 'SaaS analytics dashboard', description: 'Built a real-time analytics dashboard used by 3,000+ daily users.' }] },
  { name: 'Grace Park', email: 'grace.park@freelance.io', category: 'Web Development', title: 'Backend Engineer', skills: ['Node.js', 'PostgreSQL', 'Express', 'Docker'], hourlyRate: 50, about: 'Backend engineer focused on scalable APIs and data pipelines.', portfolio: [] },
  { name: 'Ryan Cooper', email: 'ryan.cooper@freelance.io', category: 'Web Development', title: 'Frontend Developer', skills: ['React', 'Next.js', 'Tailwind CSS', 'JavaScript'], hourlyRate: 40, about: 'Frontend developer who cares deeply about performance and accessibility.', portfolio: [{ title: 'E-commerce storefront', description: 'Rebuilt a Next.js storefront, cutting load time by 40%.' }] },
  { name: 'Natalie Foster', email: 'natalie.foster@freelance.io', category: 'Web Development', title: 'Full Stack Developer', skills: ['Vue.js', 'Node.js', 'MongoDB', 'GraphQL'], hourlyRate: 45, about: 'Full-stack developer with a focus on clean, maintainable code.', portfolio: [] },
  { name: 'Tyler Brooks', email: 'tyler.brooks@freelance.io', category: 'Web Development', title: 'Web Developer', skills: ['React', 'TypeScript', 'Redux', 'Jest'], hourlyRate: 38, about: 'I build and test production React apps for growing startups.', portfolio: [] },
  { name: 'Zoe Campbell', email: 'zoe.campbell@freelance.io', category: 'Web Development', title: 'Software Engineer', skills: ['Node.js', 'TypeScript', 'AWS', 'PostgreSQL'], hourlyRate: 55, about: 'Senior engineer, 8 years building backend systems at scale.', portfolio: [{ title: 'Payments microservice', description: 'Designed a payments microservice processing $2M+ monthly volume.' }] },
  { name: 'Aiden Murphy', email: 'aiden.murphy@freelance.io', category: 'Web Development', title: 'Frontend Engineer', skills: ['React', 'Vue.js', 'CSS', 'Tailwind CSS'], hourlyRate: 32, about: 'Frontend engineer who loves turning designs into pixel-perfect UI.', portfolio: [] },
  { name: 'Chloe Bennett', email: 'chloe.bennett@freelance.io', category: 'Web Development', title: 'Full Stack Developer', skills: ['Next.js', 'TypeScript', 'MongoDB', 'Stripe'], hourlyRate: 48, about: 'I help startups ship their MVP fast without cutting corners.', portfolio: [{ title: 'Subscription billing platform', description: 'Integrated Stripe subscriptions and usage-based billing.' }] },
  { name: 'Owen Reed', email: 'owen.reed@freelance.io', category: 'Web Development', title: 'Backend Developer', skills: ['Express', 'MongoDB', 'Node.js', 'Redis'], hourlyRate: 42, about: 'Backend developer focused on reliable, well-tested APIs.', portfolio: [] },
  { name: 'Lily Coleman', email: 'lily.coleman@freelance.io', category: 'Web Development', title: 'Web Developer', skills: ['React', 'JavaScript', 'Firebase', 'CSS'], hourlyRate: 30, about: 'Early-career developer with 2 years building React apps.', portfolio: [] },
  { name: 'Mason Price', email: 'mason.price@freelance.io', category: 'Web Development', title: 'Full Stack Engineer', skills: ['React', 'Node.js', 'GraphQL', 'PostgreSQL'], hourlyRate: 52, about: 'Full stack engineer, ex-agency, now freelancing full time.', portfolio: [] },
  { name: 'Ella Ward', email: 'ella.ward@freelance.io', category: 'Web Development', title: 'Frontend Developer', skills: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook'], hourlyRate: 36, about: 'I build design systems and component libraries.', portfolio: [{ title: 'Component library', description: 'Built a 60+ component design system adopted across 4 product teams.' }] },

  // Mobile Development
  { name: 'Jason Wright', email: 'jason.wright@freelance.io', category: 'Mobile Development', title: 'Mobile App Developer', skills: ['React Native', 'TypeScript', 'Firebase', 'iOS'], hourlyRate: 44, about: 'I build cross-platform apps with React Native.', portfolio: [] },
  { name: 'Hannah Torres', email: 'hannah.torres@freelance.io', category: 'Mobile Development', title: 'iOS Developer', skills: ['Swift', 'iOS', 'Xcode', 'Firebase'], hourlyRate: 50, about: 'Native iOS developer, 5 apps shipped to the App Store.', portfolio: [{ title: 'Fitness tracking app', description: 'Shipped a native iOS fitness app with 50k+ downloads.' }] },
  { name: 'Dylan Patel', email: 'dylan.patel@freelance.io', category: 'Mobile Development', title: 'Android Developer', skills: ['Kotlin', 'Android', 'Firebase', 'Java'], hourlyRate: 46, about: 'Android developer specializing in Kotlin and Jetpack Compose.', portfolio: [] },
  { name: 'Ruby Sanders', email: 'ruby.sanders@freelance.io', category: 'Mobile Development', title: 'Mobile Developer', skills: ['Flutter', 'Dart', 'Firebase', 'iOS'], hourlyRate: 40, about: 'Flutter developer building apps for both iOS and Android from one codebase.', portfolio: [] },
  { name: 'Caleb Ross', email: 'caleb.ross@freelance.io', category: 'Mobile Development', title: 'React Native Developer', skills: ['React Native', 'TypeScript', 'Redux', 'Firebase'], hourlyRate: 43, about: 'React Native specialist, previously at a Series B startup.', portfolio: [] },
  { name: 'Stella Bailey', email: 'stella.bailey@freelance.io', category: 'Mobile Development', title: 'Mobile App Developer', skills: ['Flutter', 'Kotlin', 'Swift', 'Firebase'], hourlyRate: 47, about: 'I ship polished mobile apps end to end, design to App Store.', portfolio: [{ title: 'Food delivery app', description: 'Built the customer-facing app for a regional food delivery startup.' }] },

  // Design
  { name: 'Maria Lopez', email: 'maria@design.co', category: 'Design', title: 'Product Designer', skills: ['Figma', 'UI Design', 'Prototyping'], hourlyRate: 45, about: 'I design clean, usable interfaces for web and mobile products.', portfolio: [] },
  { name: 'Victor Ramirez', email: 'victor.ramirez@freelance.io', category: 'Design', title: 'UX Designer', skills: ['Figma', 'UX Research', 'Prototyping', 'Sketch'], hourlyRate: 48, about: 'UX designer who leads with research before pushing pixels.', portfolio: [{ title: 'Onboarding redesign', description: 'Redesigned onboarding flow, improving activation rate by 22%.' }] },
  { name: 'Nora Simmons', email: 'nora.simmons@freelance.io', category: 'Design', title: 'Graphic Designer', skills: ['Illustrator', 'Branding', 'Figma', 'Photoshop'], hourlyRate: 38, about: 'Graphic designer specializing in brand identity and print.', portfolio: [] },
  { name: 'Leo Fisher', email: 'leo.fisher@freelance.io', category: 'Design', title: 'Product Designer', skills: ['Figma', 'UI Design', 'Adobe XD', 'Prototyping'], hourlyRate: 42, about: 'Product designer with a background in front-end development.', portfolio: [] },
  { name: 'Ivy Watson', email: 'ivy.watson@freelance.io', category: 'Design', title: 'Brand Designer', skills: ['Branding', 'Illustrator', 'Figma', 'Typography'], hourlyRate: 40, about: 'I help early-stage brands find their visual identity.', portfolio: [{ title: 'Beauty brand rebrand', description: 'Led a full visual rebrand for a DTC beauty company.' }] },
  { name: 'Felix Gray', email: 'felix.gray@freelance.io', category: 'Design', title: 'UI/UX Designer', skills: ['Figma', 'UX Research', 'UI Design', 'Prototyping'], hourlyRate: 46, about: 'UI/UX designer for B2B SaaS products.', portfolio: [] },
  { name: 'Aria Hughes', email: 'aria.hughes@freelance.io', category: 'Design', title: 'Visual Designer', skills: ['Figma', 'Illustrator', 'Branding', 'Photoshop'], hourlyRate: 39, about: 'Visual designer covering everything from social assets to full brand kits.', portfolio: [] },

  // Writing
  { name: 'Grace Mitchell', email: 'grace.mitchell@freelance.io', category: 'Writing', title: 'Content Writer', skills: ['Copywriting', 'SEO', 'Content Strategy'], hourlyRate: 30, about: 'I write conversion-focused content for SaaS and e-commerce brands.', portfolio: [] },
  { name: 'Jack Peterson', email: 'jack.peterson@freelance.io', category: 'Writing', title: 'Technical Writer', skills: ['Technical Writing', 'Editing', 'SEO'], hourlyRate: 35, about: 'Technical writer turning complex products into clear docs.', portfolio: [{ title: 'API documentation overhaul', description: 'Rewrote developer docs for a fintech API, cutting support tickets by 30%.' }] },
  { name: 'Willow Barnes', email: 'willow.barnes@freelance.io', category: 'Writing', title: 'Copywriter', skills: ['Copywriting', 'Branding', 'Content Strategy'], hourlyRate: 28, about: 'Copywriter focused on brand voice and landing page copy.', portfolio: [] },
  { name: 'Sam Diaz', email: 'sam.diaz@freelance.io', category: 'Writing', title: 'SEO Content Writer', skills: ['SEO', 'Copywriting', 'Blogging'], hourlyRate: 25, about: 'I write SEO-optimized blog content that actually ranks.', portfolio: [] },
  { name: 'Piper Reyes', email: 'piper.reyes@freelance.io', category: 'Writing', title: 'Technical Writer', skills: ['Technical Writing', 'Editing', 'Content Strategy'], hourlyRate: 33, about: 'Technical writer with a background in software QA.', portfolio: [] },
];

interface JobTemplate {
  category: Category;
  title: string;
  description: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
}

const JOB_TEMPLATES: JobTemplate[] = [
  // Web Development
  { category: 'Web Development', title: 'Build a React Dashboard', description: 'I need a dashboard for my SaaS application with charts, tables, and a settings panel.', skills: ['React', 'TypeScript', 'Tailwind CSS'], budgetMin: 500, budgetMax: 900 },
  { category: 'Web Development', title: 'E-commerce Website with Stripe', description: 'Looking for a developer to build a storefront with product pages, cart, and Stripe checkout.', skills: ['React', 'Node.js', 'Stripe', 'MongoDB'], budgetMin: 1500, budgetMax: 2500 },
  { category: 'Web Development', title: 'API Integration for CRM', description: 'Need help integrating our internal CRM with two third-party APIs.', skills: ['Node.js', 'Express', 'PostgreSQL'], budgetMin: 400, budgetMax: 700 },
  { category: 'Web Development', title: 'Landing Page Redesign', description: 'Our marketing landing page needs a visual and technical refresh.', skills: ['React', 'Tailwind CSS', 'JavaScript'], budgetMin: 300, budgetMax: 600 },
  // Mobile Development
  { category: 'Mobile Development', title: 'Cross-platform Fitness App', description: 'Building an MVP fitness tracking app for iOS and Android.', skills: ['React Native', 'Firebase', 'TypeScript'], budgetMin: 2000, budgetMax: 3500 },
  { category: 'Mobile Development', title: 'iOS App Bug Fixes & Polish', description: 'Our existing iOS app needs a round of bug fixes and UI polish before launch.', skills: ['Swift', 'iOS', 'Xcode'], budgetMin: 500, budgetMax: 900 },
  { category: 'Mobile Development', title: 'Android App for Food Delivery', description: 'Need an Android app built from existing designs for a food delivery service.', skills: ['Kotlin', 'Android', 'Firebase'], budgetMin: 1800, budgetMax: 3000 },
  { category: 'Mobile Development', title: 'Flutter App MVP', description: 'Looking to build a Flutter MVP for a new marketplace idea.', skills: ['Flutter', 'Dart', 'Firebase'], budgetMin: 1500, budgetMax: 2800 },
  // Design
  { category: 'Design', title: 'Mobile App UI/UX Design', description: 'Need full UI/UX design for a mobile app, from wireframes to high-fidelity screens.', skills: ['Figma', 'UI Design', 'Prototyping'], budgetMin: 800, budgetMax: 1500 },
  { category: 'Design', title: 'Brand Identity & Logo Design', description: 'Launching a new brand and need a logo, color palette, and brand guidelines.', skills: ['Branding', 'Illustrator', 'Figma'], budgetMin: 600, budgetMax: 1200 },
  { category: 'Design', title: 'Marketing Website Redesign', description: 'Looking for a designer + frontend dev combo to refresh our marketing site.', skills: ['Figma', 'React', 'UI Design'], budgetMin: 1200, budgetMax: 2000 },
  { category: 'Design', title: 'Product Design System', description: 'We need a reusable design system to speed up our product design process.', skills: ['Figma', 'UI Design', 'Prototyping'], budgetMin: 1500, budgetMax: 2500 },
  // Writing
  { category: 'Writing', title: 'Blog Content for SaaS Company', description: 'Need 8 blog posts written covering topics relevant to our SaaS audience.', skills: ['Content Strategy', 'SEO', 'Blogging'], budgetMin: 200, budgetMax: 500 },
  { category: 'Writing', title: 'Technical Documentation Rewrite', description: 'Our developer docs are outdated and need a full rewrite for clarity.', skills: ['Technical Writing', 'Editing'], budgetMin: 400, budgetMax: 800 },
  { category: 'Writing', title: 'SEO Landing Page Copy', description: 'Need copy written for 5 SEO-focused landing pages.', skills: ['Copywriting', 'SEO'], budgetMin: 150, budgetMax: 400 },
  { category: 'Writing', title: 'Email Newsletter Series', description: 'Looking for a writer to produce a 6-part welcome email series.', skills: ['Copywriting', 'Content Strategy'], budgetMin: 250, budgetMax: 500 },
];

const COVER_LETTERS = [
  "I've worked on very similar projects and would love to help. Happy to walk through my approach on a quick call.",
  "This is right in my wheelhouse — I've shipped several projects like this and can start immediately.",
  "I read through your description and have a clear plan for how I'd tackle this. Let me know if you'd like to see relevant past work.",
  "I have direct experience with everything you've listed here and can deliver a high-quality result within your timeline.",
  "Excited about this project — it lines up closely with what I've been doing for the past few years.",
];

const MESSAGE_LINES = [
  "Hi! Excited to get started — I'll have an initial draft ready in a couple of days.",
  'Sounds good, looking forward to seeing it.',
  "Quick question — do you have brand guidelines I should follow, or is this open-ended?",
  "Here's what we've used before, but feel free to suggest improvements.",
  "Got it, I'll incorporate that. Update coming soon.",
  'Just submitted the first milestone for review — let me know your thoughts!',
  'Looks great, approving now. Nice work.',
  'Thanks! Starting on the next part today.',
  'One small revision request on the last piece, otherwise looking solid.',
  'Updated based on your feedback — should be ready for another look.',
];

const REVIEW_COMMENTS_POSITIVE = [
  'Great to work with — clear communication and delivered on time.',
  'Really happy with the quality of work. Would hire again.',
  'Smooth collaboration from start to finish, highly recommend.',
  'Exceeded expectations and was very responsive throughout.',
  'Professional, reliable, and easy to work with.',
];

const REVIEW_COMMENTS_MIXED = [
  'Solid work overall, a couple of revisions needed but got there in the end.',
  'Good communication, timeline slipped slightly but final result was good.',
];

// ---------------------------------------------------------------------------
// Main seed routine
// ---------------------------------------------------------------------------

async function seed() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/freelancehub';
  await connectDB(uri);

  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Proposal.deleteMany({}),
    Contract.deleteMany({}),
    Message.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Users ---------------------------------------------------------------

  const clientDocs = await User.insertMany(
    CLIENTS.map((c) => ({
      name: c.name,
      email: c.email,
      passwordHash,
      role: 'client' as const,
      clientProfile: { companyName: c.company, about: c.about, location: c.location },
    }))
  );

  const freelancerDocs = await User.insertMany(
    FREELANCERS.map((f) => ({
      name: f.name,
      email: f.email,
      passwordHash,
      role: 'freelancer' as const,
      freelancerProfile: {
        title: f.title,
        about: f.about,
        hourlyRate: f.hourlyRate,
        skills: f.skills,
        portfolio: f.portfolio,
      },
    }))
  );

  const freelancersByCategory: Record<Category, (typeof freelancerDocs)[number][]> = {
    'Web Development': [],
    'Mobile Development': [],
    Design: [],
    Writing: [],
  };
  freelancerDocs.forEach((doc, i) => freelancersByCategory[FREELANCERS[i].category].push(doc));

  // --- Jobs, proposals, contracts, messages, reviews, notifications --------

  // Roughly 50% open / 20% in_progress / 20% completed / 10% cancelled.
  const STATUS_PATTERN: JobStatus[] = [
    'open',
    'open',
    'in_progress',
    'completed',
    'open',
    'cancelled',
    'in_progress',
    'completed',
    'open',
    'open',
  ];
  const EXPERIENCE_LEVELS: ExperienceLevel[] = ['entry', 'intermediate', 'expert'];
  const JOB_TYPES: JobType[] = ['fixed', 'hourly'];

  let jobIndex = 0;
  let notificationCount = 0;
  let messageCount = 0;
  let reviewCount = 0;
  let contractCount = 0;
  let proposalCount = 0;

  for (let ci = 0; ci < clientDocs.length; ci++) {
    const client = clientDocs[ci];
    const jobsForThisClient = 1 + (ci % 3); // 1, 2, or 3 jobs per client

    for (let j = 0; j < jobsForThisClient; j++) {
      const category = CATEGORIES[jobIndex % CATEGORIES.length];
      const templatesInCategory = JOB_TEMPLATES.filter((t) => t.category === category);
      const template = pick(templatesInCategory);
      const status = STATUS_PATTERN[jobIndex % STATUS_PATTERN.length];
      const deadlineDays = randInt(10, 45);
      const postedDaysAgo = randInt(3, 60);

      const job = await Job.create({
        clientId: client._id,
        title: template.title,
        description: template.description,
        category: template.category,
        skills: template.skills,
        budgetMin: template.budgetMin,
        budgetMax: template.budgetMax,
        jobType: pick(JOB_TYPES),
        experienceLevel: pick(EXPERIENCE_LEVELS),
        deadlineDays,
        status,
        createdAt: daysAgo(postedDaysAgo),
      });

      // How many proposals this job gets, and whether one is accepted.
      const candidatePool = freelancersByCategory[category];
      let numProposals = 0;
      let willHire = false;

      if (status === 'open') {
        numProposals = randInt(0, 3);
      } else if (status === 'cancelled') {
        numProposals = randInt(0, 2);
      } else {
        // in_progress or completed — always has a winning proposal.
        numProposals = randInt(2, Math.min(4, candidatePool.length));
        willHire = true;
      }

      const applicants = pickN(candidatePool, numProposals);
      const winnerIndex = willHire ? randInt(0, applicants.length - 1) : -1;

      const jobProposalIds: string[] = [];

      for (let a = 0; a < applicants.length; a++) {
        const freelancer = applicants[a];
        const isWinner = a === winnerIndex;
        const bidAmount = randInt(template.budgetMin, template.budgetMax);
        const estimatedDays = randInt(Math.min(5, deadlineDays), deadlineDays);

        const proposalStatus = isWinner ? 'accepted' : willHire ? 'rejected' : 'pending';

        const proposal = await Proposal.create({
          jobId: job._id,
          freelancerId: freelancer._id,
          coverLetter: pick(COVER_LETTERS),
          bidAmount,
          estimatedDays,
          status: proposalStatus,
          createdAt: daysAgo(postedDaysAgo - randInt(0, Math.min(3, postedDaysAgo))),
        });
        proposalCount++;
        jobProposalIds.push(proposal._id.toString());

        await Notification.create({
          userId: client._id,
          type: 'proposal_received',
          message: `New proposal on "${job.title}"`,
          relatedId: job._id.toString(),
          read: Math.random() < 0.5,
          createdAt: proposal.createdAt,
        });
        notificationCount++;

        if (willHire && !isWinner) {
          await Notification.create({
            userId: freelancer._id,
            type: 'proposal_rejected',
            message: `Your proposal for "${job.title}" wasn't selected`,
            relatedId: job._id.toString(),
            read: Math.random() < 0.5,
          });
          notificationCount++;
        }
      }

      job.proposalCount = jobProposalIds.length;
      await job.save();

      // --- Contract, messages, milestones, reviews ---
      if (willHire && winnerIndex >= 0) {
        const winnerFreelancer = applicants[winnerIndex];
        const winnerProposal = await Proposal.findOne({ jobId: job._id, freelancerId: winnerFreelancer._id });
        if (!winnerProposal) continue;

        const startDate = addDays(job.createdAt, randInt(1, 4));
        const deadline = addDays(startDate, winnerProposal.estimatedDays);
        const milestones = defaultMilestones(winnerProposal.bidAmount);

        if (status === 'completed') {
          milestones.forEach((m) => (m.status = 'approved'));
        } else {
          // in_progress: vary how far along the work is.
          milestones[0].status = 'approved';
          milestones[1].status = Math.random() < 0.6 ? 'submitted' : 'approved';
          if (Math.random() < 0.3) milestones[2].status = 'submitted';
        }

        // Give some in-progress contracts a deadline that's already close or overdue,
        // so the client/freelancer dashboards have "needs attention" items to show.
        const finalDeadline =
          status === 'in_progress' && Math.random() < 0.4
            ? addDays(new Date(), randInt(-3, 3))
            : deadline;

        const contract = await Contract.create({
          jobId: job._id,
          clientId: client._id,
          freelancerId: winnerFreelancer._id,
          agreedPrice: winnerProposal.bidAmount,
          startDate,
          deadline: finalDeadline,
          status: status === 'completed' ? 'completed' : 'in_progress',
          milestones,
        });
        contractCount++;

        await Notification.create({
          userId: winnerFreelancer._id,
          type: 'hired',
          message: `You were hired for "${job.title}"`,
          relatedId: contract._id.toString(),
          read: Math.random() < 0.5,
          createdAt: startDate,
        });
        notificationCount++;

        // Message thread between client and freelancer.
        const numMessages = randInt(3, 7);
        let lastSender: 'client' | 'freelancer' = 'client';
        let lastMessage = null;
        for (let m = 0; m < numMessages; m++) {
          const senderIsClient = m === 0 ? true : Math.random() < 0.5;
          lastSender = senderIsClient ? 'client' : 'freelancer';
          const senderId = senderIsClient ? client._id : winnerFreelancer._id;
          const messageDate = addDays(startDate, Math.floor((m / numMessages) * randInt(3, 20)));
          lastMessage = await Message.create({
            contractId: contract._id,
            senderId,
            text: pick(MESSAGE_LINES),
            createdAt: messageDate,
          });
          messageCount++;
        }
        if (lastMessage) {
          const recipientId = lastSender === 'client' ? winnerFreelancer._id : client._id;
          await Notification.create({
            userId: recipientId,
            type: 'message',
            message: `New message on "${job.title}"`,
            relatedId: contract._id.toString(),
            read: Math.random() < 0.4,
            createdAt: lastMessage.createdAt,
          });
          notificationCount++;
        }

        // Mutual reviews once the contract is completed.
        if (status === 'completed') {
          const clientRating = () => randInt(4, 5);
          const freelancerReviewsClient = await Review.create({
            contractId: contract._id,
            reviewerId: winnerFreelancer._id,
            revieweeId: client._id,
            communication: clientRating(),
            quality: clientRating(),
            timeliness: clientRating(),
            comment: pick(REVIEW_COMMENTS_POSITIVE),
            createdAt: addDays(finalDeadline, randInt(0, 3)),
          });
          reviewCount++;

          const freelancerScore = () => (Math.random() < 0.85 ? randInt(4, 5) : randInt(3, 4));
          const clientReviewsFreelancer = await Review.create({
            contractId: contract._id,
            reviewerId: client._id,
            revieweeId: winnerFreelancer._id,
            communication: freelancerScore(),
            quality: freelancerScore(),
            timeliness: freelancerScore(),
            comment: Math.random() < 0.8 ? pick(REVIEW_COMMENTS_POSITIVE) : pick(REVIEW_COMMENTS_MIXED),
            createdAt: addDays(finalDeadline, randInt(0, 3)),
          });
          reviewCount++;

          await Notification.create({
            userId: client._id,
            type: 'review',
            message: `${winnerFreelancer.name} left you a review`,
            relatedId: contract._id.toString(),
            read: Math.random() < 0.6,
            createdAt: freelancerReviewsClient.createdAt,
          });
          await Notification.create({
            userId: winnerFreelancer._id,
            type: 'review',
            message: `${client.name} left you a review`,
            relatedId: contract._id.toString(),
            read: Math.random() < 0.6,
            createdAt: clientReviewsFreelancer.createdAt,
          });
          notificationCount += 2;
        }
      }

      jobIndex++;
    }
  }

  console.log('Seed complete.');
  console.log(`  Clients:       ${clientDocs.length}`);
  console.log(`  Freelancers:   ${freelancerDocs.length}`);
  console.log(`  Jobs:          ${jobIndex}`);
  console.log(`  Proposals:     ${proposalCount}`);
  console.log(`  Contracts:     ${contractCount}`);
  console.log(`  Messages:      ${messageCount}`);
  console.log(`  Reviews:       ${reviewCount}`);
  console.log(`  Notifications: ${notificationCount}`);
  console.log('');
  console.log('All accounts use the password: password123');
  console.log(`  Client login:     ${CLIENTS[0].email}`);
  console.log(`  Freelancer login: ${FREELANCERS[0].email}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});