import { Router, Request, Response } from 'express';
import { readJson, writeJson } from '../lib/storage.js';
import { resumeDataSchema } from '../lib/schemas.js';
import type { ResumeData } from '../types.js';

const router = Router();

// GET /api/resume - get the full bilingual resume data
// Falls back to resume.example.json on a fresh clone where resume.json doesn't exist yet.
router.get('/', async (_req: Request, res: Response) => {
  try {
    let data: ResumeData;
    try {
      data = await readJson<ResumeData>('resume.json');
    } catch {
      data = await readJson<ResumeData>('resume.example.json');
    }
    res.json({ success: true, data });
  } catch {
    res.status(404).json({ success: false, error: 'Resume data not found' });
  }
});

// PUT /api/resume - save the full bilingual resume data
router.put('/', async (req: Request, res: Response) => {
  try {
    const result = resumeDataSchema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      res.status(400).json({ success: false, error: `Invalid resume data: ${issues.join('; ')}` });
      return;
    }
    const data = result.data as ResumeData;
    await writeJson('resume.json', data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save resume data' });
  }
});

export default router;
