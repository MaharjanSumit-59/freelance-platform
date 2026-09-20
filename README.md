# FreelanceHub

A full-stack freelance marketplace where **clients** post jobs and hire **freelancers**. Freelancers browse jobs and submit proposals; clients review proposals, hire, and manage the work through contracts with milestones, messaging, notifications, and reviews.

## Features

**For clients**
- Post, edit, and manage job listings
- Review proposals and accept or reject them
- Hiring a freelancer automatically creates a contract with default milestones
- Approve milestones and complete contracts
- Leave reviews after a contract is completed

**For freelancers**
- Browse and filter open jobs (search, category, experience level, job type, sort)
- Submit proposals and track their status
- Submit milestones for client review
- Build a public profile with live stats and reviews (PDF CV upload supported)

**Platform**
- JWT authentication with bcrypt password hashing
- Role-based access (client / freelancer) on both the UI and the API
- Per-contract message threads
- In-app notifications with a notification bell
- Landing page with live platform stats

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB with Mongoose |
| Auth & uploads | JSON Web Tokens, bcryptjs, Multer |

## Project Structure

```
.
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── api/           # API request helpers
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth and notifications context
│   │   ├── layouts/
│   │   ├── pages/         # Route-level pages
│   │   └── types/
│   └── .env.example
├── server/                # Express + MongoDB backend
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, uploads, error handling
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── utils/
│   │   └── seed.ts        # Demo data
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19 or newer (22+ recommended)
- npm
- A MongoDB database, either:
  - **Local:** [MongoDB Community Server](https://www.mongodb.com/try/download/community) (runs at `mongodb://localhost:27017`), or
  - **Cloud:** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/freelancehub
JWT_SECRET=your_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
```

Generate a secure `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Seed the database with demo data, then start the API:

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:4000`. Check it with:

```bash
curl http://localhost:4000/api/health
# {"status":"ok"}
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The default `client/.env` points at the local API:

```env
VITE_API_URL=http://localhost:4000/api
```

The app runs at `http://localhost:5173`.

### Demo accounts

After running `npm run seed`, you can log in with (password for all: `password123`):

| Role | Email |
|---|---|
| Client | `sarah@acme.com` |
| Freelancer | `john@dev.com` |

## Scripts

**Server** (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Start the API with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run seed` | Populate the database with demo data |

**Client** (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with Oxlint |

## API Overview

All routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header (returned by register/login).

| Resource | Base path |
|---|---|
| Authentication | `/auth` |
| Jobs | `/jobs` |
| Proposals | `/proposals` |
| Contracts and milestones | `/contracts` |
| Reviews | `/reviews` |
| Notifications | `/notifications` |
| Freelancer profiles | `/freelancers` |
| Client profiles | `/clients` |
| Users | `/users` |
| Platform stats | `/stats` |

See [`server/README.md`](server/README.md) for the full endpoint table.

## Design Notes

- **Ownership checks run on the server**, not just in the UI. For example, only the client who owns a job can view, accept, or reject its proposals, and only the two parties of a contract can message on it or act on its milestones.
- **Duplicates are prevented at the database level** with unique indexes: one proposal per freelancer per job, and one review per contract.
- **Milestones are subdocuments** of `Contract`, so each has a real MongoDB `_id` used by the submit and approve routes.
- **CV uploads** accept PDF files only, up to 5 MB, and are stored in `server/uploads/` (excluded from Git).

## Environment Variables

Never commit real `.env` files. Use the `.env.example` files as templates.

| Variable | Where | Description |
|---|---|---|
| `PORT` | server | Port for the API (default `4000`) |
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret used to sign JWTs |
| `CLIENT_ORIGIN` | server | Allowed CORS origin (the frontend URL) |
| `VITE_API_URL` | client | Base URL of the API |


