---
rf: RF-007
titulo: Solicitud de paseo — lado del paseador (aceptar)
estado: En progreso
modulo: Walks
sprint: 3
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-09-30
---

# RF-007 (slice paseador) — Ver solicitudes y aceptar

> Vault: `01 Proyecto/Requerimientos funcionales.md` · Roadmap: sprint 3 · Depende de `RF-007-solicitud-de-paseo-dueno.md`

Cierra RF-007 ("el paseador acepta o rechaza"). Como un conductor de Uber, el paseador ve las solicitudes abiertas, las más cercanas primero, con lo que va a ganar, y **la primera persona que acepta se queda con el paseo**. "Rechazar" es simplemente no aceptarla: la solicitud sigue disponible para otros paseadores.

> [!note] Decisiones asumidas por el desarrollador
> - El orden por cercanía usa la distancia en línea recta (haversine) calculada en el dominio. El matching real con PostGIS y paseadores verificados es RF-006 (sprint 4).
> - Mientras no exista el registro de paseadores (RF-002/RF-003), cualquier usuario con rol `walker` puede aceptar. No hay verificación todavía.
> - Mientras no exista el login (ADR-011), la app en **desarrollo** elige su identidad (dueño o paseador) con los headers `X-Dev-User-Id` y `X-Dev-Roles`, que la API solo acepta con el usuario de desarrollo activo.

## Historia de usuario
Como **paseador** quiero **ver los paseos pedidos cerca de mí y lo que voy a ganar, y aceptar uno con un toque** para **llenar mi día de trabajo sin intermediarios**.

## Criterios de aceptación
- [ ] El paseador ve las solicitudes en estado `Requested` que no son suyas como dueño, con tipo, duración, número de perros, zona, hora y **lo que gana** (`walkerPayout`).
- [ ] Si envía su ubicación, las ve ordenadas de la más cercana a la más lejana, con la distancia; si no, por hora del paseo.
- [ ] Al aceptar, el paseo pasa a `Accepted` con su `walkerId`, y el dueño lo ve en su pantalla ("Tu paseador va en camino").
- [ ] Si otro paseador ya la aceptó, recibe un error claro (409). Dos aceptaciones simultáneas no pueden ganar ambas.
- [ ] Un usuario no puede aceptar su propio paseo.
- [ ] El paseador ve los paseos que aceptó y su detalle (dirección exacta e indicaciones).

## Tabla de ejemplos
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | Dueño A pide un paseo; paseador B consulta `GET /walks/available` | La solicitud aparece con `walkerPayout: 18400`, `petCount: 1`, sin `distanceKm` | Feliz |
| 2 | B consulta con `latitude/longitude` y hay dos solicitudes a 1 km y 5 km | La de 1 km primero; `distanceKm` ≈ 1 y ≈ 5 | Feliz |
| 3 | B consulta y A tiene un paseo cancelado | El cancelado no aparece | Límite |
| 4 | A consulta `available` con rol walker | Su propio paseo no aparece | Límite |
| 5 | B `POST /walks/{id}/accept` | 200; `status: Accepted`, `walkerId: B` | Feliz |
| 6 | A consulta `GET /walks/{id}` después | Ve `status: Accepted` y el `walkerId` | Feliz |
| 7 | C acepta el mismo paseo después de B | 409 `Walks.NotAvailable` | Conflicto |
| 8 | A acepta su propio paseo (con rol walker) | 422 `Walks.OwnWalk` | Regla de negocio |
| 9 | B acepta un paseo inexistente | 404 `Walks.NotFound` | Error |
| 10 | B consulta `GET /walks/assigned` | Lista con el paseo aceptado | Feliz |
| 11 | B consulta `GET /walks/{id}` del paseo aceptado | 200 con el detalle | Feliz |
| 12 | C consulta `GET /walks/{id}` del paseo de A aceptado por B | 404 `Walks.NotFound` | Seguridad |
| 13 | Dueño (rol `owner` solo) consulta `available` | 403 `Auth.Forbidden` | Autorización |
| 14 | El dueño cancela un paseo `Accepted` | 200 `Cancelled` (ya cubierto en el slice dueño) | Feliz |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Quién ve una solicitud | Cualquier `walker` que no sea el dueño | ⚠️ provisional (con RF-006: solo verificados y cercanos) |
| Orden | Distancia en línea recta si hay ubicación; si no, hora del paseo | ⚠️ provisional |
| Quién gana | El primero que acepta; concurrencia optimista (`xmin`) | Uber |
| Aceptar el propio paseo | No permitido | Sentido común |
| Qué ve el paseador antes de aceptar | Zona (dirección), hora, tipo, duración, número de perros y ganancia. No ve indicaciones ni notas médicas | ⚠️ provisional |

## Contrato de API
`GET /api/v1/walks/available?latitude=4.65&longitude=-74.05` — `WaggoPolicies.Walker`. Respuesta: lista de `AvailableWalkResponse`:
```json
{ "id": "…", "walkType": "Individual", "durationMinutes": 60, "petCount": 1,
  "pickupAddress": "Cra 7 # 45-10, Bogotá", "latitude": 4.6361, "longitude": -74.0645,
  "scheduledFor": "…", "currency": "COP", "walkerPayout": 18400, "distanceKm": 1.2 }
```
`POST /api/v1/walks/{id}/accept` — `WaggoPolicies.Walker`. Respuesta: `WalkResponse`.
`GET /api/v1/walks/assigned` — `WaggoPolicies.Walker`. Respuesta: lista de `WalkResponse`.
`GET /api/v1/walks/{id}` — ahora también para el paseador asignado (usuario autenticado; el handler verifica que sea el dueño o el paseador).

| Regla | `code` | HTTP |
|---|---|---|
| El paseo ya no está `Requested` | `Walks.NotAvailable` | 409 |
| El paseador es el dueño | `Walks.OwnWalk` | 422 |
| Coordenadas de consulta inválidas | `Walks.InvalidLocation` | 400 |

## Diseño
- **Domain**: `Walk.Accept(walkerId, now)` (`AcceptedAt`), `GeoPoint.DistanceKmTo(other)` (haversine), errores `NotAvailable` (Conflict) y `OwnWalk` (BusinessRule).
- **Application**: `Walks/Commands/AcceptWalk`, `Walks/Queries/{ListAvailableWalks, ListAssignedWalks}`, `Walks/AvailableWalkResponse`; `GetWalk` admite al paseador asignado. `IWalkRepository` suma `ListRequestedAsync` y `ListByWalkerAsync`.
- **Infrastructure**: token de concurrencia `xmin` en `walks` (migración `AddWalkConcurrency`); `WalkRepository.SaveChangesAsync` traduce `DbUpdateConcurrencyException` a `ConflictException(Walks.NotAvailable)`.
- **Mobile**: la bienvenida ofrece "Quiero pasear a mi perro" y "Soy paseador"; `shared/api/devIdentity` fija los headers de identidad de desarrollo; `features/walker` — `WalkerHomeScreen` (`/paseador`: solicitudes cercanas y aceptadas), `WalkOfferScreen` (`/paseador/[id]`: detalle y "Aceptar paseo").

## Plan TDD
**Backend**: `WalkerEndpointTests` (integración) → `WalkTests` (Accept), `GeoPointTests` (distancia) → `AcceptWalkHandlerTests`, `ListAvailableWalksHandlerTests`, `ListAssignedWalksHandlerTests`, `GetWalkHandlerTests` (paseador) → validador de la consulta.
**Mobile**: `devIdentity.test.ts`, `httpClient` (headers), `walkerApi.test.ts`, `WalkerHomeScreen.test.tsx`, `WalkOfferScreen.test.tsx`, `WelcomeScreen.test.tsx`.

## Preguntas abiertas para el PO
- [ ] ¿Qué ve el paseador antes de aceptar? (¿dirección exacta o solo el barrio?, ¿nombres y tamaños de los perros?)
- [ ] ¿Radio máximo para mostrar solicitudes?
- [ ] ¿El paseador puede soltar un paseo ya aceptado? ¿Con penalización?
- [ ] ¿Qué pasa si nadie acepta en X minutos? (¿se cancela sola?, ¿se avisa al dueño?)

## Trazabilidad
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | _se completa al cerrar_ | |
| waggo-mobile | _se completa al cerrar_ | |
