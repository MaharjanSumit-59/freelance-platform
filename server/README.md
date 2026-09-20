# FreelanceHub API

Express + TypeScript + MongoDB (Mongoose) backend for FreelanceHub. Mirrors every
entity and action the frontend already uses (jobs, proposals, contracts with
milestones, reviews, messages, notifications), with JWT authentication and
bcrypt password hashing.

## 1. Get a MongoDB database

Pick one:

- **Local MongoDB** — install from https://www.mongodb.com/try/download/community,
  then it runs at `mongodb://localhost:27017` by default.
- **MongoDB Atlas (free tier, no local install)** — https://www.mongodb.com/cloud/atlas/register,
  create a free cluster, add your IP to the access list, and copy the connection
  string it gives you (looks like `mongodb+srv://user:pass@cluster.mongodb.net/freelancehub`).

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/freelancehub   # or your Atlas connection string
JWT_SECRET=some_long_random_string_you_make_up
CLIENT_ORIGIN=http://localhost:5173
```

`JWT_SECRET` can be anything — generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Install and run

```bash
npm install
npm run seed   # creates Sarah (client) and John/Maria (freelancers), a couple of jobs
npm run dev    # starts the API on http://localhost:4000 with auto-reload
```

Seeded logins (password for all: `password123`):
- `sarah@acme.com` — client
- `john@dev.com` — freelancer

## 4. Verify it's up

```bash
curl http://localhost:4000/api/health
# {"status":"ok"}
```

## API overview

All routes are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>` (returned from register/login).

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account, returns `{ token, user }` |
| POST | `/auth/login` | — | Returns `{ token, user }` |
| GET | `/auth/me` | any | Current user |
| GET | `/jobs` | — | List open jobs. Query: `search`, `category`, `experienceLevel`, `jobType`, `sort=newest\|budget`, `clientId` (owner view) |
| GET | `/jobs/:id` | — | Job detail |
| POST | `/jobs` | client | Create a job |
| POST | `/jobs/:jobId/proposals` | freelancer | Submit a proposal |
| GET | `/jobs/:jobId/proposals` | client (owner) | List proposals on your job |
| GET | `/proposals/mine` | freelancer | Your own proposals |
| POST | `/proposals/:id/accept` | client (owner) | Hire — creates a Contract with 4 default milestones |
| POST | `/proposals/:id/reject` | client (owner) | Reject a proposal |
| GET | `/contracts/mine` | any | Your contracts (client or freelancer view) |
| POST | `/contracts/:id/milestones/:milestoneId/submit` | freelancer (party) | Submit milestone for review |
| POST | `/contracts/:id/milestones/:milestoneId/approve` | client (party) | Approve + "pay" a milestone |
| POST | `/contracts/:id/complete` | client (party) | Complete contract (all milestones must be approved) |
| GET | `/contracts/:contractId/messages` | party | Message thread |
| POST | `/contracts/:contractId/messages` | party | Send a message |
| GET | `/contracts/:contractId/reviewed` | party | Whether you've already reviewed this contract |
| POST | `/reviews` | party on completed contract | Leave a review |
| GET | `/freelancers/:id` | — | Public profile: user + freelancer profile + live stats + reviews |
| PUT | `/freelancers/:id` | self | Update your freelancer profile |
| GET | `/freelancers/:id/reviews` | — | Reviews for a freelancer |
| GET | `/notifications/mine` | any | Your notifications |
| POST | `/notifications/:id/read` | any (owner) | Mark one read |
| POST | `/notifications/read-all` | any | Mark all read |

## Notes on design choices

- **Ownership checks happen server-side**, not just hidden in the UI — e.g. only
  the client who owns a job can view/accept/reject its proposals; only a
  contract's two parties can message on it or submit/approve its milestones.
- **Duplicate prevention via unique indexes**: a freelancer can only submit one
  proposal per job, and one review per contract — enforced at the database level,
  not just in application logic.
- **Milestones are subdocuments** on `Contract`, matching the frontend's shape,
  so `contract.milestones[i]._id` is a real Mongo ObjectId you can reference in
  the submit/approve routes.
- Passwords are hashed with `bcryptjs` (10 rounds) — never stored or returned in
  plaintext.
