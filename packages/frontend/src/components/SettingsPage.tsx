import { useState, useEffect } from 'react';
import type { AppSettings, AuthProvider } from '../lib/types';
import { getSettings, saveSettings } from '../lib/api';
import { Save, Loader2, ArrowLeft } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const PROVIDERS: { value: AuthProvider; label: string }[] = [
  { value: 'entra-id', label: 'Microsoft Entra ID' },
  { value: 'zitadel', label: 'Zitadel' },
  { value: 'authentik', label: 'Authentik' },
  { value: 'generic-oidc', label: 'Generic OIDC' },
];

export default function SettingsPage({ onClose }: Props) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const inputClasses =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  const auth = settings.auth;

  function updateAuth(partial: Partial<typeof auth>) {
    setSettings({ ...settings!, auth: { ...auth, ...partial } });
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Authentication (OIDC)</h3>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={auth.enabled}
            onChange={(e) => updateAuth({ enabled: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Enable authentication</span>
        </label>

        {auth.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                className={inputClasses}
                value={auth.provider}
                onChange={(e) => updateAuth({ provider: e.target.value as AuthProvider })}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input
                className={inputClasses}
                value={auth.clientId}
                onChange={(e) => updateAuth({ clientId: e.target.value })}
                placeholder="your-client-id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authority URL</label>
              <input
                className={inputClasses}
                value={auth.authority}
                onChange={(e) => updateAuth({ authority: e.target.value })}
                placeholder="https://login.microsoftonline.com/your-tenant-id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URI</label>
              <input
                className={inputClasses}
                value={auth.redirectUri}
                onChange={(e) => updateAuth({ redirectUri: e.target.value })}
                placeholder="http://localhost:5173/callback"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scopes (comma-separated)</label>
              <input
                className={inputClasses}
                value={auth.scopes.join(', ')}
                onChange={(e) =>
                  updateAuth({ scopes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                }
                placeholder="openid, profile, email"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Settings
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
