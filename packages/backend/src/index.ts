import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import resumeRoutes from './routes/resume.js';
import themesRoutes from './routes/themes.js';
import uploadsRoutes from './routes/uploads.js';
import settingsRoutes from './routes/settings.js';
import translateRoutes from './routes/translate.js';
import aiRoutes from './routes/ai.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers (A05)
// This is an API-only server — it never serves HTML, so a maximally
// restrictive CSP (default-src 'none') is the correct posture.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
    },
  },
}));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Health check — before auth so external monitors work when OIDC is enabled
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Rate limiting (A04 — prevent resource exhaustion / API-key abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Stricter limits for endpoints that call paid external APIs
const externalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Rate limiting must be applied before auth middleware so that brute-force
// and DoS attempts are dropped before expensive JWT/JWKS verification runs.
app.use('/api', apiLimiter);

// Auth middleware (only blocks when auth is enabled in settings)
app.use('/api', authMiddleware);

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/upload', uploadsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/translate', externalApiLimiter, translateRoutes);
app.use('/api/ai', externalApiLimiter, aiRoutes);

app.listen(PORT, () => {
  console.log(`Resume API server running on http://localhost:${PORT}`);
});

export default app;
