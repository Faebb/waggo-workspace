---
rf: DEV-001
titulo: Usuarios de prueba predeterminados
estado: En progreso
modulo: Identity
sprint: transversal
prioridad: Alta
repos: [waggo-api]
actualizado: 2026-10-26
---

# DEV-001 — Usuarios de prueba predeterminados

> Vault: `04 Planeación/Estado de implementación.md` (Transversal) · `02 Arquitectura/API - Pipeline, seguridad y errores.md` (Desarrollo sin autenticación) · Decisión: ADR-016 (identidad propia)
> No es un RF del SRS: es soporte de desarrollo y pruebas (prefijo `DEV-XXX`, misma plantilla). Reemplaza el seed de un solo admin (`Seed:Admin`, PR api#18).

## Historia de usuario
Como **desarrollador o tester** quiero **que la base de datos de Development y Testing tenga siempre un administrador, un dueño y un paseador ya verificados, con nombre y contraseña conocidos** para **probar cada rol con el login real (`POST /auth/login`) sin registrarme, confirmar el correo ni aprobar a mano al paseador cada vez que recreo la base**.

## Criterios de aceptación
- [ ] Al arrancar la API en `Development` o `Testing`, después de aplicar las migraciones, existen las tres cuentas de la tabla de abajo, ya confirmadas y con nombre completo y celular.
- [ ] El paseador tiene un `WalkerProfile` **aprobado**, así que su sesión trae el rol `walker` y puede ver y aceptar paseos.
- [ ] Solo el admin tiene `IsAdmin = true`.
- [ ] Es idempotente: si la cuenta (o el perfil de paseador) ya existe, no la duplica ni le cambia la contraseña.
- [ ] En cualquier otro ambiente (`Production`, `Staging`…) **no se crea ninguna cuenta**: el seeder no se ejecuta y `appsettings.json` no trae la sección `Seed`.
- [ ] Una cuenta sin correo o sin contraseña configurados se omite (las demás sí se crean).

## Cuentas
⚠️ Solo Development y Testing. Contraseñas a propósito sencillas; nunca usarlas en otro ambiente.

| Rol | Correo | Contraseña | Nombre completo | Celular | Extra |
|---|---|---|---|---|---|
| `admin` (+ `owner`) | `admin@waggo.local` | `Admin1234` | Administrador Waggo | `3000000001` | `IsAdmin = true` |
| `owner` | `dueno@waggo.local` | `Dueno1234` | Laura Gómez | `3000000002` | — |
| `walker` (+ `owner`) | `paseador@waggo.local` | `Paseador1234` | Carlos Ramírez | `3000000003` | `WalkerProfile` aprobado, CC `1000000003` |

Todo usuario confirmado es `owner` (ADR-016), por eso el admin y el paseador también lo son.

## Tabla de ejemplos
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | Base vacía, ambiente `Testing` | Se crean las 3 cuentas confirmadas, con nombre y celular; el paseador con perfil aprobado | Feliz |
| 2 | `POST /auth/login` con `paseador@waggo.local` / `Paseador1234` y luego `GET /walks/available` con ese token | 200 (rol `walker`) | Feliz |
| 3 | `POST /auth/login` con `dueno@waggo.local` / `Dueno1234` y luego `GET /walks/available` | 403 (sin rol `walker`) | Límite |
| 4 | `POST /auth/login` con `admin@waggo.local` / `Admin1234` y luego `GET /admin/walkers` | 200 | Feliz |
| 5 | Las cuentas ya existen (reinicio) | No se agrega nada | Límite |
| 6 | El paseador existe pero sin perfil | Se crea solo el perfil aprobado | Límite |
| 7 | Una cuenta sin `Password` en la configuración | Se omite esa cuenta; las otras se crean | Límite |
| 8 | Ambiente `Production` | No se ejecuta el seeder; `appsettings.json` no tiene `Seed` | Error (protección) |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Ambientes donde se siembra | `Development`, `Testing` | Usuario (2026-10-26) |
| Dónde viven las credenciales | `Seed:Users:{Admin,Owner,Walker}` en `appsettings.Development.json` (y en la fábrica de pruebas de integración) | Usuario |
| Quién aprueba al paseador sembrado | `ReviewedBy = "seed"` | ⚠️ provisional |

## Contrato de API
Sin endpoints nuevos. Se usa `POST /api/v1/auth/login` (RF-005).

## Diseño
### Backend (`waggo-api`)
| Capa | Archivos nuevos o modificados |
|---|---|
| Domain | Sin cambios: `User.Seed` + `User.UpdateProfile`, `WalkerProfile.Register` + `Approve` |
| Infrastructure | `Options/Identity/{SeedUsersOptions, SeedUserOptions}` (`Seed:Users`, reemplaza `AdminSeedOptions`), `Services/Identity/DevelopmentUsersSeeder` (reemplaza `AdminUserSeeder`) |
| Api | `PipelineExtensions.SeedDevelopmentUsersIfLocalAsync` (solo `Development`/`Testing`), `appsettings.Development.json` |

## Plan TDD
1. 🔴 Aceptación: `Tests/Waggo.Api.IntegrationTests/Endpoints/Identity/SeededUsersTests.cs` (filas 2–4) con `JwtPipelineWaggoApiFactory`.
2. 🔴→🟢 Infraestructura: `DevelopmentUsersSeederTests` (filas 1, 5–7).
3. 🔴→🟢 Protección: `Tests/Waggo.Api.UnitTests/Infrastructure/Settings/ProductionSettingsTests` comprueba que `appsettings.json` no tiene `Seed` (fila 8).

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| RNF-001 | La contraseña se guarda con `IPasswordHasher` (bcrypt), nunca en claro | `DevelopmentUsersSeederTests` |
| RNF-006 | Cuentas conocidas solo fuera de producción | fila 8 |

## Preguntas abiertas para el PO
- [ ] ¿Hace falta un segundo dueño o paseador (p. ej. para probar que uno no ve datos del otro)?

## Trazabilidad
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api (rama `feat/dev-seed-users`, PR api#21) | `Waggo.Infrastructure/Options/Identity/{SeedUsersOptions, SeedUserOptions}.cs`, `Waggo.Infrastructure/Services/Identity/DevelopmentUsersSeeder.cs`, `Waggo.Infrastructure/DependencyInjection.cs`, `Waggo.Api/Infrastructure/Extensions/PipelineExtensions.cs` (`SeedDevelopmentUsersIfLocalAsync`), `Waggo.Api/Program.cs`, `Waggo.Api/appsettings.Development.json` | `Tests/Waggo.Infrastructure.UnitTests/Services/Identity/DevelopmentUsersSeederTests.cs` (filas 1, 5–7), `Tests/Waggo.Api.IntegrationTests/Endpoints/Identity/SeededUsersTests.cs` (filas 2–4), `Tests/Waggo.Api.UnitTests/Infrastructure/Settings/ProductionSettingsTests.cs` (fila 8) |
