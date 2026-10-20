---
rf: RF-001, RF-005
titulo: Registro con confirmación por correo y login con segundo factor
estado: Implementada
modulo: Identity
sprint: 1
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-20
---

# RF-001 + RF-005 — Identidad y login

> Vault: `01 Proyecto/Requerimientos funcionales.md` (RF-001, RF-005), `Requerimientos no funcionales.md` (RNF-001, RNF-002) · Roadmap: sprint 1 · Decisión: [[ADR-016 Identidad propia con bcrypt y JWT emitido por la API|ADR-016]]

## Historia de usuario
Como **dueño o paseador** quiero **crear una cuenta y luego iniciar sesión de forma segura** para **usar la app con mis propios datos, sin que otro pueda hacerlo en mi nombre**.

## Criterios de aceptación
- [x] Cualquiera se registra con correo y contraseña (RF-001); la cuenta queda inactiva hasta confirmar el correo.
- [x] El login pide contraseña y, si es correcta, un segundo factor (código al correo) antes de entregar sesión (RF-005).
- [x] Los intentos fallidos de contraseña y de código quedan registrados (RF-005) y limitados.
- [x] La sesión se mantiene con un access token corto y un refresh token rotativo (RNF-002); ninguno de los dos vive en la base de datos en texto plano.
- [x] El rol `walker` se obtiene solo al ser un paseador aprobado (RF-002/RF-003, ya implementado); el registro de este spec no crea paseadores.

## Tabla de ejemplos
Cada fila es al menos una prueba. Incluye casos felices, límites y errores.

### Registro (`POST /auth/register`)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | `ana@mail.com` / `Clave123!` | 200, cuenta creada sin confirmar, correo de confirmación "enviado" (log en dev) | Feliz |
| 2 | Correo ya registrado | ❌ `Identity.EmailAlreadyRegistered` | Error |
| 3 | Correo con formato inválido (`ana@`) | ❌ `Request.InvalidValue` (capa 1) | Error |
| 4 | Contraseña de 7 caracteres | ❌ `Identity.WeakPassword` | Límite |
| 5 | Contraseña de 8 caracteres sin mayúscula/número | ❌ `Identity.WeakPassword` | Límite |
| 6 | Contraseña exactamente de 8 caracteres válida | 200 | Límite |

### Confirmación (`GET /auth/confirm?token=`)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 7 | Token válido, dentro de 24 h | Cuenta activa, login ya posible | Feliz |
| 8 | Token ya usado | ❌ `Identity.ConfirmationTokenInvalid` | Error |
| 9 | Token expirado (> 24 h) | ❌ `Identity.ConfirmationTokenExpired` | Límite |
| 10 | Token inexistente | ❌ `Identity.ConfirmationTokenInvalid` | Error |

### Login, paso 1 — contraseña (`POST /auth/login`)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 11 | Correo y contraseña correctos, cuenta confirmada | 200, `challengeId`, código "enviado" al correo | Feliz |
| 12 | Contraseña incorrecta | ❌ `Identity.InvalidCredentials` (mismo mensaje que correo inexistente) | Error |
| 13 | Correo inexistente | ❌ `Identity.InvalidCredentials` | Error |
| 14 | Cuenta sin confirmar | ❌ `Identity.AccountNotConfirmed` | Error |
| 15 | 6º intento fallido seguido en 15 min | ❌ `Identity.TooManyAttempts` | Límite |

### Login, paso 2 — segundo factor (`POST /auth/login/verify`)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 16 | `challengeId` + código correcto, dentro de 10 min | 200, `accessToken` + `refreshToken` | Feliz |
| 17 | Código incorrecto | ❌ `Identity.InvalidCode` (intento contado) | Error |
| 18 | Código correcto pero expirado | ❌ `Identity.CodeExpired` | Límite |
| 19 | 6º intento de código fallido | ❌ `Identity.TooManyAttempts`, challenge invalidado | Límite |
| 20 | `challengeId` inexistente o ya usado | ❌ `Identity.ChallengeNotFound` | Error |

### Refresco de sesión (`POST /auth/refresh`)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 21 | Refresh token válido y vigente | 200, nuevo `accessToken` + nuevo `refreshToken`; el anterior queda revocado | Feliz |
| 22 | Refresh token ya usado (reutilizado tras rotar) | ❌ `Identity.RefreshTokenInvalid`, se revocan todos los tokens de ese usuario | Error |
| 23 | Refresh token expirado | ❌ `Identity.RefreshTokenInvalid` | Límite |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Longitud mínima de contraseña | 8 caracteres | ⚠️ provisional |
| Complejidad de contraseña | Al menos 1 mayúscula y 1 número | ⚠️ provisional |
| Expiración del token de confirmación | 24 horas | ⚠️ provisional |
| Expiración del código de 2FA | 10 minutos | ⚠️ provisional |
| Intentos máximos (contraseña y código) | 5 fallidos antes de bloquear 15 min | ⚠️ provisional |
| Duración del access token | 15 minutos | RNF-002 |
| Duración del refresh token | 30 días, rotativo de un solo uso | RNF-002 |
| Mensaje de credenciales inválidas | Igual para correo inexistente y contraseña incorrecta (no revelar cuál) | OWASP / buena práctica |

## Contrato de API
Todos los endpoints de este spec son `AllowAnonymous` (primeros de la API sin autenticación previa).

### `POST /api/v1/auth/register`
Request (`Waggo.Api/Endpoints/Identity/Requests/RegisterRequest.cs`):
```json
{ "email": "ana@mail.com", "password": "Clave123!" }
```
Response `200` (como el resto de la API, `WaggoResponse`/`ToApiResult` no distingue 201 de 200):
```json
{ "success": true, "data": { "id": "...", "email": "ana@mail.com" }, "pagination": null, "errors": [], "warnings": [], "infos": [], "traceId": "..." }
```

### `GET /api/v1/auth/confirm?token=`
Response `200`: `{ "success": true, "data": null, ... }`

### `POST /api/v1/auth/login`
Request: `{ "email": "ana@mail.com", "password": "Clave123!" }`
Response `200`: `{ "success": true, "data": { "challengeId": "..." }, ... }`

### `POST /api/v1/auth/login/verify`
Request: `{ "challengeId": "...", "code": "482913" }`
Response `200`: `{ "success": true, "data": { "accessToken": "...", "refreshToken": "...", "expiresInSeconds": 900 }, ... }`

### `POST /api/v1/auth/refresh`
Request: `{ "refreshToken": "..." }`
Response `200`: misma forma que `login/verify`.

### Validación capa 1 — DTO
| Campo | Regla | `code` | Mensaje |
|---|---|---|---|
| `email` | Obligatorio, formato de correo | `Request.InvalidValue` | Escribe un correo válido. |
| `password` | Obligatorio | `Request.Required` | Escribe tu contraseña. |
| `token` / `challengeId` / `code` / `refreshToken` | Obligatorios | `Request.Required` | — |

### Validación capa 2 — negocio
| Regla | `code` | HTTP | Mensaje |
|---|---|---|---|
| Correo ya registrado | `Identity.EmailAlreadyRegistered` | 400 | Ese correo ya tiene una cuenta. ¿Olvidaste tu contraseña? |
| Contraseña débil | `Identity.WeakPassword` | 400 | La contraseña debe tener al menos 8 caracteres, una mayúscula y un número. |
| Credenciales inválidas | `Identity.InvalidCredentials` | 400 | Correo o contraseña incorrectos. |
| Cuenta sin confirmar | `Identity.AccountNotConfirmed` | 400 | Confirma tu correo antes de iniciar sesión. |
| Código de 2FA inválido | `Identity.InvalidCode` | 400 | El código no es correcto. |
| Código de 2FA expirado | `Identity.CodeExpired` | 400 | El código expiró, pide uno nuevo. |
| Demasiados intentos | `Identity.TooManyAttempts` | 422 (`ErrorType.BusinessRule`, no 429: eso es solo para el *rate limiter* de infraestructura) | Demasiados intentos, espera 15 minutos. |
| Challenge no encontrado | `Identity.ChallengeNotFound` | 400 | Vuelve a iniciar sesión. |
| Refresh token inválido | `Identity.RefreshTokenInvalid` | 401 (`ErrorType.Unauthorized`) | Tu sesión expiró, inicia sesión de nuevo. |

### Excepciones
| Situación | Excepción | `code` | HTTP |
|---|---|---|---|
| Token de confirmación no existe | `NotFoundException` | `Identity.ConfirmationTokenInvalid` | 404 |
| Token de confirmación expirado | `ConflictException` | `Identity.ConfirmationTokenExpired` | 409 |

## Diseño

### Backend (`waggo-api`)
| Capa | Archivos nuevos |
|---|---|
| Domain | `Entities/Identity/User.cs` (`Register`, `Confirm`, `VerifyPassword` vía puerto, `IsAdmin`), `Entities/Identity/RefreshToken.cs`, `Entities/Identity/LoginChallenge.cs`; `Errors/Identity/IdentityErrors.cs` |
| Application | `Identity/Commands/{Register,ConfirmEmail,Login,VerifyLoginCode,RefreshSession}/...`; puertos `Common/Interfaces/Identity/{IUserRepository,IRefreshTokenRepository,ILoginChallengeRepository,IPasswordHasher,ITokenService,IEmailSender}.cs` |
| Infrastructure | `Services/Identity/{BCryptPasswordHasher,JwtTokenService,DevelopmentEmailSender,UserRepository,RefreshTokenRepository,LoginChallengeRepository}.cs`; `Options/Identity/JwtOptions.cs`; `Persistence/Configurations/Identity/{UserConfiguration,RefreshTokenConfiguration,LoginChallengeConfiguration}.cs`; migración `AddIdentity` |
| Api | `Endpoints/Identity/{IdentityEndpoints.cs, Requests/*}.cs`; `ServiceCollectionExtensions.AddWaggoAuthentication` cambia de `Authority` a `IssuerSigningKey` propia |

Persistencia (schema `identity`, junto a `identity.walker_profiles`):
- `identity.users` (Id uuid pk, Email citext unique, PasswordHash, EmailConfirmed bool, IsAdmin bool, ConfirmationTokenHash, ConfirmationTokenExpiresAt, CreatedAt)
- `identity.login_challenges` (Id uuid pk, UserId fk, CodeHash, ExpiresAt, Attempts, CreatedAt)
- `identity.refresh_tokens` (Id uuid pk, UserId fk, TokenHash unique, ExpiresAt, RevokedAt nullable, ReplacedByTokenId nullable)

### Mobile (`waggo-mobile`) — slice separado
Spec cubre el contrato; la implementación mobile (pantallas de registro/login/código, almacenamiento seguro del token con `expo-secure-store`, reemplazo de `devIdentity`) se hace en un PR siguiente una vez el backend esté verde, para no mezclar dos TDD largos en un solo PR.

## Plan TDD
Backend, en dos slices (dos PR):
1. **Slice A — Registro y confirmación (RF-001)**:
   1. 🔴 `Tests/Waggo.Domain.UnitTests/Entities/Identity/UserTests.cs` (`Register`, `Confirm`, expiración de token).
   2. 🔴→🟢 `Tests/Waggo.Application.UnitTests/Identity/Commands/{Register,ConfirmEmail}/*HandlerTests.cs` con `IUserRepository`/`IPasswordHasher`/`IEmailSender` dobles (NSubstitute).
   3. 🟢 `BCryptPasswordHasher`, `DevelopmentEmailSender`, `UserRepository`, `UserConfiguration`, migración.
   4. 🟢 `IdentityEndpoints` (`register`, `confirm`) + `Tests/Waggo.Api.IntegrationTests/Endpoints/Identity/RegisterEndpointTests.cs`.
2. **Slice B — Login, 2FA, refresh (RF-005)**:
   1. 🔴 `LoginChallenge` y `RefreshToken` en Domain.
   2. 🔴→🟢 `Login`, `VerifyLoginCode`, `RefreshSession` handlers.
   3. 🟢 `JwtTokenService`, repositorios restantes, migración.
   4. 🟢 Endpoints + `AddWaggoAuthentication` con `IssuerSigningKey` propia; pruebas de integración que generan un token real y llaman un endpoint protegido existente (p. ej. `GET /pets`) para probar el pipeline completo.

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| RNF-001 | `IPasswordHasher` + `BCryptPasswordHasher`; el hash nunca es igual al texto plano | `BCryptPasswordHasherTests` |
| RNF-002 | Access token de 15 min, refresh rotativo de un solo uso guardado hasheado | `RefreshSessionHandlerTests` (reutilizar un refresh token ya rotado falla) |

## Preguntas abiertas para el PO
- [x] ¿Arquitectura de identidad? → Propia (JWT + bcrypt), ver ADR-016.
- [x] ¿Segundo factor? → Código por correo.
- [x] ¿Confirmación de cuenta? → Enlace al correo.
- [ ] ¿Recuperación de contraseña ("olvidé mi contraseña")? No está en el alcance de este spec; se deja como spec/slice siguiente una vez RF-001/RF-005 estén implementados.
- [ ] Proveedor real de correo para producción (hoy: `DevelopmentEmailSender` solo registra en el log).

## Trazabilidad

### Slice A — Registro y confirmación (RF-001) ✅
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | `Waggo.Domain/{Entities,Errors}/Identity/`, `Waggo.Application/{Identity,Common/Interfaces/Identity}/`, `Waggo.Infrastructure/{Services,Persistence/Configurations}/Identity/`, `Waggo.Api/Endpoints/Identity/`, migración `AddUsers` | `Tests/Waggo.Domain.UnitTests/Entities/Identity/UserTests`, `Waggo.Application.UnitTests/Identity/Commands/{Register,ConfirmEmail}/*HandlerTests`, `Waggo.Infrastructure.UnitTests/Services/Identity/BCryptPasswordHasherTests`, `Waggo.Api.UnitTests/Endpoints/Identity/Validators/RegisterRequestValidatorTests`, `Waggo.Api.IntegrationTests/Endpoints/Identity/IdentityEndpointTests` |

### Slice B — Login, 2FA, refresh (RF-005) ✅
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | `Waggo.Domain/Entities/Identity/{LoginChallenge,RefreshToken}.cs` + lockout en `User.cs`; `Waggo.Application/Identity/Commands/{Login,VerifyLoginCode,RefreshSession}/`; `Waggo.Infrastructure/Services/Identity/{JwtTokenService,LoginChallengeRepository,RefreshTokenRepository}.cs`, `Options/Identity/JwtOptions.cs`; `Waggo.Api/Endpoints/Identity/` (login, login/verify, refresh) + `AddWaggoAuthentication` reescrito a `IssuerSigningKey`; migración `AddLoginAndRefreshTokens` | `Waggo.Domain.UnitTests/Entities/Identity/{LoginChallengeTests,RefreshTokenTests}`, handlers de `Waggo.Application.UnitTests/Identity/Commands/*`, `Waggo.Infrastructure.UnitTests/Services/Identity/{JwtTokenServiceTests,SecureTokenGeneratorTests}`, validators de `Waggo.Api.UnitTests`, `Waggo.Api.IntegrationTests/Endpoints/Identity/{LoginEndpointTests,JwtPipelineTests}` (esta última con un segundo `WebApplicationFactory` sin usuario de desarrollo, para probar el pipeline JWT real de punta a punta) |

### Mobile — pendiente (pantallas, almacenamiento seguro del token, reemplazo de `devIdentity`)
