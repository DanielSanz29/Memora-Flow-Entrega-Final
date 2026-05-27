import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.routes.js';
import expedienteRoutes from './routes/expediente.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import ordenRoutes from './routes/orden.routes.js';
import adminRoutes from './routes/admin.routes.js';
import seguimientoRoutes from './routes/seguimiento.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const app = express();

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? configuredOrigins
  : [...configuredOrigins, 'http://localhost:5173'];

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin(origin, callback) {
    // Las llamadas del frontend servido por este mismo backend son same-origin y no necesitan CORS.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Memora Flow API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api', catalogRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seguimiento', seguimientoRoutes);

// En producción Express publica el build React: una única URL pública para app y API.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(publicDir, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
