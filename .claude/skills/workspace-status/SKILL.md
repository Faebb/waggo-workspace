---
name: workspace-status
description: Muestra el estado de los repos de Waggo (rama, cambios sin commit, últimos commits) y las specs en curso. Úsalo al empezar una sesión o antes de planear trabajo.
allowed-tools: Bash(git -C:*) Read Glob Grep
---

## Estado actual

### waggo-api
!`git -C ../waggo-api branch --show-current && git -C ../waggo-api status --short && git -C ../waggo-api log --oneline -5`

### waggo-mobile
!`git -C ../waggo-mobile branch --show-current && git -C ../waggo-mobile status --short && git -C ../waggo-mobile log --oneline -5`

### waggo-workspace
!`git status --short && git log --oneline -5 2>/dev/null || echo "(sin commits)"`

## Instrucciones
Con el estado de arriba y las specs de `specs/` (lee el campo `estado` del frontmatter de cada una), responde en español con:

1. Una tabla por repo: rama, archivos con cambios y último commit.
2. Specs por estado (`Borrador`, `Lista`, `En progreso`, `Implementada`).
3. Si hay cambios sin commit que no correspondan a ninguna spec en progreso, señálalo.
4. El siguiente paso sugerido según `../../../Vault Waggo/04 Planeación/Roadmap MVP.md`.

Sé breve.
