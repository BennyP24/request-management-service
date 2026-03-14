import express from 'express';
import { logger, errorHandler, AppError } from './middleware';
import requestRoutes from './routes/requests';
import aiRoutes from './routes/ai';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json());
app.use(logger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/requests', requestRoutes);
app.use('/ai', aiRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, 'Route not found'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
