---
rf: RF-002, RF-003, RF-012
titulo: Panel de administración — aprobar paseadores y ver emergencias sin curl
estado: En progreso
modulo: Walkers
sprint: por asignar
prioridad: Media
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-27
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
| 6 | Admin presiona "Rechazar" y confirma sin escribir motivo | "Confirmar rechazo" está habilitado: el motivo es opcional (decisión del PO, 2026-10-27) y el paseador ve el rechazo sin motivo | Límite |
| 7 | La lista falla al cargar | "No pudimos cargar los paseadores pendientes." | Error |

> [!note] Cambio posterior (propuesta de diseño, 2026-10-27; ajusta los ejemplos 2, 6 y 7)
> Implementado según `design/propuesta/07` · pantallas 35–36, por orden del PO:
> - **Pantalla**: `AdminScreen` reemplaza a `AdminWalkersScreen`. Barra con flecha de volver, antetítulo "ADMINISTRACIÓN", título "Verificación" u "Operación" y selector **Paseadores / Operación** (`shared/ui/SegmentedControl`, rol `tab`). Se quitó `BrandMark`.
> - **Tarjeta** (`PendingWalkerCard`): inicial, nombre, "Enviado hace 2 días", Documento "CC •••• 4050", Celular "300 123 4567", experiencia entre comillas, "Rechazar" (secundario) y "Aprobar". Contador "PENDIENTES · n".
> - **Rechazar**: hoja (`shared/ui/BottomSheet`) "Rechazar a Andrés Gómez" con el motivo **opcional** (máximo 300 caracteres; decisión del PO, 2026-10-27: antes eran mínimo 5 y la API lo exigía). "Confirmar rechazo" siempre está habilitado. Ejemplo 6 ampliado.
> - **Aprobado**: aviso "Aprobaste a Andrés Gómez." (`Banner` `success`, en lugar del toast del diseño). Si aprobar o rechazar falla, se muestra el `message` de la API.
> - **Estados**: carga con esqueletos ("Cargando paseadores pendientes"); vacío "No hay paseadores por verificar." + "Cuando alguien envíe su perfil, aparecerá aquí."; error "No pudimos cargar los paseadores pendientes." con "Intentar de nuevo" (ejemplo 7).
> - **Operación (slices 2–3)**: la UI está lista (`OperationPanel`: "EMERGENCIAS ACTIVAS · n" con "Ver paseo", "ALERTAS AUTOMÁTICAS · n", pestaña "En curso · n" con "señal hace …", "Aceptado" y "Sin señal" si no hay punto en 2 min ⚠️ provisional), pero los datos vienen de `useAdminOperations`, que hoy devuelve `available: false` y la pantalla muestra **"Próximamente"**. Falta en waggo-api un endpoint global, p. ej. `GET /api/v1/admin/operations` (o `GET /admin/alerts?active=true` + `GET /admin/walks?status=InProgress,Accepted`) con: alerta (`id`, `walkId`, `kind`, `petName`, `walkerName`, `ownerName`, `raisedAt`) y paseo (`walkId`, `petName`, `walkerName`, `area`, `status`, minutos transcurridos/duración, `lastSignalAt`). Tipos en `features/admin/model/operations.ts`. El mapa de la ciudad espera al proveedor de mapas; la lista es su alternativa accesible. En tablet/web (1024 px) se mantiene la columna centrada de 480 px, no las dos columnas del diseño.
> - **Sin implementar** (`nueva — requiere spec`): botón "ver" para desenmascarar el documento (la API solo devuelve los 4 últimos dígitos y registrar cada vista requiere spec); "Ver paseo" abre por ahora el detalle de paseo del dueño (`/paseos/[id]`) a falta de una vista de paseo para admin.

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

### Rediseño (propuesta 2026-10) y UI de Operación (slices 2–3 sin API)
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-mobile | `src/features/admin/{screens/AdminScreen.tsx, components/{PendingWalkerCard, RejectWalkerSheet, OperationPanel}.tsx, hooks/useAdminOperations.ts, model/{format, operations}.ts}`; `src/shared/ui/{BottomSheet, SegmentedControl}.tsx`; `src/app/admin/index.tsx` | `AdminScreen.test.tsx` (ejemplos 2–7), `OperationPanel.test.tsx`, `format.test.ts`, `BottomSheet.test.tsx`, `SegmentedControl.test.tsx` |
