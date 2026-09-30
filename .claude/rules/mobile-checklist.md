# Mobile checklist (waggo-mobile)

Used by `mobile-test-writer`, `mobile-implementer` and `architecture-reviewer`. Source: vault
`02 Arquitectura/Frontend - Expo feature-based.md`, `03 Desarrollo/Convenciones de código.md`, `Convención de respuestas y logging.md#Mobile`.

## 0. Principle
- [ ] **Simplicity first**: small components and hooks, nothing clever.

## 1. Structure
- [ ] `src/app/` routes only (thin) → `src/features/<feature>/{api,hooks,components,screens,model}` → `src/shared/`.
- [ ] A feature is imported only through its `index.ts` (ESLint blocks `@/features/*/*`).
- [ ] Files: `PascalCase.tsx` components, `useX.ts` hooks, `camelCase.ts` modules, `*.test.ts(x)` next to the file.

## 2. Conventions (ESLint + Prettier)
- [ ] Named exports only (default only in `src/app/**`); `type` not `interface`; no `any`; `import type`.
- [ ] UI text in Spanish; code in English.
- [ ] Prettier: width 120, single quotes, trailing commas.
- [ ] Visual design (ADR-013): mobile first, dark theme, yellow as the only accent, Helvetica, Swiss style (no emojis or decorative icons). Only tokens from `src/shared/ui/theme.ts`; no loose colors or font sizes.

## 3. API
- [ ] Calls through `shared/api/httpClient.get(path, zodSchema, params)`; it unwraps `WaggoApiResponse` and returns `{ data, pagination, warnings, infos, traceId }`.
- [ ] `success: false` → `ApiError` (`status`, `code`, `errors`, `traceId`); screens show a friendly Spanish message.
- [ ] Zod schema identical to the spec contract.

## 4. Tests
- [ ] RNTL v14: `await render(...)`, `userEvent`, queries by role/label/text; one test per example row.

## 5. Done
- [ ] `npm run format:check` · `npm run lint` · `npm run typecheck` · `npm test` (coverage ≥ 80 %).
