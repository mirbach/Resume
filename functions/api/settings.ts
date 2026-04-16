import { type Env, ok, err, authGuard, DEFAULT_SETTINGS } from '../_shared/helpers';

// GET /api/settings
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  // Settings endpoint intentionally does not require auth (needed for initial setup)
  try {
    const raw = await env.RESUME_KV.get('settings');
    const data = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    return ok(data);
  } catch {
    return ok(DEFAULT_SETTINGS);
  }
};

// PUT /api/settings
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;

  try {
    const data = await request.json();
    await env.RESUME_KV.put('settings', JSON.stringify(data));
    return ok(data);
  } catch {
    return err('Failed to save settings');
  }
};
