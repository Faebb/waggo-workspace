---
name: api-contract-change
description: Guía un cambio en el contrato HTTP /api/v1 de Waggo que afecta a waggo-api y waggo-mobile, manteniendo ambos repos compatibles y con PRs enlazados. Úsalo cuando se agregue, renombre o elimine un campo, ruta o código de error.
argument-hint: descripción del cambio
---

Cambio de contrato solicitado: **$ARGUMENTS**

## 1. Clasifica el cambio
| Tipo | Ejemplo | Tratamiento |
|---|---|---|
| Compatible | Campo nuevo opcional en la respuesta, ruta nueva | Mismo `/api/v1` |
| Rompe el contrato | Renombrar o quitar un campo, cambiar tipos, cambiar un código de error | Nueva versión de la ruta **o** despliegue coordinado, más un ADR (`/new-adr`) |

Explica la clasificación y confirma con el usuario antes de seguir si rompe el contrato.

## 2. Actualiza la spec
Edita la sección **Contrato** de la spec afectada en `specs/` (o crea una con `/new-spec`). Es la fuente de verdad del cambio.

## 3. Backend primero
Delega en `tdd-orchestrator` con repo `waggo-api`: el primer ciclo cambia la prueba de integración del endpoint para reflejar el contrato nuevo (rojo) y luego el código (verde). Verifica que `/openapi/v1.json` refleje el cambio.

## 4. Mobile después
Delega en `tdd-orchestrator` con repo `waggo-mobile`: primero la prueba del cliente de API con el esquema Zod nuevo, luego el tipo en `model/` y las pantallas afectadas.

## 5. Enlaza los PRs
Redacta la descripción de los dos PRs, cada uno con el enlace al otro, siguiendo `.github/pull_request_template.md` de cada repo. No los abras sin que el usuario lo pida.

## 6. Documenta
Ejecuta el flujo de `/sync-docs`.
