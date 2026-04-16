// ---- Env binding ----

export interface Env {
  RESUME_KV: KVNamespace;
}

// ---- Response helpers ----

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function ok<T>(data: T): Response {
  return json({ success: true, data });
}

export function err(message: string, status = 500): Response {
  return json({ success: false, error: message }, status);
}

// ---- Sanitize filenames (same logic as backend) ----

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '');
}

// ---- Auth guard ----

interface AuthSettings {
  enabled: boolean;
  provider: string;
  clientId: string;
  authority: string;
  redirectUri: string;
  scopes: string[];
}

interface AppSettings {
  auth: AuthSettings;
}

export async function authGuard(request: Request, env: Env): Promise<Response | null> {
  try {
    const raw = await env.RESUME_KV.get('settings');
    if (!raw) return null; // no settings yet — allow (initial setup)
    const settings = JSON.parse(raw) as AppSettings;
    if (!settings.auth?.enabled) return null;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return err('Missing or invalid authorization header', 401);
    }
    const token = authHeader.slice(7);
    if (!token) return err('Empty token', 401);

    // Token is present. Full JWT validation (JWKS) is a TODO — same as backend.
    return null;
  } catch {
    return null; // fail open
  }
}

// ---- Default data ----

export const DEFAULT_RESUME = {
  personal: {
    name: '',
    title: { en: '', de: '' },
    email: '',
    phone: '',
    location: { en: '', de: '' },
  },
  summary: { en: '', de: '' },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  projects: [],
  products: [],
  references: [],
};

export const DEFAULT_SETTINGS: AppSettings = {
  auth: {
    enabled: false,
    provider: 'generic-oidc',
    clientId: '',
    authority: '',
    redirectUri: 'https://your-site.pages.dev',
    scopes: ['openid', 'profile', 'email'],
  },
};

export const DEFAULT_THEME = {
  name: 'Default',
  colors: {
    primary: '#2563eb',
    secondary: '#6b7280',
    accent: '#059669',
    text: '#1f2937',
    background: '#ffffff',
    heading: '#111827',
  },
  fonts: { heading: 'Inter', body: 'Inter', size: 'medium' },
  layout: {
    style: 'single-column',
    headerStyle: 'full-width',
    sectionOrder: [
      'personal', 'summary', 'experience', 'education', 'skills',
      'certifications', 'languages', 'projects', 'products', 'references',
    ],
    showPhoto: true,
    pageMargins: { top: 40, right: 40, bottom: 40, left: 40 },
  },
};

// ---- Base64 helpers for KV image storage ----

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
