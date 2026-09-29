---
rf: RF-019
titulo: Cotización de tarifa con desglose de comisión
estado: Implementada
modulo: Pricing
sprint: 0
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-09-28
---

# RF-019 — Cotización de tarifa (incluye el cálculo de RF-018)

> Vault: `01 Proyecto/Requerimientos funcionales.md` · `03 Desarrollo/Flujo TDD.md#Ejemplo real RF-019` · Roadmap: sprint 0

Spec escrita **después** de implementar el slice, como referencia de nivel de detalle para las siguientes.

## Historia de usuario
Como **dueño** quiero **ver el precio de un paseo según su tipo y duración** para **decidir antes de confirmarlo**.

## Criterios de aceptación
- [x] El precio es visible antes de confirmar, según duración y tipo (RF-019).
- [x] La respuesta desglosa la comisión de la plataforma y lo que recibe el paseador (cálculo de RF-018; la retención real en la pasarela es del sprint 7).
- [x] Duraciones inválidas se rechazan con un error de negocio identificable.

## Tabla de ejemplos
| # | Tipo | Minutos | Total | Comisión | Paseador | Tipo de caso |
|---|---|---|---|---|---|---|
| 1 | Individual | 60 | 23.000 | 4.600 | 18.400 | Feliz |
| 2 | Individual | 30 | 15.500 | 3.100 | 12.400 | Límite inferior |
| 3 | Group | 45 | 11.800 *(11.750 redondeado)* | 2.360 | 9.440 | Redondeo |
| 4 | Individual | 20 | ❌ `Pricing.InvalidDuration` | | | Error: menor al mínimo |
| 5 | Individual | 50 | ❌ `Pricing.InvalidDuration` | | | Error: no es múltiplo de 15 |
| 6 | Skateboard | 60 | ❌ `Request.InvalidValue` | | | Error capa 1 (DTO) |
| 7 | *(vacío)* | 60 | ❌ `Request.Required` | | | Error capa 1 (DTO) |
| 8 | Individual | 60, rol `walker` | ❌ 403 `Auth.Forbidden` | | | Error de autorización |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Tarifa `Individual` | $8.000 base + $250/min | ⚠️ provisional |
| Tarifa `Group` | $5.000 base + $150/min | ⚠️ provisional |
| Duración | 30–120 min, múltiplos de 15 | ⚠️ provisional |
| Comisión de la plataforma | 20 % | ⚠️ provisional |
| Redondeo del total | Al múltiplo de $100 más cercano | ⚠️ provisional |
| Moneda | COP | SRS (Colombia) |

Todos los valores viven en `appsettings.json › Pricing`, no en el código.

## Contrato de API
`GET /api/v1/pricing/quote?walkType={Individual|Group}&durationMinutes={int}` · Autorización: `WaggoPolicies.Owner` (owner o admin)

Response `200` (`WaggoApiResponse<FareQuoteResponse>`):
```json
{ "success": true,
  "data": { "walkType": "Individual", "durationMinutes": 60, "currency": "COP",
            "total": 23000, "commission": 4600, "walkerPayout": 18400 },
  "pagination": null, "errors": [], "warnings": [], "infos": [], "traceId": "..." }
```

### Validación capa 1 — DTO (`QuoteFareRequestValidator`)
| Campo | Regla | `code` |
|---|---|---|
| `walkType` | Obligatorio | `Request.Required` |
| `walkType` | Uno de `Individual`, `Group` | `Request.InvalidValue` ("Usa uno de estos valores: Individual, Group.") |
| `durationMinutes` | Obligatorio | `Request.Required` |
| `durationMinutes` | Mayor que cero | `Request.InvalidValue` |

### Validación capa 2 — negocio (`QuoteFareQueryValidator`)
| Regla | `code` | HTTP |
|---|---|---|
| Duración entre 30 y 120 min, múltiplo de 15 | `Pricing.InvalidDuration` | 400 |
| Tipo de paseo con tarifa configurada | `Pricing.WalkTypeNotPriced` | 400 |

### Excepciones
Ninguna propia: es una consulta sin estado. Aplican las transversales (401, 403 `Auth.Forbidden`, 429, 500).

## Diseño
Flujo: `PricingEndpoints` (filtro capa 1) → `QuoteFareHandler` (capa 2 + `ConcatStacks`) → `IPricingTableProvider` → `FareCalculator` → `WaggoResponse<FareQuoteResponse>` → `ToApiResult()` → `WaggoApiResponse<FareQuoteResponse>`. Detalle en `02 Arquitectura/Backend - Clean Architecture.md`.

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| RNF-009 | Carpetas por tipo con subcarpeta `Pricing/` (ADR-012 (vault `05 Decisiones`)) | `LayerTests` |
| RNF-004 | El desglose no maneja datos de tarjeta | `Domain_NeverStoresCardData_Rnf004` |

## Preguntas abiertas para el PO
- [ ] Tipos de paseo definitivos y tarifas reales.
- [ ] Porcentaje de comisión real.
- [ ] Reglas de duración (mínimo, máximo, paso).

## Trazabilidad
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | `Waggo.Domain/{ValueObjects,Enums,Errors,Services}/Pricing/*`, `Waggo.Application/Pricing/Queries/QuoteFare/*`, `Waggo.Application/Common/Interfaces/Pricing/IPricingTableProvider.cs`, `Waggo.Infrastructure/{Services,Options}/Pricing/*`, `Waggo.Api/Endpoints/Pricing/{PricingEndpoints.cs, Requests/QuoteFareRequest.cs, Validators/QuoteFareRequestValidator.cs}` | `Tests/Waggo.Domain.UnitTests/ValueObjects/Pricing/{MoneyTests, WalkDurationTests, CommissionRateTests}`, `Tests/Waggo.Domain.UnitTests/Services/Pricing/FareCalculatorTests`, `Tests/Waggo.Application.UnitTests/Pricing/Queries/QuoteFare/{QuoteFareHandlerTests, QuoteFareQueryValidatorTests}`, `Tests/Waggo.Api.UnitTests/Endpoints/Pricing/Validators/QuoteFareRequestValidatorTests`, `Tests/Waggo.Api.IntegrationTests/Endpoints/Pricing/FareQuoteEndpointTests` |
| waggo-mobile | `src/features/pricing/{api/pricingApi.ts, hooks/useFareQuote.ts, components/FareQuoteCard.tsx, screens/FareQuoteScreen.tsx, model/formatMoney.ts, model/types.ts}` | `pricingApi.test.ts`, `FareQuoteCard.test.tsx`, `FareQuoteScreen.test.tsx`, `formatMoney.test.ts` |
