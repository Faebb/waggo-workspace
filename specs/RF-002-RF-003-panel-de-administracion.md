---
rf: RF-002, RF-003, RF-012
titulo: Panel de administración — aprobar paseadores y ver emergencias sin curl
estado: Borrador
modulo: Walkers
sprint: por asignar
prioridad: Media
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-25
---

# RF-002 + RF-003 — Panel de administración

> Vault: [[Backlog - Perfil de usuario y panel de administración]] (contexto y por qué)
> Extiende: `RF-002-RF-003-paseadores-verificados.md`. Sin tabla de ejemplos ni contrato todavía — es un `Borrador` para que el PO priorice antes de refinarla con `/new-spec`.

## Historia de usuario
Como **administrador** quiero **aprobar o rechazar paseadores y ver las emergencias activas desde la app** para **operar el piloto sin depender de `curl` con headers de desarrollo**.

## Por qué ahora
`GET /admin/walkers?status=Pending`, `POST /admin/walkers/{id}/approve`, `POST /admin/walkers/{id}/reject` y `GET /walks/{id}/alerts` ya existen en la API (RF-002/RF-003, RF-012) y están protegidos por `WaggoPolicies.Admin`. Hoy la única forma de usarlos es `curl -H "X-Dev-User-Id: ..." -H "X-Dev-Roles: admin"` (ver `waggo-api/README.md`) — no es sostenible ni siquiera para el piloto (RNF-006: 500 dueños / 50 paseadores).

## Qué se quiere (sin refinar aún)
- Lista de paseadores pendientes, con sus datos (nombre, documento, teléfono, experiencia) y botones de aprobar/rechazar (con motivo).
- Ver alertas de emergencia y anomalías activas, no solo las que ya quedaron guardadas.
- Ver paseos en curso (vista operativa, no la de un dueño o paseador individual).
- Protegido por el mismo rol `admin` que ya existe; no es una app nueva.

## Preguntas abiertas para el PO
- [ ] ¿Vive dentro de `waggo-mobile` (rutas `/admin/*` visibles solo para `IsAdmin`) o es un cliente web aparte?
- [ ] ¿Quién más, además del admin sembrado en Development, necesita este acceso en el piloto?

## Trazabilidad
Se completa al implementar.
