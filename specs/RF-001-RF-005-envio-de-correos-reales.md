---
rf: RF-001, RF-005
titulo: Correos reales (Amazon SES) y confirmación con código de 6 dígitos
estado: En progreso
modulo: Identity
sprint: 1
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-26
---

# RF-001 + RF-005 — Correos reales (Amazon SES) y código de 6 dígitos

> Vault: `03 Desarrollo/Guía AWS SES - prompt de configuración.md` (cómo configurar AWS) · Decisión: ADR-016 (identidad propia), ADR-017
> Extiende: `RF-001-RF-005-identidad-y-login.md`. El puerto `IEmailSender` ya existe (ADR-016); hoy solo tiene `DevelopmentEmailSender`, que escribe el correo en el log.
> **Cambia el contrato de la API** (`/auth/confirm` pasa de `GET ?token=` a `POST {email, code}` y aparece `/auth/resend-confirmation`): PRs de `waggo-api` y `waggo-mobile` enlazados.

## Historia de usuario
Como **persona que se registra con correo y contraseña** quiero **recibir en mi bandeja un código de 6 dígitos y escribirlo en la app** para **activar mi cuenta e iniciar sesión**, y **pedir otro código si no llegó o venció**.

## Decisiones del PO (2026-10-26)
| Tema | Decisión |
|---|---|
| Proveedor de correo | Amazon SES, región `us-east-1` |
| Dominio | Aún no existe: se registra en Route 53. Mientras tanto, pruebas en el sandbox de SES con un correo verificado |
| Remitente | `no-reply@<dominio>`, nombre visible "Waggo" |
| Contenido del correo | Código numérico de **6 dígitos** que se escribe en la app (sin enlace clicable) |

## Criterios de aceptación
- [ ] Con `Email:Provider = Ses`, registrarse manda por SES un correo con el código de 6 dígitos; con `Development` (por defecto en Development y Testing) el correo se escribe en el log, como hoy.
- [ ] Las credenciales de AWS nunca están en el repositorio ni en `appsettings*.json`: salen de la cadena estándar del SDK (perfil de AWS CLI, variables de entorno o rol IAM).
- [ ] En `Production` la API **se niega a arrancar** si `Email:Provider` no es `Ses` o si faltan el remitente o la región.
- [ ] Si SES rechaza o no responde, el registro responde con un error claro en español, sin filtrar el código ni detalles de AWS; el motivo técnico queda en el log.
- [ ] El código tiene 6 dígitos (se admiten ceros a la izquierda), vence en 30 minutos y se invalida tras 5 intentos fallidos.
- [ ] `POST /auth/confirm` con correo y código correctos activa la cuenta.
- [ ] `POST /auth/resend-confirmation` manda un código nuevo (el anterior deja de servir) y responde igual exista o no la cuenta.
- [ ] El flujo completo funciona en la app con un buzón real: registro → llega el correo → se escribe el código → confirmar → login.

## Tabla de ejemplos
### Envío (slice 1)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | `Provider = Ses`, registro con correo válido | SES recibe `SendEmail` con remitente, destinatario, asunto y cuerpo; el registro responde 200 | Feliz |
| 2 | `Provider = Development` (o sin configurar en Development/Testing) | El correo se escribe en el log; no se llama a AWS | Feliz |
| 3 | `Provider = Ses` sin `FromAddress` o sin `Region` | La API no arranca, con un mensaje que dice qué falta | Error |
| 4 | Ambiente `Production` con `Provider = Development` | La API no arranca | Error (protección) |
| 5 | SES devuelve un rechazo (p. ej. remitente o destinatario no verificado en sandbox) | ❌ `Email.SendFailed` (503), mensaje al usuario en español; detalle de AWS solo en el log | Error |
| 6 | SES no responde en 10 s | ❌ `Email.SendFailed` (503); el registro no se cuelga | Límite |
| 7 | Asunto y cuerpo del correo | Asunto "Tu código de confirmación de Waggo"; el cuerpo trae el código y dice que vence en 30 minutos; texto plano | Feliz |

### Código de 6 dígitos y confirmación (slice 2)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 8 | Registro | Se genera un código de 6 dígitos (`000000`–`999999`, con ceros a la izquierda); en la base solo se guarda su hash; vence a los 30 min | Feliz |
| 9 | `POST /auth/confirm` con el código correcto antes de los 30 min | 200 `true`; la cuenta queda confirmada y el código se borra | Feliz |
| 10 | Código incorrecto | ❌ `Identity.ConfirmationTokenInvalid` (404); suma un intento | Error |
| 11 | 5 códigos incorrectos seguidos y luego el correcto | ❌ `Identity.ConfirmationAttemptsExceeded` (422); hay que pedir un código nuevo | Límite |
| 12 | Código correcto después de 30 min | ❌ `Identity.ConfirmationTokenExpired` (409) | Límite |
| 13 | Correo sin cuenta | ❌ `Identity.ConfirmationTokenInvalid` (404), igual que un código incorrecto | Error |
| 14 | Cuenta ya confirmada | ❌ `Identity.ConfirmationTokenInvalid` (404) | Límite |
| 15 | `code` que no tiene 6 dígitos, o `email` vacío | ❌ `Request.InvalidValue` / `Request.Required` (400, capa 1) | Error |
| 16 | `POST /auth/resend-confirmation` de una cuenta sin confirmar | 200 `true`; código nuevo, el anterior ya no sirve, intentos en 0, vence a los 30 min; se manda el correo | Feliz |
| 17 | Reenviar antes de 60 s del último envío | 200 `true`; no se manda nada | Límite |
| 18 | Reenviar para un correo sin cuenta o ya confirmado | 200 `true`, idéntico al caso 16; no se manda nada | Límite |
| 19 | Reenviar con un correo mal formado | ❌ `Request.InvalidValue` (400, capa 1) | Error |
| 20 | Login con la cuenta sin confirmar | ❌ `Identity.AccountNotConfirmed` (422), sin cambios | Límite |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Proveedor de correo | Amazon SES (API `SendEmail` de SES v2) detrás de `IEmailSender` | PO |
| Credenciales | Cadena estándar del SDK de AWS; en servidor, rol IAM | PO |
| Código | 6 dígitos numéricos, generado con `RandomNumberGenerator` | PO |
| Vigencia del código | 30 minutos | ⚠️ provisional |
| Intentos fallidos por código | 5 | ⚠️ provisional |
| Espera mínima entre reenvíos | 60 segundos | ⚠️ provisional |
| Tiempo máximo de envío a SES | 10 s | ⚠️ provisional |
| Formato del correo | Texto plano | ⚠️ provisional |
| Seguridad del código | Un código de 6 dígitos tiene solo un millón de combinaciones: la defensa es el límite de intentos y la vigencia corta, no el hash. Quien lea la base podría adivinarlo, pero solo logra confirmar esa cuenta | Decisión de diseño |

## Contrato de API
Ambos `AllowAnonymous`. **Cambio incompatible:** `GET /api/v1/auth/confirm?token=…` se elimina.

### `POST /api/v1/auth/confirm`
Request (`Waggo.Api/Endpoints/Identity/Requests/ConfirmRequest.cs`):
```json
{ "email": "ana@mail.com", "code": "004821" }
```
Response `200`:
```json
{ "success": true, "data": true, "pagination": null, "errors": [], "warnings": [], "infos": [], "traceId": "..." }
```

### `POST /api/v1/auth/resend-confirmation`
Request (`Waggo.Api/Endpoints/Identity/Requests/ResendConfirmationRequest.cs`):
```json
{ "email": "ana@mail.com" }
```
Response `200`: igual forma, `data: true`, exista o no la cuenta.

### Validación capa 1 — DTO (`Waggo.Api/Endpoints/Identity/Validators/`)
| Campo | Regla | `code` | Mensaje (español) |
|---|---|---|---|
| `email` (ambos) | Obligatorio | `Request.Required` | Escribe tu correo. |
| `email` (reenvío) | Formato de correo | `Request.InvalidValue` | Escribe un correo válido. |
| `code` | Obligatorio | `Request.Required` | Escribe el código que te enviamos. |
| `code` | Exactamente 6 dígitos | `Request.InvalidValue` | El código tiene 6 números. |

### Validación capa 2 y errores de negocio (`IdentityErrors`)
| Regla | `code` | HTTP | Mensaje |
|---|---|---|---|
| Código incorrecto, sin cuenta o cuenta ya confirmada | `Identity.ConfirmationTokenInvalid` | 404 | El código no es válido. |
| Código vencido | `Identity.ConfirmationTokenExpired` | 409 | El código venció, pide uno nuevo. |
| 5 intentos fallidos | `Identity.ConfirmationAttemptsExceeded` (nuevo) | 422 | Demasiados intentos, pide un código nuevo. |

### Excepciones
| Situación | Excepción | `code` | HTTP |
|---|---|---|---|
| SES rechaza o no responde | `ExternalServiceException` | `Email.SendFailed` (nuevo, `EmailErrors`) | 503 — "No pudimos enviar el correo. Intenta de nuevo en unos minutos." |

Transversales: 401 `Auth.Unauthorized`, 429 `Http.TooManyRequests`, 500 genérico con `traceId`.

## Diseño
### Backend (`waggo-api`)
| Capa | Archivos nuevos o modificados |
|---|---|
| Domain | `User`: `ConfirmationAttempts`, `Confirm(codeHash, now)` (cuenta intentos, vence a los 30 min), `RequestNewConfirmationCode(codeHash, now)` (espera de 60 s), constantes; `IdentityErrors.ConfirmationAttemptsExceeded`; `Errors/Identity/EmailErrors.SendFailed`. Los nombres internos "Token" se conservan (renombrarlos es deuda menor) |
| Application | `ITokenGenerator.GenerateNumericCode()`; `ConfirmEmailCommand(Email, Code)` y `ConfirmEmailHandler` (busca por correo, guarda también tras un intento fallido); nuevo `Identity/Commands/ResendConfirmation/` (`Command`, `Handler`); `RegisterHandler` genera el código y arma el correo; se elimina `IUserRepository.GetByConfirmationTokenHashAsync` |
| Infrastructure | `SecureTokenGenerator.GenerateNumericCode`; `UserConfiguration` + migración `AddConfirmationAttempts` (`identity.users.confirmation_attempts`); `Options/Identity/EmailOptions` (`Email:Provider`, `FromAddress`, `FromName`, `Ses:Region`, `Ses:ConfigurationSet` opcional); `Services/Identity/SesEmailSender` (`IAmazonSimpleEmailServiceV2`, tiempo máximo 10 s); selección en `DependencyInjection`; paquete `AWSSDK.SimpleEmailV2` en `Directory.Packages.props` |
| Api | `IdentityEndpoints` (`POST /confirm`, `POST /resend-confirmation`), `Requests/{ConfirmRequest, ResendConfirmationRequest}`, `Validators/…`; guarda de arranque en producción; `appsettings.Development.json` con `Email:Provider = Development` |

### Mobile (`waggo-mobile`)
| Parte | Archivos |
|---|---|
| API | `src/features/auth/api/authApi.ts`: `confirmEmail(email, code)` por POST y `resendConfirmation(email)` |
| Hooks | `useConfirmEmail`, nuevo `useResendConfirmation` |
| Pantalla | `ConfirmScreen`: campo de 6 dígitos (teclado numérico, `autoComplete="one-time-code"`), botón "Reenviar código" con cuenta regresiva de 60 s, mensajes de la API; el texto deja de decir "enlace" |

## Plan TDD
Slice 1 — envío (API):
1. 🔴 Aceptación: con un `IEmailSender` que falla, el registro responde 503 `Email.SendFailed` (fila 5).
2. 🔴→🟢 `Tests/Waggo.Infrastructure.UnitTests/Services/Identity/SesEmailSenderTests.cs` con `IAmazonSimpleEmailServiceV2` sustituido (filas 1, 5, 6, 7).
3. 🔴→🟢 Selección de proveedor y guarda de producción (filas 2–4) en `Tests/Waggo.Api.UnitTests/Infrastructure/`.
4. 🟢 Prueba manual con SES real en sandbox (no entra al CI).

Slice 2 — código y reenvío (API, luego mobile):
1. 🔴 Aceptación `IdentityEndpointTests`: registro → código del correo → `POST /auth/confirm` → login (filas 8, 9, 20), intentos (10, 11), reenvío (16).
2. 🔴→🟢 Dominio: `UserTests` (`Confirm` con intentos y vencimiento, `RequestNewConfirmationCode` con espera).
3. 🔴→🟢 Capa 1: `ConfirmRequestValidatorTests`, `ResendConfirmationRequestValidatorTests` (filas 15, 19).
4. 🔴→🟢 Aplicación: `ConfirmEmailHandlerTests`, `ResendConfirmationHandlerTests`, `RegisterHandlerTests` (filas 8–18).
5. Mobile: `ConfirmScreen.test.tsx`, `authApi` y hooks.

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| RNF-006 (seguridad) | Sin secretos en el repo; permiso IAM mínimo; límite de intentos y vigencia corta del código; el reenvío no revela si el correo existe | filas 5, 11, 18 |
| RNF-007 (disponibilidad) | Tiempo máximo de envío; el fallo de SES no deja colgada la API | fila 6 |

## Preguntas abiertas para el PO
- [x] ¿Dominio? Se registrará en Route 53; mientras tanto, sandbox.
- [x] ¿Remitente y nombre? `no-reply@<dominio>`, "Waggo".
- [x] ¿Región? `us-east-1`.
- [x] ¿Código o enlace? Código de 6 dígitos.
- [ ] Vigencia (30 min), intentos (5) y espera entre reenvíos (60 s) son provisionales.
- [ ] Recuperación de contraseña por correo reutilizará `IEmailSender` y un código igual; queda para su propia spec.

## Trazabilidad
Implementado en PRs abiertos, aún sin mergear: waggo-api#22 (envío con SES), waggo-api#23 (código de 6 dígitos y reenvío, apilado sobre #22) y waggo-mobile#22. Falta la prueba manual con SES real en sandbox (fila 1) y el correo desde un dominio propio.

| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api (#22) | `Waggo.Infrastructure/Options/Identity/{EmailOptions, EmailProvider, SesOptions, EmailOptionsValidator}.cs`, `Services/Identity/SesEmailSender.cs`, `DependencyInjection.cs`, `Waggo.Api/Infrastructure/Extensions/EmailStartupGuard.cs`, `Waggo.Domain/Errors/Identity/EmailErrors.cs`, `RegisterHandler` (envía antes de guardar) | `SesEmailSenderTests`, `EmailOptionsValidatorTests`, `EmailStartupGuardTests`, `RegisterHandlerTests`, `IdentityEndpointTests` (filas 1–7, salvo la prueba manual con SES real) |
| waggo-api (#23) | `User` (`ConfirmationAttempts`, `Confirm`, `TryIssueConfirmationCode`), `IdentityErrors.ConfirmationAttemptsExceeded`, `ITokenGenerator.GenerateNumericCode`, `ConfirmEmail*` y `ResendConfirmation/*`, `ConfirmationEmail`, `ConfirmRequest`, `ResendConfirmationRequest` + validadores, `IdentityEndpoints`, migración `AddConfirmationAttempts` | `UserTests`, `ConfirmEmailHandlerTests`, `ResendConfirmationHandlerTests`, `RegisterHandlerTests`, `SecureTokenGeneratorTests`, `ConfirmRequestValidatorTests`, `ResendConfirmationRequestValidatorTests`, `IdentityEndpointTests` (filas 8–20) |
| waggo-mobile (#22) | `src/features/auth/{api/authApi.ts, hooks/useAuth.ts, screens/ConfirmScreen.tsx}` | `authApi.test.ts`, `ConfirmScreen.test.tsx` |
