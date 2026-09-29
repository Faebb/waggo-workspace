---
rf: RF-XXX
titulo: <Título corto>
estado: Borrador          # Borrador | Lista | En progreso | Implementada | Obsoleta
modulo: <Identity | Pets | Walks | Tracking | Messaging | Payments | Analytics | Pricing>
sprint: <n>
prioridad: <Alta | Media>
repos: [waggo-api, waggo-mobile]
actualizado: AAAA-MM-DD
---

# RF-XXX — <Título>

> Vault: `01 Proyecto/Requerimientos funcionales.md` · Roadmap: sprint <n>

## Historia de usuario
Como **<actor>** quiero **<acción>** para **<beneficio>**.

## Criterios de aceptación
Copiados del SRS y refinados:
- [ ] ...

## Tabla de ejemplos
Cada fila es al menos una prueba. Incluye casos felices, límites y errores.

| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | ... | ... | Feliz |
| 2 | ... | ... | Límite |
| 3 | ... | ❌ `<Modulo>.<Error>` | Error |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| ... | ... | SRS / PO / ⚠️ provisional |

## Contrato de API
`<MÉTODO> /api/v1/<ruta>` · Autorización: <anónimo (`AllowAnonymous`) | `WaggoPolicies.Owner` | `WaggoPolicies.Walker` | `WaggoPolicies.Admin`>

Request (DTO `Waggo.Api/Endpoints/<Módulo>/Requests/<X>Request.cs`):
```json
{}
```

Toda respuesta (éxito o error) va en `WaggoApiResponse` (vault `03 Desarrollo/Convención de respuestas y logging.md`). `pagination` es `null` si el endpoint no pagina.

Response `200`:
```json
{ "success": true, "data": { }, "pagination": null, "errors": [], "warnings": [], "infos": [], "traceId": "..." }
```

### Validación capa 1 — DTO (`Waggo.Api/Endpoints/<Módulo>/Validators/<X>RequestValidator.cs`)
Forma del request: obligatorios, formatos, valores permitidos. Responde 400 antes de llegar al handler.

| Campo | Regla | `code` | Mensaje (español, dice cómo resolverlo) |
|---|---|---|---|
| ... | Obligatorio | `Request.Required` | ... |
| ... | Valor permitido | `Request.InvalidValue` | ... |

### Validación capa 2 — negocio (`Waggo.Application/<Módulo>/{Commands|Queries}/<CasoDeUso>/<X>Validator.cs`)
Reglas de negocio acumulables. Los errores se definen en `Waggo.Domain/Errors/<Módulo>/<Módulo>Errors.cs`.

| Regla | `code` | HTTP | Mensaje |
|---|---|---|---|
| ... | `<Módulo>.<Regla>` | 400 | ... |

### Excepciones (situaciones que impiden continuar)
| Situación | Excepción | `code` | HTTP |
|---|---|---|---|
| ... | `NotFoundException` | `<Módulo>.NotFound` | 404 |
| ... | `ConflictException` / `BusinessRuleException` / `ForbiddenException` / `ExternalServiceException` | ... | 409 / 422 / 403 / 503 |

Transversales (no se repiten en cada spec): 401 `Auth.Unauthorized`, 403 `Auth.Forbidden` (rol sin permiso), 429 `Http.TooManyRequests`, 500 genérico con `traceId`.

## Diseño
Rutas según ADR-012 (vault `05 Decisiones`) y `.claude/rules/backend-checklist.md`.

### Backend (`waggo-api`)
| Capa | Archivos nuevos o modificados |
|---|---|
| Domain | `Waggo.Domain/{Entities,ValueObjects,Enums,Errors,Services}/<Módulo>/...`, excepciones en `Waggo.Domain/Exceptions/` |
| Application | `Waggo.Application/<Módulo>/{Commands|Queries}/<CasoDeUso>/{<X>Command|Query, <X>Handler, <X>Validator, <X>Response}.cs`, puertos en `Common/Interfaces/<Módulo>/` |
| Infrastructure | `Waggo.Infrastructure/{Services,Options}/<Módulo>/...`, `Persistence/Configurations/<Módulo>/...` |
| Api | `Waggo.Api/Endpoints/<Módulo>/{<Módulo>Endpoints.cs, Requests/, Validators/}` |

Persistencia (si aplica): tablas, schema `<módulo>`, índices, migración.

### Mobile (`waggo-mobile`)
| Parte | Archivos |
|---|---|
| Feature | `src/features/<feature>/{api,hooks,components,screens,model}/...` |
| Ruta | `src/app/...` |

## Plan TDD
Backend (las pruebas replican las carpetas del proyecto que prueban):
1. 🔴 Aceptación: `Tests/Waggo.Api.IntegrationTests/Endpoints/<Módulo>/<X>EndpointTests.cs` (incluye 403 con `X-Dev-Roles` de otro rol).
2. 🔴→🟢 Capa 1: `Tests/Waggo.Api.UnitTests/Endpoints/<Módulo>/Validators/<X>RequestValidatorTests.cs`.
3. 🔴→🟢 Dominio: `Tests/Waggo.Domain.UnitTests/{ValueObjects,Entities,Services}/<Módulo>/...`.
4. 🔴→🟢 Capa 2 y caso de uso: `Tests/Waggo.Application.UnitTests/<Módulo>/{Commands|Queries}/<CasoDeUso>/{<X>ValidatorTests, <X>HandlerTests}.cs`.
5. 🟢 Infraestructura y endpoint.

Mobile:
1. 🔴 Pantalla: `<X>Screen.test.tsx`
2. 🔴→🟢 `model`, `api` (Zod + envolvente `WaggoApiResponse`), `components`.
3. 🟢 Hook y pantalla conectada.

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| ... | ... | ... |

## Preguntas abiertas para el PO
- [ ] ...

## Trazabilidad
Se completa al implementar.

| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | | |
| waggo-mobile | | |
