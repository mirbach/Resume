# Copilot Instructions — Resume Builder

## Project Overview

A bilingual (EN/DE) consulting resume builder designed around the **CAR** (Challenge–Action–Result) and **ELITE** (Experience–Leadership–Impact–Transformation–Excellence) frameworks. Consultants enter data once in both languages; the app renders a live preview and exports branded PDFs per client company.

## Repository Structure

```
packages/
  backend/          Express 5 + TypeScript API (port 3001)
    src/
      index.ts            Express app entry point
      types.ts            Shared type definitions (keep in sync with frontend)
      lib/storage.ts      JSON file read/write helpers
      middleware/auth.ts  Optional OIDC bearer-token guard
      routes/
        resume.ts         GET/PUT /api/resume
        themes.ts         CRUD  /api/themes
        uploads.ts        POST  /api/upload/photo|logo, GET /api/uploads/:file
        settings.ts       GET/PUT /api/settings
    data/
      resume.json         Persisted resume (single source of truth)
      settings.json       Auth config
      themes/             One JSON file per theme (default.json always present)
      uploads/            Uploaded images (gitignored)

  frontend/         React 18 + Vite 6 + Tailwind CSS v4 SPA (port 5173)
    src/
      App.tsx             Root — split-pane layout, toolbar, state management
      lib/
        types.ts          All TypeScript interfaces (canonical for frontend)
        api.ts            Typed fetch wrappers for the backend
        resolve.ts        resolveResume(data, lang) → single-language display types
      components/
        editor/
          BilingualField.tsx        Reusable DE+EN side-by-side input
          ResumeEditor.tsx          Tabbed container for all 10 section forms
          forms/                    One form component per resume section
          theme/ThemeEditor.tsx     Full theme CRUD modal
        resume/                     Display-only components (receive ResolvedResume)
        toolbar/                    LanguageSwitcher, ThemeSelector
        pdf/
          ResumePdfDocument.tsx     @react-pdf/renderer document
          PdfExportButton.tsx       Client-side blob download
        SettingsPage.tsx            OIDC configuration UI
```

## Key Conventions

### Bilingual Data
- **All user-visible text** that varies by language uses `BilingualText: { en: string; de: string }`.
- Fields that are language-neutral (dates, emails, URLs, company names, tag lists) stay as plain `string` or `string[]`.
- `resolveResume(data, lang)` converts `ResumeData` → `ResolvedResume` for rendering. Always use resolved types in display/PDF components, never raw `ResumeData`.

### Type Sync
- `packages/backend/src/types.ts` is a manual copy of the relevant interfaces from `packages/frontend/src/lib/types.ts`.
- **Whenever a shared interface changes, update both files.**

### IDs
- Every array entry that users can add/remove/reorder carries a `uuid` `id` field.
- Frontend uses `import { v4 as uuidv4 } from 'uuid'` for new entries.

### Editor Form Pattern
Each form in `components/editor/forms/` follows this contract:
```tsx
interface Props {
  data: SomeEntryType[];   // or single object for non-array sections
  onChange: (data: ...) => void;
}
```
- Never call the API directly from form components — bubble changes up to `App.tsx` via `onChange`.
- `App.tsx` debounces saves (1 s) and calls `saveResume()`.

### Display Component Pattern
Components in `components/resume/` receive `(data: ResolvedXxx, theme: ResumeTheme)` and are purely presentational. They apply `theme.colors.*` and `theme.fonts.*` via inline `style` props — **do not hard-code colours**.

### PDF Components
- Mirror the display component logic but use `@react-pdf/renderer` primitives (`View`, `Text`, `Image`).
- Styles are created inside `createStyles(theme)` using `StyleSheet.create()`.
- Fonts are registered at module level with `Font.register()`.
- Pass `theme` explicitly through `renderPdfSection(section, resume, styles, theme)`.

### Theme System
- Each theme is a `ResumeTheme` JSON stored in `data/themes/<name>.json`.
- `default` theme cannot be deleted.
- `companyName` and `logo` (upload path) appear **top-right** in the resume header — used for consulting company branding per engagement.
- Filenames are sanitised (`sanitizeFilename`) before use as file paths.

### API Layer
- All API calls go through `packages/frontend/src/lib/api.ts`.
- Responses follow `ApiResponse<T> { success: boolean; data?: T; error?: string }`.
- Vite dev server proxies `/api/*` → `http://localhost:3001`.
- File uploads use `multipart/form-data` via `multer`; other endpoints use `application/json`.

### Auth Middleware
- Auth is opt-in, configured via `Settings → Authentication`.
- When `auth.enabled = false`, all API routes are public.
- The middleware currently checks for a Bearer token but **full OIDC JWT validation is not yet implemented** — marked with a TODO in `middleware/auth.ts`.

## Running Locally

```bash
npm install          # installs all workspace deps
npm run dev          # starts backend (3001) + frontend (5173) concurrently
```

Frontend: http://localhost:5173  
Backend:  http://localhost:3001/api/health

## Building

```bash
npm run build        # compiles backend (tsc) then frontend (tsc + vite build)
```

## Data Storage

- All state lives in JSON files under `packages/backend/data/`.
- No database. No migration system.
- `resume.json` is the single document for the consultant's data.
- Multiple themes can exist; the active theme is selected in the UI at runtime (not persisted as a setting).

## What NOT to Do

- Do not add a database or ORM unless explicitly requested.
- Do not split `resume.json` into per-language files — bilingual data is stored together.
- Do not call the API from display or PDF components.
- Do not hard-code colours or fonts in display/PDF components — always use `theme.*`.
- Do not remove the `default` theme guard in `routes/themes.ts`.
- Do not add SSR or routing — this is a single-page application.

## After Finishing a Task

After completing any task that touches source files:

1. **Run the build**: `npm run build` from the repo root. Fix any TypeScript or Vite errors before declaring done.
2. **Check VS Code Problems panel**: Review all errors and warnings. Fix every error. Fix warnings unless they are intentionally suppressed (e.g. SonarLint `Web:InlineStyleUsedCheck` is disabled because display components require dynamic inline styles for theming).
3. **Accessibility**: All interactive elements (buttons, selects, inputs) must have discernible text — use `aria-label` on icon-only buttons and selects that lack a visible `<label>`.
4. **Do not commit** unless the user explicitly says to commit.
