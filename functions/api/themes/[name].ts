import { type Env, ok, err, authGuard, sanitizeFilename, DEFAULT_THEME } from '../../_shared/helpers';

// GET /api/themes/:name — checks user's theme first, then falls back to global
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const guard = await authGuard(request, env);
  if (guard instanceof Response) return guard;

  const raw_name = Array.isArray(params.name) ? params.name[0] : params.name;
  const name = sanitizeFilename(raw_name);

  try {
    // Check user's personal theme first
    if (guard) {
      const userRaw = await env.RESUME_KV.get(`theme:${guard}:${name}`);
      if (userRaw) return ok(JSON.parse(userRaw));
    }

    // Fall back to global theme
    let raw = await env.RESUME_KV.get(`theme:${name}`);

    // Auto-seed default theme on first access
    if (!raw && name === 'default') {
      await env.RESUME_KV.put('theme:default', JSON.stringify(DEFAULT_THEME));
      raw = JSON.stringify(DEFAULT_THEME);
    }

    if (!raw) return err('Theme not found', 404);
    return ok(JSON.parse(raw));
  } catch {
    return err('Failed to load theme');
  }
};

// PUT /api/themes/:name — always writes to user's personal theme
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const guard = await authGuard(request, env);
  if (guard instanceof Response) return guard;

  const raw_name = Array.isArray(params.name) ? params.name[0] : params.name;
  const name = sanitizeFilename(raw_name);

  try {
    const theme = await request.json();
    const key = guard ? `theme:${guard}:${name}` : `theme:${name}`;
    await env.RESUME_KV.put(key, JSON.stringify(theme));
    return ok(theme);
  } catch {
    return err('Failed to update theme');
  }
};

// DELETE /api/themes/:name — can only delete user's personal themes; global themes are protected
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const guard = await authGuard(request, env);
  if (guard instanceof Response) return guard;

  const raw_name = Array.isArray(params.name) ? params.name[0] : params.name;
  const name = sanitizeFilename(raw_name);

  if (!guard && name === 'default') return err('Cannot delete the default theme', 400);

  try {
    if (guard) {
      const userKey = `theme:${guard}:${name}`;
      const existing = await env.RESUME_KV.get(userKey);
      if (!existing) {
        // Check if it's a global theme — those cannot be deleted via the API
        const globalExists = await env.RESUME_KV.get(`theme:${name}`);
        if (globalExists) return err('Cannot delete a company theme', 403);
        return err('Theme not found', 404);
      }
      await env.RESUME_KV.delete(userKey);
    } else {
      await env.RESUME_KV.delete(`theme:${name}`);
    }
    return ok(null);
  } catch {
    return err('Failed to delete theme');
  }
};
