import { type Env, err, authGuard, arrayBufferToBase64 } from '../../_shared/helpers';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// POST /api/upload/photo  and  POST /api/upload/logo
// The [type] segment captures "photo" or "logo" — both behave identically.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return err('No file uploaded', 400);
    if (!ALLOWED_MIME.includes(file.type)) return err('Invalid file type', 400);

    // Derive extension from MIME type
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };
    const ext = mimeToExt[file.type] ?? '.jpg';

    if (!ALLOWED_EXT.includes(ext)) return err('Invalid file type', 400);

    const buffer = await file.arrayBuffer();
    if (buffer.byteLength > MAX_SIZE) return err('File too large (max 5 MB)', 400);

    const base64 = arrayBufferToBase64(buffer);
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Generate a UUID-like filename using the Web Crypto API
    const filename = `${crypto.randomUUID()}${ext}`;
    await env.RESUME_KV.put(`upload:${filename}`, dataUrl);

    const path = `/api/uploads/${filename}`;
    return new Response(JSON.stringify({ success: true, data: { path, filename } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return err('Upload failed');
  }
};
