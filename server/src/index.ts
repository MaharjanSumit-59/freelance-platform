import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const PORT = process.env.PORT ?? 4000;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/freelancehub';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

async function main() {
  await connectDB(MONGO_URI);

  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', routes);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
