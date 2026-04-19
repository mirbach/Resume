import { type Env, err } from '../../_shared/helpers';

const MIME_FROM_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

// GET /api/uploads/:filename
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const raw = Array.isArray(params.filename) ? params.filename[0] : params.filename;
  // Only allow safe filename characters
  const filename = raw.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!filename) return err('Invalid filename', 400);

  try {
    const dataUrl = await env.RESUME_KV.get(`upload:${filename}`);
    if (!dataUrl) return err('Not found', 404);

    // Parse data URL: data:<mime>;base64,<data>
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return err('Corrupt upload data', 500);

    const [, mime, b64] = match;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return err('Failed to serve file');
  }
};
