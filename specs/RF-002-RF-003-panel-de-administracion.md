---
rf: RF-002, RF-003, RF-012
titulo: Panel de administración — aprobar paseadores y ver emergencias sin curl
estado: En progreso
modulo: Walkers
sprint: por asignar
prioridad: Media
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-25
---

# RF-002 + RF-003 — Panel de administración

> Vault: [[Backlog - Perfil de usuario y panel de administración]] (contexto y por qué)
> Extiende: `RF-002-RF-003-paseadores-verificados.md`.

## Historia de usuario
Como **administrador** quiero **aprobar o rechazar paseadores y ver las emergencias activas desde la app** para **operar el piloto sin depender de `curl` con headers de desarrollo**.

## Por qué ahora
`GET /admin/walkers?status=Pending`, `POST /admin/walkers/{id}/approve`, `POST /admin/walkers/{id}/reject` y `GET /walks/{id}/alerts` ya existen en la API (RF-002/RF-003, RF-012) y están protegidos por `WaggoPolicies.Admin`. Hasta este slice, la única forma de usarlos era `curl -H "X-Dev-User-Id: ..." -H "X-Dev-Roles: admin"` (ver `waggo-api/README.md`) — no era sostenible ni siquiera para el piloto (RNF-006: 500 dueños / 50 paseadores).

## Alcance por slice
| Slice | Qué cubre | Estado |
|---|---|---|
| 1 — Cola de verificación de paseadores | Listar pendientes, aprobar, rechazar con motivo | ✅ Implementado |
| 2 — Alertas de emergencia y anomalías | Ver `GET /walks/{id}/alerts` de todos los paseos activos, no solo uno | ⏳ Pendiente |
| 3 — Paseos en curso | Vista operativa de todos los paseos activos | ⏳ Pendiente |

Los slices 2 y 3 necesitan un endpoint nuevo (hoy `/walks/{id}/alerts` es por paseo, no global); quedan para una iteración siguiente.

## Decisiones tomadas (slice 1)
- **Vive dentro de `waggo-mobile`**, no un cliente web aparte: reutiliza sesión, `httpClient` y tema; ruta `/admin`, visible solo si `IsAdmin` (decodificado del `roles` del access token, cliente). La API sigue siendo la que de verdad autoriza cada llamada.
- **Sin pantalla nueva de "quién tiene acceso"**: por ahora solo el admin sembrado en Development (`chore/seed-admin-user`); seguir usando migraciones a mano para sembrar más admins, como ya documenta ADR-016.

## Tabla de ejemplos (slice 1 — mobile, sobre endpoints existentes)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | Cuenta sin rol `admin` entra a `/admin` | Redirige a `/inicio`; el link "Admin" no aparece en el inicio | Feliz |
| 2 | Cuenta con rol `admin`, hay paseadores `Pending` | Lista cada uno con nombre, documento, celular, experiencia | Feliz |
| 3 | No hay paseadores pendientes | "No hay paseadores por verificar." | Límite |
| 4 | Admin presiona "Aprobar" | `POST /admin/walkers/{id}/approve`; desaparece de la cola | Feliz |
| 5 | Admin presiona "Rechazar", escribe un motivo y confirma | `POST /admin/walkers/{id}/reject` con `{ reason }`; desaparece de la cola | Feliz |
| 6 | Admin presiona "Rechazar" sin escribir motivo | "Confirmar rechazo" queda deshabilitado | Límite |
| 7 | La lista falla al cargar | "No pudimos cargar los paseadores pendientes." | Error |

## Preguntas abiertas para el PO
- [x] ¿Vive dentro de `waggo-mobile` o es un cliente web aparte? → Dentro de `waggo-mobile` (ver Decisiones tomadas).
- [ ] ¿Quién más, además del admin sembrado en Development, necesita este acceso en el piloto?
- [ ] Slices 2 y 3: ¿prioridad para el endpoint global de alertas/paseos en curso, o se deja para después del login social?

## Trazabilidad

### Slice 1 — Cola de verificación de paseadores ✅
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-mobile | `src/shared/auth/roles.ts` (`useIsAdmin`); `src/features/admin/{api/adminWalkersApi.ts, hooks/useAdminWalkers.ts, components/{AdminLink,PendingWalkerCard}.tsx, screens/AdminWalkersScreen.tsx}`; `src/app/admin/index.tsx`; `src/features/home/screens/HomeScreen.tsx` (link condicional); `src/features/walker/index.ts` (expone `WalkerProfile`) | `*.test.ts[x]` junto a cada archivo |
| waggo-api | Ninguno — reutiliza `GET/POST /admin/walkers` ya implementado (RF-002/RF-003) | — |
