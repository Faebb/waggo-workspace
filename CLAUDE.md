# Waggo workspace

Coordination repo for Waggo. It holds no product code: specs, Claude Code agents and skills, and copies of each repo's README. Product code lives in the sibling repos (ADR-001):

| Path (from this repo) | Repo | Stack | Rules |
|---|---|---|---|
| `../waggo-api` | `Faebb/waggo-api` | .NET 10, Clean Architecture, PostgreSQL + PostGIS | `../waggo-api/CLAUDE.md` |
| `../waggo-mobile` | `Faebb/waggo-mobile` | Expo SDK 57, TypeScript, feature-based | `../waggo-mobile/AGENTS.md` |
| `../../../Vault Waggo` | Obsidian vault (not a repo) | Spanish docs | `00 - MOC Waggo.md` |

Before editing a product repo, read that repo's rules file and the checklist in `.claude/rules/` (`backend-checklist.md`, `mobile-checklist.md`). Code, comments and commits are in English; docs, specs and user-facing messages in Spanish. Use `Vault Waggo/01 Proyecto/Glosario.md` to name things.

**Simplicity first**: the simplest code that is understandable at a glance. New work only follows the existing rules; if a rule is missing or wrong, propose an ADR (`/new-adr`) instead of improvising.

## How work flows here

1. Every feature starts as a spec in `specs/` (template: `specs/_template.md`). No product code for an RF without a spec in state `Lista` or later.
2. Implementation follows TDD in each repo, backend first, then mobile, driven by the spec's examples table.
3. After implementing, the spec moves to `Implementada` and `/sync-docs` updates the vault and `projects/`.

Delegate to the agents in `.claude/agents/` when the task matches their role. The skills in `.claude/skills/` hold the step-by-step flows.

## Vault note map

| Need | Note |
|---|---|
| Requirements (RF / RNF) | `01 Proyecto/Requerimientos funcionales.md`, `Requerimientos no funcionales.md` |
| Architecture + ADRs | `02 Arquitectura/`, `02 Arquitectura/ADR/` |
| TDD, tests, Git, DoD, CI | `03 Desarrollo/` |
| Folder structure (where each file goes) | `03 Desarrollo/Estructura de carpetas del backend.md` (ADR-012) |
| Code conventions (naming, no `var`, style) | `03 Desarrollo/Convenciones de código.md` (ADR-008) |
| Responses and logging (`WaggoResponse`, `WaggoApiResponse`) | `03 Desarrollo/Convención de respuestas y logging.md` (ADR-007) |
| API pipeline, two-layer validation, exceptions, OAuth 2.0 + roles, rate limiting, health | `02 Arquitectura/API - Pipeline, seguridad y errores.md` (ADR-009, ADR-010, ADR-011) |
| Roadmap, RF → code traceability | `04 Planeación/Roadmap MVP.md`, `Estado de implementación.md` |
| Source SRS | `Requerimientos_App_Paseo_Perros.xlsx` |

## Rules for this repo

- `projects/*/README.md` are copies. Edit the README in the product repo, then run `scripts/sync-readmes.ps1`. Never edit the copies by hand.
- Code is the source of truth for *how*; the vault and specs for *what* and *why*. When they disagree, report it instead of silently picking one.
- A change to the API contract (`/api/v1`) needs coordinated PRs in both repos, linked to each other (`/api-contract-change`).
- Each repo has its own Git history. Commit in the repo that changed, with Conventional Commits, authored as `Faebb`. Never commit without being asked and **never push without the user's explicit approval**.
- When a decision changes a rule, update in the same change: the vault note/ADR, the repo `CLAUDE.md`/`AGENTS.md` and `.claude/rules/*-checklist.md`.
