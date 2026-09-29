---
name: implement-spec
description: Implementa una spec aprobada de Waggo con TDD estricto en ambos repos (backend primero, mobile después) usando el tdd-orchestrator, y termina con revisión de arquitectura, documentación y el título del PR para squash. Úsalo cuando una spec de specs/ esté en estado Lista.
argument-hint: RF-XXX
arguments: [rf]
disable-model-invocation: true
---

Implementa la spec de **$rf**.

## 0. Preparación
- Abre `specs/$rf-*.md`. Si no existe, detente y sugiere `/new-spec $rf`.
- Si el estado no es `Lista` ni `En progreso`, detente y pide confirmación: una spec en `Borrador` no está aprobada por el PO.
- Revisa `git -C ../waggo-api status` y `git -C ../waggo-mobile status`. Si hay cambios sin commit ajenos a esta spec, avisa antes de seguir.
- Si algún repo está en `main`, propón crear la rama `feat/<ticket>-<slug>` según `../../../Vault Waggo/03 Desarrollo/Convenciones de Git y ramas.md`. No trabajes sobre `main`.
- Pregunta al usuario si quiere **commits locales por fase** (`test` → `feat` → `refactor`). Son la evidencia TDD dentro del PR; al hacer squash, en `main` queda uno solo.
- Cambia el estado de la spec a `En progreso`.

## 1. Ciclo TDD
Delega en `tdd-orchestrator`:
> Implementa `specs/$rf-*.md` con TDD. Repos: <los que toque la spec>, backend primero. Commits por fase: <sí/no>.

Cuando el backend termine, si el contrato real difiere de la spec, actualiza la sección **Contrato** de la spec antes de que empiece el mobile.

## 2. Revisión
Delega en `architecture-reviewer`. Si reporta bloqueantes, pide al `tdd-orchestrator` un ciclo nuevo para cada uno: primero una prueba que exponga el problema y luego la corrección.

## 3. Cierre
- Actualiza la sección **Trazabilidad** de la spec con los archivos y las pruebas reales, y pon el estado en `Implementada`.
- Ejecuta el flujo de `/sync-docs`.
- Redacta para cada repo el **título del PR**, que será el único commit en `main` tras el squash, en Conventional Commits: `feat(<modulo>): <resumen> (RF-XXX)`. Redacta también la descripción siguiendo `.github/pull_request_template.md`, con los PRs de ambos repos enlazados entre sí.
- No hagas push ni abras PRs sin que el usuario lo pida.

Informa al final: tabla de ciclos TDD del orquestador, resultado de la revisión, notas del vault actualizadas y títulos de PR propuestos.
