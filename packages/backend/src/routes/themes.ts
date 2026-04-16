import { Router, Request, Response } from 'express';
import { readJson, writeJson, listJsonFiles, deleteFile } from '../lib/storage.js';
import type { ResumeTheme, ThemeListItem } from '../types.js';

const router = Router();

function getParam(params: Record<string, string | string[]>, key: string): string {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

// GET /api/themes - list all themes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const files = await listJsonFiles('themes');
    const themes: ThemeListItem[] = await Promise.all(
      files.map(async (filename) => {
        const theme = await readJson<ResumeTheme>(`themes/${filename}`);
        return { name: theme.name, filename: filename.replace('.json', '') };
      })
    );
    res.json({ success: true, data: themes });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to list themes' });
  }
});

// GET /api/themes/:name - get a specific theme
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const name = sanitizeFilename(getParam(req.params, 'name'));
    const theme = await readJson<ResumeTheme>(`themes/${name}.json`);
    res.json({ success: true, data: theme });
  } catch {
    res.status(404).json({ success: false, error: 'Theme not found' });
  }
});

// POST /api/themes - create a new theme
router.post('/', async (req: Request, res: Response) => {
  try {
    const theme = req.body as ResumeTheme;
    const filename = sanitizeFilename(theme.name.toLowerCase().replace(/\s+/g, '-'));
    await writeJson(`themes/${filename}.json`, theme);
    res.status(201).json({ success: true, data: theme });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to create theme' });
  }
});

// PUT /api/themes/:name - update a theme
router.put('/:name', async (req: Request, res: Response) => {
  try {
    const name = sanitizeFilename(getParam(req.params, 'name'));
    const theme = req.body as ResumeTheme;
    await writeJson(`themes/${name}.json`, theme);
    res.json({ success: true, data: theme });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update theme' });
  }
});

// DELETE /api/themes/:name - delete a theme
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    const name = sanitizeFilename(getParam(req.params, 'name'));
    if (name === 'default') {
      res.status(400).json({ success: false, error: 'Cannot delete the default theme' });
      return;
    }
    await deleteFile(`themes/${name}.json`);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete theme' });
  }
});

function sanitizeFilename(name: string): string {
  // Only allow alphanumeric, hyphens, underscores
  return name.replace(/[^a-zA-Z0-9_-]/g, '');
}

export default router;
