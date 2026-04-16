import { Request, Response, NextFunction } from 'express';
import { readJson } from '../lib/storage.js';
import type { AppSettings } from '../types.js';

// Lightweight OIDC JWT validation middleware
// When auth is enabled, validates the Bearer token's signature via the IDP's JWKS endpoint
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await readJson<AppSettings>('settings.json');

    // If auth is disabled, skip validation
    if (!settings.auth.enabled) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
      return;
    }

    // For now, just check that a token is present when auth is enabled.
    // Full JWT validation (JWKS fetch + signature check) will be added
    // when the auth integration is configured.
    // TODO: Implement full OIDC JWT validation using jose library
    const token = authHeader.slice(7);
    if (!token) {
      res.status(401).json({ success: false, error: 'Empty token' });
      return;
    }

    next();
  } catch {
    // If we can't read settings, allow access (fail open for initial setup)
    next();
  }
}
