import { type Env, ok, err, authGuard, DEFAULT_SETTINGS } from '../_shared/helpers';

interface AppSettings {
  auth: { enabled: boolean; provider: string; clientId: string; authority: string; redirectUri: string; scopes: string[] };
  translation: { deeplApiKey: string };
  ai: { provider: string; apiKey: string; model: string };
}

// GET /api/settings
// Returns settings with API key values stripped — only indicates whether each key is configured.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  // Settings endpoint intentionally does not require auth (needed for initial setup)
  try {
    const raw = await env.RESUME_KV.get('settings');
    const data: AppSettings = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;

    const keysConfigured = {
      deeplApiKey: !!data.translation?.deeplApiKey?.trim(),
      aiApiKey: !!data.ai?.apiKey?.trim(),
    };

    // Never send actual key values to the client
    const safe: AppSettings = {
      ...data,
      translation: { deeplApiKey: '' },
      ai: { ...data.ai, apiKey: '' },
    };

    return ok(safe, keysConfigured);
  } catch {
    return ok(DEFAULT_SETTINGS);
  }
};

// PUT /api/settings
// Merges with existing settings — key fields are only overwritten if a non-empty value is provided.
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const guard = await authGuard(request, env);
  if (guard instanceof Response) return guard;

  try {
    const incoming = (await request.json()) as AppSettings;
    let existing: AppSettings;
    try {
      const raw = await env.RESUME_KV.get('settings');
      existing = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    } catch {
      existing = DEFAULT_SETTINGS as AppSettings;
    }

    const merged: AppSettings = {
      ...incoming,
      translation: {
        deeplApiKey: incoming.translation?.deeplApiKey?.trim()
          ? incoming.translation.deeplApiKey
          : existing.translation?.deeplApiKey ?? '',
      },
      ai: {
        ...incoming.ai,
        apiKey: incoming.ai?.apiKey?.trim()
          ? incoming.ai.apiKey
          : existing.ai?.apiKey ?? '',
      },
    };

    await env.RESUME_KV.put('settings', JSON.stringify(merged));

    // Return the same safe shape as GET
    const keysConfigured = {
      deeplApiKey: !!merged.translation?.deeplApiKey?.trim(),
      aiApiKey: !!merged.ai?.apiKey?.trim(),
    };
    const safe: AppSettings = {
      ...merged,
      translation: { deeplApiKey: '' },
      ai: { ...merged.ai, apiKey: '' },
    };

    return ok(safe, keysConfigured);
  } catch {
    return err('Failed to save settings');
  }
};
