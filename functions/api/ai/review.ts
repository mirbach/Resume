import { type Env, ok, err, authGuard } from '../../_shared/helpers';

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  grok: 'grok-3-mini',
  google: 'gemini-2.0-flash',
};

const CAR_SYSTEM_PROMPT = `You are a management consulting resume expert specialising in the CAR (Challenge–Action–Result) and ELITE (Experience–Leadership–Impact–Transformation–Excellence) frameworks.

Review the provided CAR achievement entry and return a JSON object with this exact shape:
{
  "scores": {
    "challenge": <1-5>,
    "action": <1-5>,
    "result": <1-5>
  },
  "issues": ["<concise issue>", ...],
  "suggestions": {
    "challenge": "<improved text or empty string>",
    "action": "<improved text or empty string>",
    "result": "<improved text or empty string>"
  },
  "overallFeedback": "<2-3 sentence summary>"
}

Scoring criteria:
- Challenge 5: Specific business/technical context, quantified scope, clear stakeholder impact
- Action 5: First-person active verbs, specific steps, demonstrates leadership or skill
- Result 5: Quantified outcome (%, €/$, time saved), attribution to your actions
- Deduct points for: passive voice, vague verbs (e.g. "helped", "worked on"), missing metrics, missing context
Only provide improved text in suggestions when the score is below 4. Return valid JSON only — no markdown, no extra text.`;

// POST /api/ai/review
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;

  try {
    const { challenge, action, result, lang = 'en' } = await request.json() as {
      challenge?: string; action?: string; result?: string; lang?: string;
    };

    // Validate lang enum at runtime (A03)
    if (lang !== 'en' && lang !== 'de') {
      return err('Unsupported language. Only "en" and "de" are supported.', 400);
    }
    // Limit field sizes to prevent API key exhaustion (A04)
    const MAX_FIELD = 2_000;
    if ((challenge?.length ?? 0) > MAX_FIELD || (action?.length ?? 0) > MAX_FIELD || (result?.length ?? 0) > MAX_FIELD) {
      return err('Each CAR field must not exceed 2,000 characters.', 400);
    }

    if (!challenge?.trim() && !action?.trim() && !result?.trim()) {
      return err('At least one CAR field must have content.', 400);
    }

    const raw = await env.RESUME_KV.get('settings');
    const settings = raw ? JSON.parse(raw) as Record<string, unknown> : null;
    const ai = settings?.ai as { provider?: string; apiKey?: string; model?: string } | undefined;

    if (!ai?.apiKey?.trim()) {
      return err('AI API key not configured. Go to Settings → AI Assistant to add your key.', 400);
    }

    const provider = ai.provider ?? 'openai';
    const model = (ai.model?.trim() || DEFAULT_MODELS[provider as string]) as string;
    const apiKey = ai.apiKey.trim();

    const userMessage = `Review this CAR achievement (language: ${lang.toUpperCase()}):

Challenge: ${challenge || '(empty)'}
Action: ${action || '(empty)'}
Result: ${result || '(empty)'}`;

    let rawJson = '';

    if (provider === 'google') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: CAR_SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[ai] Google AI error (${res.status}):`, body);
        return err('AI review failed. Please try again later.');
      }
      const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
      rawJson = data.candidates[0]?.content?.parts[0]?.text ?? '';
    } else {
      const baseUrl = provider === 'grok' ? 'https://api.x.ai/v1' : 'https://api.openai.com/v1';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: CAR_SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return err('Invalid AI API key.', 400);
        return err('AI review failed. Please try again later.');
      }
      const data = await res.json() as { choices: { message: { content: string } }[] };
      rawJson = data.choices[0]?.message?.content ?? '';
    }

    const parsed = JSON.parse(rawJson);
    return ok(parsed);
  } catch (e) {
    console.error('[ai] Review error:', e);
    return err('AI review failed. Check server logs for details.');
  }
};
