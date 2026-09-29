---
name: new-adr
description: Registra una decisión de arquitectura (ADR) de Waggo en el vault de Obsidian con contexto, decisión y consecuencias, y la enlaza desde el MOC. Úsalo cuando se elija una tecnología, un patrón o se cambie una decisión anterior.
argument-hint: "título de la decisión"
---

Registra el ADR: **$ARGUMENTS**

1. Lista `../../../Vault Waggo/02 Arquitectura/ADR/` y toma el siguiente número (`ADR-00N`).
2. Lee dos ADR existentes para respetar el formato exacto: frontmatter (`title`, `tags: [waggo, adr]`, `status`, `date`), `Volver a [[00 - MOC Waggo]]`, callout de estado y secciones **Contexto**, **Decisión**, **Consecuencias** (✅ ventajas, ⚠️ costos, 🔁 cuándo revisarla).
3. Si falta información para el contexto o las alternativas descartadas, pregúntala antes de escribir. No inventes la motivación.
4. Crea `ADR-00N <Título>.md` con estado `Propuesta` (o `Aceptada` si el usuario confirma que ya se decidió).
5. Si reemplaza a otro ADR, marca el anterior como `Reemplazada por [[ADR-00N ...]]`.
6. Agrega el enlace en la línea de decisiones de `00 - MOC Waggo.md`, y en la nota de arquitectura afectada si aplica.
7. Si la decisión cambia reglas de código, indica qué `CLAUDE.md` / `AGENTS.md` y qué agentes de `.claude/agents/` hay que actualizar, y propón el cambio.
