import type {
  ResumeData,
  ResumeTheme,
  ThemeListItem,
  AppSettings,
  ApiResponse,
} from './types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error || 'API request failed');
  }
  return json.data as T;
}

// Resume
export async function getResume(): Promise<ResumeData> {
  return request<ResumeData>('/resume');
}

export async function saveResume(data: ResumeData): Promise<ResumeData> {
  return request<ResumeData>('/resume', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Themes
export async function getThemes(): Promise<ThemeListItem[]> {
  return request<ThemeListItem[]>('/themes');
}

export async function getTheme(name: string): Promise<ResumeTheme> {
  return request<ResumeTheme>(`/themes/${encodeURIComponent(name)}`);
}

export async function saveTheme(name: string, theme: ResumeTheme): Promise<ResumeTheme> {
  return request<ResumeTheme>(`/themes/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify(theme),
  });
}

export async function createTheme(theme: ResumeTheme): Promise<ResumeTheme> {
  return request<ResumeTheme>('/themes', {
    method: 'POST',
    body: JSON.stringify(theme),
  });
}

export async function deleteTheme(name: string): Promise<void> {
  await request(`/themes/${encodeURIComponent(name)}`, { method: 'DELETE' });
}

// File uploads
export async function uploadFile(
  file: File,
  type: 'photo' | 'logo'
): Promise<{ path: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload/${type}`, {
    method: 'POST',
    body: formData,
  });
  const json = (await res.json()) as ApiResponse<{ path: string; filename: string }>;
  if (!json.success) throw new Error(json.error || 'Upload failed');
  return json.data!;
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  return request<AppSettings>('/settings');
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  return request<AppSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
