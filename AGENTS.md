# AGENTS.md

## Cursor Cloud specific instructions

This is a single, client-side React 19 + TypeScript SPA built with Vite. It is an
Austrian legal cost calculator (RATG/GGG). There is no backend, database, or
container — everything runs in the browser and persists to `localStorage`.

### Services / commands
- Dev server: `npm run dev` (Vite, serves on port `3000`, bound to `0.0.0.0`; see `vite.config.ts`).
- Build: `npm run build` (production build via Vite/esbuild).
- Preview built output: `npm run preview`.
- There is no `lint` or `test` script defined in `package.json`.

### Non-obvious gotchas
- Dependency install REQUIRES `npm install --legacy-peer-deps`. Plain `npm install`/`npm ci`
  fail because `lucide-react@0.344.0` declares a React `^16/17/18` peer range while the
  project uses React 19 (it works fine at runtime; the conflict is peer-metadata only).
- At runtime the browser loads React, react-dom, lucide-react, jspdf, etc. from CDNs via the
  importmap in `index.html`, plus Tailwind and Google Fonts from CDN. So the browser needs
  outbound network access to render the app; the local `node_modules` is used for build tooling/typecheck.
- `npx tsc --noEmit` reports a few PRE-EXISTING type errors. They do not block `npm run build`
  (esbuild does not type-check). Do not treat these as caused by your changes.
- Standalone calculation sanity script: `npx tsx test-haft-tarife.ts` (no runner is configured
  in `package.json`; `tsx` is fetched on demand via `npx`).
- Optional `OPENROUTER_API_KEY` (and legacy `GEMINI_API_KEY`) can be set in `.env.local` to
  enable the AI PDF document-extraction feature; all calculator/PDF/CSV features work without it.
