---
rf: RF-006
titulo: Matching por cercanía con PostGIS
estado: Implementada
modulo: Walks
sprint: 4
prioridad: Alta
repos: [waggo-api]
actualizado: 2026-09-30
---

# RF-006 — Matching por cercanía

> Vault: `01 Proyecto/Requerimientos funcionales.md` (RF-006) · `02 Arquitectura/Base de datos - PostgreSQL.md` · Roadmap: sprint 4 · Depende de RF-007 (slice paseador)

En el slice del paseador (RF-007), las solicitudes se ordenaban por distancia **en memoria**. Este slice pasa esa búsqueda a **PostgreSQL + PostGIS**: la base de datos devuelve solo las solicitudes a menos de **5 km** del paseador, ordenadas por distancia real sobre el elipsoide, usando el índice GiST de `pickup_location`. Así escala a miles de solicitudes (RNF-007), como el despacho de un conductor en Uber.

> [!note] Decisiones asumidas por el desarrollador
> - Radio máximo: **5 km**, provisional.
> - "Paseadores verificados" (la otra mitad de RF-006) depende del registro y la verificación de paseadores (RF-002, RF-003), que todavía no existen: cuando existan, `available` exigirá paseador verificado.
> - Sin ubicación, el paseador sigue viendo todas las solicitudes por hora (útil para planear el día).

## Criterios de aceptación
- [x] Con ubicación, `GET /walks/available` solo devuelve solicitudes a menos de 5 km, de la más cercana a la más lejana.
- [x] El filtro y el orden los resuelve PostGIS (`ST_DWithin`, `ST_Distance`) sobre el índice GiST.
- [x] Sin ubicación, el comportamiento no cambia.

## Tabla de ejemplos
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | Solicitudes a 1 km, 4,9 km y 8 km; el paseador consulta con su ubicación | Aparecen la de 1 km y la de 4,9 km, en ese orden; la de 8 km no | Feliz |
| 2 | Una solicitud a 5,2 km | No aparece | Límite |
| 3 | Consulta sin ubicación | Aparecen todas por hora | Feliz |

## Diseño
- **Domain**: `Services/Walks/WalkMatching.MaxDistanceKm = 5`.
- **Application**: `IWalkRepository.ListRequestedNearAsync(point, radiusKm)`; `ListAvailableWalksHandler` lo usa cuando hay ubicación.
- **Infrastructure**: `WalkRepository.ListRequestedNearAsync` con SQL de PostGIS (un CTE con el punto del paseador, `ST_DWithin` + `ORDER BY ST_Distance` sobre `geography`), que también devuelve `xmin` para el token de concurrencia.

```sql
WITH here AS (SELECT ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography AS point)
SELECT w.*, w.xmin FROM walks.walks w, here
WHERE w.status = 'Requested' AND ST_DWithin(w.pickup_location, here.point, :radius_m)
ORDER BY ST_Distance(w.pickup_location, here.point)
```

## Trazabilidad
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | `Services/Walks/WalkMatching`, `IWalkRepository.ListRequestedNearAsync`, `ListAvailableWalksHandler`, `WalkRepository` | `WalkerEndpointTests.Available_WithLocation_LeavesOutRequestsFartherThan5Km_RF006` (ejemplos 1–3), `ListAvailableWalksHandlerTests` |

> [!note] Cambio posterior (mapas con OpenStreetMap, 2026-10-27)
> En el móvil, las solicitudes que devuelve este endpoint también se ven en el mapa del inicio del paseador (píldoras de precio en el centro de la cuadra, ver RF-007 paseador). Sin cambios de API ni de la regla de 5 km.
