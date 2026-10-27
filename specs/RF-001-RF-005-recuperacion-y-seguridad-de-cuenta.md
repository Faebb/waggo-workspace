---
rf: RF-001, RF-005
titulo: Recuperación y seguridad de la cuenta (olvidé mi contraseña, cambiar contraseña y correo, cerrar sesión)
estado: Borrador
modulo: Identity
sprint: 1
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-26
---

# RF-001 + RF-005 — Recuperación y seguridad de la cuenta

> Vault: [[Estado de implementación]] · Decisión: [[ADR-016 Identidad propia con bcrypt y JWT emitido por la API|ADR-016]]
> Extiende: `RF-001-RF-005-envio-de-correos-reales.md` (reutiliza `IEmailSender`, el código de 6 dígitos y sus reglas) y `RF-001-RF-005-identidad-y-login.md`.
> Reemplaza lo que `RF-001-RF-005-perfil-de-usuario.md` anota como pendiente de contraseña, correo y cerrar sesión. Eliminar cuenta y proveedores vinculados **no** entran aquí.
> **Agrega rutas a la API** (no rompe las existentes): PRs de `waggo-api` y `waggo-mobile` enlazados, un par por slice.

## Historia de usuario
Como **persona con una cuenta de Waggo** quiero **recuperar mi contraseña si la olvido, cambiarla o cambiar mi correo cuando quiera y cerrar mi sesión de verdad** para **no perder el acceso a mi cuenta y mantenerla segura**.

## Slices (un PR por slice, en este orden)
| Slice | Qué entrega | Rutas nuevas |
|---|---|---|
| A. Olvidé mi contraseña | Pedir un código por correo y fijar una contraseña nueva | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| B. Cerrar sesión | Revocar el refresh token en el servidor | `POST /auth/logout` |
| C. Cambiar contraseña | Con la sesión abierta, pidiendo la actual | `PUT /users/me/password` |
| D. Cambiar correo | Código al correo nuevo antes de aplicarlo | `POST /users/me/email`, `POST /users/me/email/confirm` |
| E. Cuenta sin confirmar | Si el login falla por cuenta sin confirmar, la app lleva a la pantalla del código | Solo mobile |

## Criterios de aceptación
- [ ] Desde el login hay un enlace "¿Olvidaste tu contraseña?" que lleva a pedir un código por correo y luego a escribir el código y la contraseña nueva.
- [ ] `forgot-password` responde igual exista o no la cuenta (no revela qué correos están registrados).
- [ ] El código de recuperación tiene 6 dígitos, vence en 15 minutos, se invalida tras 5 intentos fallidos y se puede reenviar cada 60 s.
- [ ] Al restablecer la contraseña se revocan **todas** las sesiones (refresh tokens) de la cuenta y la persona debe iniciar sesión de nuevo.
- [ ] Cada cambio de contraseña (recuperación o cambio voluntario) manda un aviso al correo de la cuenta.
- [ ] Cerrar sesión desde Configuración revoca el refresh token en la API y limpia la sesión local, aunque la llamada falle por falta de red.
- [ ] Cambiar contraseña exige la actual y deja abierta solo la sesión actual.
- [ ] Cambiar correo exige la contraseña y un código enviado al **correo nuevo**; el cambio se aplica solo al confirmar el código y se avisa al correo anterior.
- [ ] Un login con cuenta sin confirmar lleva a la pantalla del código con el correo ya puesto y permite reenviar.

## Tabla de ejemplos
### Slice A — Olvidé mi contraseña
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | `forgot-password` de una cuenta confirmada | 200 `true`; código de 6 dígitos nuevo (solo su hash en la base), vence en 15 min, intentos en 0; se manda el correo | Feliz |
| 2 | `forgot-password` de un correo sin cuenta | 200 `true`, idéntico al 1; no se manda nada | Límite |
| 3 | `forgot-password` de una cuenta sin confirmar | 200 `true`; no se manda el código de recuperación (se debe confirmar primero); no se manda nada | Límite |
| 4 | `forgot-password` antes de 60 s del último envío | 200 `true`; no se manda nada | Límite |
| 5 | `forgot-password` con correo mal formado o vacío | ❌ `Request.InvalidValue` / `Request.Required` (400, capa 1) | Error |
| 6 | `reset-password` con el código correcto y una contraseña válida | 200 `true`; contraseña cambiada, código borrado, todos los refresh tokens revocados, aviso por correo | Feliz |
| 7 | Tras el 6, login con la contraseña anterior | ❌ `Identity.InvalidCredentials` (401) | Error |
| 8 | Tras el 6, login con la contraseña nueva | 200 con tokens | Feliz |
| 9 | Tras el 6, `refresh` con un refresh token anterior | ❌ 401 (sesión revocada) | Error |
| 10 | `reset-password` con código incorrecto | ❌ `Identity.ResetCodeInvalid` (404); suma un intento | Error |
| 11 | 5 códigos incorrectos y luego el correcto | ❌ `Identity.ResetAttemptsExceeded` (422); hay que pedir un código nuevo | Límite |
| 12 | Código correcto después de 15 min | ❌ `Identity.ResetCodeExpired` (409) | Límite |
| 13 | `reset-password` de un correo sin cuenta | ❌ `Identity.ResetCodeInvalid` (404), igual que un código incorrecto | Error |
| 14 | Contraseña nueva débil (menos de 8 caracteres o sin letra y número) | ❌ `Identity.WeakPassword` (400, capa 2) | Error |
| 15 | `code` sin 6 dígitos o campos vacíos | ❌ `Request.InvalidValue` / `Request.Required` (400, capa 1) | Error |
| 16 | Segundo `forgot-password` válido | El código anterior deja de servir | Límite |
| 17 | Se restablece la contraseña de una cuenta con correo ya confirmado | Sigue confirmada | Límite |

### Slice B — Cerrar sesión
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 18 | `logout` con un refresh token activo | 200 `true`; el token queda revocado y `refresh` con él da 401 | Feliz |
| 19 | `logout` con un refresh token desconocido, vencido o ya revocado | 200 `true` (idempotente) | Límite |
| 20 | `logout` sin `refreshToken` | ❌ `Request.Required` (400, capa 1) | Error |
| 21 | `logout` de un token de otra cuenta | 200 `true` pero el token ajeno **no** se revoca | Límite |
| 22 | Mobile: cerrar sesión sin red | La sesión local se borra igual | Límite |

### Slice C — Cambiar contraseña
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 23 | Contraseña actual correcta y nueva válida | 200 `true`; se revocan los demás refresh tokens, se conserva el de la sesión actual; aviso por correo | Feliz |
| 24 | Contraseña actual incorrecta | ❌ `Identity.CurrentPasswordIncorrect` (422) | Error |
| 25 | Contraseña nueva igual a la actual | ❌ `Identity.PasswordUnchanged` (422) | Límite |
| 26 | Contraseña nueva débil | ❌ `Identity.WeakPassword` (400, capa 2) | Error |
| 27 | Sin sesión | ❌ 401 `Auth.Unauthorized` | Error |
| 28 | Campos vacíos | ❌ `Request.Required` (400, capa 1) | Error |

### Slice D — Cambiar correo
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 29 | `POST /users/me/email` con correo nuevo libre y contraseña correcta | 200 `true`; se manda un código de 6 dígitos **al correo nuevo**; el correo de la cuenta sigue igual hasta confirmar | Feliz |
| 30 | `POST /users/me/email/confirm` con el código correcto | 200 `true`; el correo cambia, los demás refresh tokens se revocan, aviso al correo anterior | Feliz |
| 31 | Correo nuevo ya usado por otra cuenta | ❌ `Identity.EmailAlreadyRegistered` (422) | Error |
| 32 | Correo nuevo igual al actual | ❌ `Identity.EmailUnchanged` (422) | Límite |
| 33 | Contraseña incorrecta | ❌ `Identity.CurrentPasswordIncorrect` (422) | Error |
| 34 | Código incorrecto / vencido (15 min) / 5 intentos | ❌ `Identity.EmailChangeCodeInvalid` (404) / `…Expired` (409) / `…AttemptsExceeded` (422) | Error |
| 35 | Pedir otro cambio antes de confirmar el primero | El código y el correo pendientes anteriores se descartan | Límite |
| 36 | Entre el 29 y el 30 otra cuenta registra ese correo | ❌ `Identity.EmailAlreadyRegistered` (422) al confirmar | Límite |
| 37 | Correo nuevo mal formado o vacío | ❌ `Request.InvalidValue` / `Request.Required` (400, capa 1) | Error |

### Slice E — Cuenta sin confirmar (mobile)
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 38 | Login con `Identity.AccountNotConfirmed` | La app va a la pantalla del código con el correo escrito y manda un código nuevo | Feliz |
| 39 | Mobile: enlace "¿Olvidaste tu contraseña?" en el login | Abre la pantalla para pedir el código con el correo del login ya escrito | Feliz |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Código de recuperación y de cambio de correo | 6 dígitos, mismo generador que la confirmación | PO (ver `envio-de-correos-reales`) |
| Vigencia del código de recuperación y de cambio de correo | 15 minutos | ⚠️ provisional |
| Intentos fallidos por código | 5 | ⚠️ provisional (igual que la confirmación) |
| Espera mínima entre envíos | 60 segundos | ⚠️ provisional |
| Fortaleza de la contraseña | La que ya exige el registro (mínimo 8 caracteres); se reutiliza la misma regla | Existente |
| Qué se revoca al restablecer o cambiar el correo | Todos los refresh tokens; al cambiar la contraseña con sesión, todos menos el de la sesión actual | ⚠️ provisional |
| Avisos de seguridad | Correo al cambiar contraseña y al cambiar el correo (al anterior); texto plano | ⚠️ provisional |
| Anti enumeración | `forgot-password` responde siempre 200 igual; `reset-password` no distingue "sin cuenta" de "código incorrecto" | Decisión de diseño |
| Qué prueba el código | Quien recibe el código controla ese buzón; restablecer la contraseña no cambia el estado de confirmación del correo | Decisión de diseño |
| Límite de intentos | El mismo que la confirmación; el límite por IP de `/auth/*` queda para su propio slice | Decisión de diseño |

## Contrato de API
Los de `/auth/*` son `AllowAnonymous`; `logout` también (usa el refresh token). Los de `/users/me/*` exigen sesión (`RequireAuthorization()` por defecto).

### Slice A
`POST /api/v1/auth/forgot-password` — `{ "email": "ana@mail.com" }` → `200 { data: true }` exista o no la cuenta.
`POST /api/v1/auth/reset-password` — `{ "email": "ana@mail.com", "code": "004821", "newPassword": "Nueva1234" }` → `200 { data: true }`.

### Slice B
`POST /api/v1/auth/logout` — `{ "refreshToken": "…" }` → `200 { data: true }`.

### Slice C
`PUT /api/v1/users/me/password` — `{ "currentPassword": "…", "newPassword": "…", "refreshToken": "…" }` (el refresh token de la sesión actual, para conservarlo) → `200 { data: true }`.

### Slice D
`POST /api/v1/users/me/email` — `{ "newEmail": "ana.nueva@mail.com", "password": "…" }` → `200 { data: true }`.
`POST /api/v1/users/me/email/confirm` — `{ "code": "004821" }` → `200 { data: true }`.

Todas responden en `WaggoApiResponse`. Los DTO van en `Waggo.Api/Endpoints/Identity/Requests/` con su validador de capa 1 en `Validators/`.

### Errores nuevos (`IdentityErrors`)
| `code` | HTTP | Mensaje (español) |
|---|---|---|
| `Identity.ResetCodeInvalid` | 404 | El código no es válido. |
| `Identity.ResetCodeExpired` | 409 | El código venció, pide uno nuevo. |
| `Identity.ResetAttemptsExceeded` | 422 | Demasiados intentos, pide un código nuevo. |
| `Identity.CurrentPasswordIncorrect` | 422 | La contraseña actual no es correcta. |
| `Identity.PasswordUnchanged` | 422 | La contraseña nueva debe ser distinta de la actual. |
| `Identity.EmailUnchanged` | 422 | Ese ya es el correo de tu cuenta. |
| `Identity.EmailChangeCodeInvalid` / `…Expired` / `…AttemptsExceeded` | 404 / 409 / 422 | Los mismos mensajes del código de recuperación. |

Se reutilizan `Identity.WeakPassword`, `Identity.EmailAlreadyRegistered`, `Identity.InvalidCredentials` y `Email.SendFailed` (503, igual que en el registro).

## Diseño
### Backend (`waggo-api`)
| Capa | Archivos nuevos o modificados |
|---|---|
| Domain | `User`: `TryIssueResetCode`, `ResetPassword`, `ChangePassword`, `RequestEmailChange`, `ConfirmEmailChange`; campos de código de recuperación y de cambio de correo pendiente; `IdentityErrors` |
| Application | Casos de uso `ForgotPassword`, `ResetPassword`, `Logout`, `ChangePassword`, `RequestEmailChange`, `ConfirmEmailChange`; plantillas de correo junto a `ConfirmationEmail`; `IRefreshTokenRepository.RevokeAllForUserExceptAsync` |
| Infrastructure | `UserConfiguration` y una migración por slice que agrega columnas |
| Api | `IdentityEndpoints` (auth) y `UsersEndpoints` (`/users/me/password`, `/users/me/email`); requests y validadores |

La rama local `feat/password-recovery` de `waggo-api` (y su stash) trae un avance del slice A: se revisa y se reutiliza lo que sirva, sin merge a ciegas.

### Mobile (`waggo-mobile`)
| Parte | Archivos |
|---|---|
| Feature `auth` | `ForgotPasswordScreen`, `ResetPasswordScreen`, enlace en `LoginScreen`, redirección por `AccountNotConfirmed`, `authApi`/`useAuth` con los endpoints nuevos |
| Feature `profile` | `ChangePasswordScreen` y `ChangeEmailScreen` dentro de Configuración; "Cerrar sesión" llama a `logout` |
| Rutas | `src/app/olvide-contrasena.tsx`, `restablecer-contrasena.tsx`, `configuracion/contrasena.tsx`, `configuracion/correo.tsx` |

## Plan TDD
Por slice, backend primero (ver `backend-checklist.md`): 🔴 aceptación en `Waggo.Api.IntegrationTests` → 🔴→🟢 validador de capa 1 → dominio (`UserTests`) → capa 2 y handler → infraestructura y endpoint. Después mobile (ver `mobile-checklist.md`): 🔴 pantalla → `api`/hooks → pantalla conectada. Cada fila de la tabla de ejemplos es al menos una prueba.

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| RNF-001 (seguridad de credenciales) | Códigos solo como hash, intentos y vigencia acotados, sesiones revocadas, contraseña con bcrypt | 6, 9, 10–13, 23 |
| RNF-002 (sesión) | Refresh token revocado en el servidor | 9, 18, 19 |

## Preguntas abiertas para el PO
- [ ] ¿Se confirma 15 minutos de vigencia para recuperación y cambio de correo (la confirmación de registro usa 30)?
- [ ] ¿Cambiar la contraseña con la sesión abierta cierra las demás sesiones (propuesto) o las deja?
- [ ] ¿Se mandan los avisos de seguridad al cambiar contraseña y correo (propuesto) o solo el código?
- [ ] ¿Entra "Cambiar correo" ahora (slice D) o se deja para después?
- [ ] ¿Se atiende en esta misma spec el registro que revela si un correo ya existe, o va en otra?

## Trazabilidad
Se completa al implementar cada slice.

| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | | |
| waggo-mobile | | |
