import { Router, Request, Response } from 'express';
import { readJson, subToUserId } from '../lib/storage.js';
import { getProvider, ensureUserData } from '../lib/get-provider.js';
import { resumeDataSchema } from '../lib/schemas.js';
import type { ResumeData } from '../types.js';

const router = Router();

// GET /api/resume - get the full bilingual resume data
router.get('/', async (req: Request, res: Response) => {
  try {
    const provider = await getProvider();
    let data: ResumeData;

    if (req.user) {
      await ensureUserData(provider, req.user.sub);
      const key = `users/${subToUserId(req.user.sub)}/resume.json`;
      data = await provider.readJson<ResumeData>(key);
    } else {
      try {
        data = await provider.readJson<ResumeData>('resume.json');
      } catch {
        data = await readJson<ResumeData>('resume.example.json');
      }
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
    const provider = await getProvider();

    if (req.user) {
      await ensureUserData(provider, req.user.sub);
      const key = `users/${subToUserId(req.user.sub)}/resume.json`;
      await provider.writeJson(key, data);
    } else {
      await provider.writeJson('resume.json', data);
    }

    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to save resume data' });
  }
});

export default router;
