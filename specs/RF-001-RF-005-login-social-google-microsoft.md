---
rf: RF-001, RF-005
titulo: Crear cuenta e iniciar sesión con Google o Microsoft
estado: En progreso
modulo: Identity
sprint: 1
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-28
---

# RF-001 + RF-005 — Login social (Google, Microsoft)

> Vault: `01 Proyecto/Requerimientos funcionales.md` (RF-001, RF-005) · Decisión: [[ADR-017 Login sin 2FA obligatorio y federación OAuth con Google y Microsoft|ADR-017]]
> Extiende: `RF-001-RF-005-identidad-y-login.md` (correo+contraseña). Apple queda fuera de alcance por ahora (requiere Apple Developer Program de pago).
>
> **Estado (2026-10-28):** **Google en la web: implementado y desplegado** (waggo-api #32, waggo-mobile #31). Pendientes: Google en iOS/Android (necesita el development build de EAS), **Microsoft** (decisiones abiertas abajo) y publicar la app de Google para el público.

## Historia de usuario
Como **dueño o paseador** quiero **crear una cuenta o iniciar sesión usando mi cuenta de Google o Microsoft** para **no tener que inventar ni recordar otra contraseña**.

## Criterios de aceptación
- [x] **Google, web:** el navegador obtiene el `idToken` con Google Identity Services; la API nunca ve la contraseña de esas cuentas.
- [ ] Google en iOS/Android (SDK nativo, development build) y Microsoft: pendientes.
- [x] Si el correo del proveedor ya tiene cuenta en Waggo (por registro con correo+contraseña o por el otro proveedor), se vincula a esa cuenta — no se crea una duplicada. **Solo si el proveedor marca el correo como verificado** (ver reglas).
- [x] Si no existe ninguna cuenta con ese correo, se crea una nueva, ya confirmada (el proveedor ya verificó el correo).
- [x] La sesión resultante es el mismo `accessToken`/`refreshToken` de siempre (ADR-016); el resto de la API no distingue cómo entró el usuario.
- [x] Un `idToken` con firma inválida, emisor o audiencia equivocados se rechaza sin crear ni modificar ninguna cuenta.
- [x] Un correo que el proveedor **no** marca como verificado no crea ni vincula nada (`Identity.ExternalEmailNotVerified`).
- [x] **Pre-secuestro:** si el correo ya tenía una cuenta que nunca se confirmó, se confirma al entrar con el proveedor y su contraseña anterior se reemplaza por una inutilizable.
- [x] Sin IDs de cliente configurados (`Authentication:Google:ClientIds`), la API rechaza todo token.

## Tabla de ejemplos
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | `idToken` de Google válido, correo nuevo | 200, cuenta creada y confirmada, `accessToken` + `refreshToken` | Feliz |
| 2 | `idToken` de Microsoft válido, correo nuevo | 200, igual que el caso 1 | Feliz |
| 3 | `idToken` válido cuyo correo ya tiene cuenta (correo+contraseña) | 200, se vincula a la cuenta existente, no se duplica | Feliz |
| 4 | `idToken` válido de Google y luego de Microsoft con el mismo correo | 200 en ambos, misma cuenta vinculada a los dos proveedores | Feliz |
| 5 | Mismo `idToken` de Google usado dos veces (ya vinculado) | 200, entra a la misma cuenta (no crea otra) | Feliz |
| 6 | `idToken` con firma inválida (manipulado) | ❌ `Identity.ExternalTokenInvalid` | Error |
| 7 | `idToken` de Google con `aud` que no es nuestro Client ID | ❌ `Identity.ExternalTokenInvalid` | Error |
| 8 | `idToken` expirado | ❌ `Identity.ExternalTokenInvalid` | Límite |
| 9 | `idToken` vacío o ausente | ❌ `Request.Required` (capa 1) | Error |
| 10 | `idToken` de Google válido cuyo correo **no** está verificado | ❌ `Identity.ExternalEmailNotVerified` (422); no se crea ni vincula nada | Error |
| 11 | El correo estaba registrado con contraseña pero **nunca confirmado**; la persona entra con Google | 200; la cuenta queda confirmada y vinculada, y la contraseña anterior deja de servir | Límite (pre-secuestro) |
| 12 | Google no responde al leer sus claves de firma | ❌ `Identity.ExternalProviderUnavailable` (503) | Error |
| 13 | No hay IDs de cliente configurados | ❌ `Identity.ExternalTokenInvalid` para cualquier token | Error |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Vinculación por correo | Automática, **solo la primera vez y solo si el proveedor marca el correo como verificado**; después se entra por el id del proveedor (`sub`), nunca por correo | ADR-017, ajustada 2026-10-28 |
| Usuarios creados por proveedor | No tienen contraseña propia (se guarda el hash de un secreto aleatorio que nadie conoce); pueden fijar una con "olvidé mi contraseña" | Seguridad |
| Microsoft | **No** se vincula solo por correo: Microsoft documenta que el claim `email` no está garantizado ni es inmutable, y que el usuario se identifica por `oid`/`sub`. Política exacta pendiente | ⚠️ pendiente del PO |
| Cuenta creada por proveedor | Queda `EmailConfirmed = true` de una vez | ADR-017 |
| Rol al vincular/crear | Igual que cualquier `User`: `owner` por defecto, `walker` si tiene `WalkerProfile` aprobado, `admin` manual | ADR-016 (sin cambios) |
| Proveedores en alcance | Google, Microsoft | ADR-017 |
| Apple | Fuera de alcance (Apple Developer Program de pago) | ADR-017 |

## Contrato de API
Ambos `AllowAnonymous` (como `/auth/login`).

### `POST /api/v1/auth/login/google`
Request (`Waggo.Api/Endpoints/Identity/Requests/GoogleLoginRequest.cs`):
```json
{ "idToken": "eyJhbGciOi..." }
```
Response `200`: misma forma que `/auth/login`:
```json
{ "success": true, "data": { "accessToken": "...", "refreshToken": "...", "expiresInSeconds": 900 }, "pagination": null, "errors": [], "warnings": [], "infos": [], "traceId": "..." }
```

### `POST /api/v1/auth/login/microsoft`
Request (`Waggo.Api/Endpoints/Identity/Requests/MicrosoftLoginRequest.cs`):
```json
{ "idToken": "eyJhbGciOi..." }
```
Response `200`: igual forma que arriba.

### Validación capa 1 — DTO
| Campo | Regla | `code` | Mensaje |
|---|---|---|---|
| `idToken` | Obligatorio | `Request.Required` | Falta el token del proveedor. |

### Validación capa 2 — negocio
| Regla | `code` | HTTP | Mensaje |
|---|---|---|---|
| Token inválido (firma, emisor, audiencia o expiración) | `Identity.ExternalTokenInvalid` | 400 | No pudimos validar tu cuenta de Google o Microsoft, intenta de nuevo. |
| El proveedor no verificó el correo | `Identity.ExternalEmailNotVerified` | 422 | Tu cuenta de Google o Microsoft no tiene el correo verificado. Verifícalo allí e intenta de nuevo. |
| No se pueden leer las claves del proveedor | `Identity.ExternalProviderUnavailable` | 503 | No pudimos conectar con Google o Microsoft en este momento. Intenta de nuevo en unos minutos. |

## Diseño

### Backend (`waggo-api`)
> **Como quedó (Google, waggo-api #32):** un solo caso de uso `LoginWithExternalProvider` parametrizado por `ExternalProvider` (Microsoft se enchufa al mismo puerto `IExternalIdentityProvider`); `User.RegisterExternal` y `User.ConfirmByExternalProvider`; `GoogleIdentityProvider` valida firma RS256 con las claves rotativas del discovery de Google, emisor, vigencia y audiencia; la opción es **`Authentication:Google:ClientIds` (lista)**, un ID por plataforma (web, Android, iOS), no un único `ClientId`. Un solo endpoint por proveedor: `POST /auth/login/google`.

| Capa | Archivos nuevos o modificados |
|---|---|
| Domain | `Entities/Identity/ExternalLogin.cs` (`Provider`, `ProviderUserId`, `UserId`); `User.cs` gana una forma de registrarse ya confirmado desde un proveedor externo; `IdentityErrors.ExternalTokenInvalid` |
| Application | `Identity/Commands/{LoginWithGoogle,LoginWithMicrosoft}/` (o un único `LoginWithExternalProviderCommand` parametrizado por `OAuthProvider`, a decidir en el diseño detallado); puerto `IExternalIdentityProvider` (uno por proveedor) que valida el `idToken` y devuelve `(ProviderUserId, Email)`; puerto `IExternalLoginRepository` |
| Infrastructure | `Services/Identity/{GoogleIdentityProvider,MicrosoftIdentityProvider}.cs` (validan JWKS con `Microsoft.IdentityModel.Tokens`/`System.IdentityModel.Tokens.Jwt`, cacheando las claves públicas); `Options/Identity/{GoogleAuthOptions,MicrosoftAuthOptions}.cs` (`ClientId`, Microsoft además `TenantId` o `common`); `ExternalLoginRepository`; `Persistence/Configurations/Identity/ExternalLoginConfiguration.cs`; migración `AddExternalLogins` |
| Api | `Endpoints/Identity/IdentityEndpoints.cs` (dos rutas nuevas), `Requests/{GoogleLoginRequest,MicrosoftLoginRequest}.cs` + validadores |

Persistencia (schema `identity`):
- `identity.external_logins` (Id uuid pk, UserId fk, Provider text, ProviderUserId text, CreatedAt; índice único `(Provider, ProviderUserId)`)

### Mobile (`waggo-mobile`)
> **Como quedó (Google, web, waggo-mobile #31):** el botón oficial de Google Identity Services ("Continuar con Google", en español) bajo un divisor "o" en `LoginScreen` y `RegisterScreen`; no se usa `expo-auth-session` porque su proveedor de Google está deprecado en Expo SDK 57. El ID de cliente web es público (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, en el workflow de despliegue); sin él no hay botón. En iOS/Android no se muestra nada hasta tener el development build de EAS: el login nativo de Google necesita código nativo y no funciona en Expo Go.
>
> **Google Cloud:** proyecto "Waggo" con pantalla de consentimiento externa (permisos básicos `openid`, `email`, `profile`) en **modo prueba**: solo entran los usuarios de prueba (hasta 100). Para abrirla a cualquiera hay que publicar la app; con permisos básicos no exige revisión.

| Parte | Archivos |
|---|---|
| Feature | `src/features/auth/api/{googleLogin,microsoftLogin}.ts` (Zod, `SessionResponse`); botones en `LoginScreen` y `RegisterScreen` ("Continuar con Google" / "Continuar con Microsoft") |
| SDK | `expo-auth-session` (Google) y `expo-auth-session` o MSAL vía Entra ID (Microsoft) — se confirma en el diseño detallado según qué flujo exige cada config de Expo |
| Config | `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_MICROSOFT_CLIENT_ID`/`TENANT_ID` en `.env` |

## Plan TDD
Backend, un slice por proveedor (empezar por Google):
1. 🔴 `Tests/Waggo.Domain.UnitTests/Entities/Identity/ExternalLoginTests.cs`.
2. 🔴→🟢 `Tests/Waggo.Application.UnitTests/Identity/Commands/LoginWithGoogle/*HandlerTests.cs` con `IExternalIdentityProvider`/`IExternalLoginRepository`/`IUserRepository` dobles (NSubstitute) — cubre crear cuenta, vincular por correo, vincular dos veces.
3. 🟢 `GoogleIdentityProvider` (validación real de JWT contra JWKS; prueba con un token firmado con una clave de prueba, no contra Google real), `ExternalLoginRepository`, migración.
4. 🟢 Endpoint + `Tests/Waggo.Api.IntegrationTests/Endpoints/Identity/GoogleLoginEndpointTests.cs`.
5. Repetir 1–4 para Microsoft.

Mobile:
1. 🔴 `LoginScreen.test.tsx` — nuevo botón, llama al flujo de Google/Microsoft y navega igual que el login por correo al tener sesión.
2. 🔴→🟢 `googleLogin.ts`/`microsoftLogin.ts` (api), mock de `expo-auth-session`.
3. 🟢 Conectar el botón real.

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| RNF-002 (sesión) | Misma política de access/refresh token que el login por correo (ADR-016), sin cambios | Reutiliza `SessionIssuer` |

## Preguntas abiertas para el PO
- [ ] Microsoft: ¿cualquier cuenta Microsoft/Outlook personal y corporativa (`common`), o solo un tenant específico? (Recomendado: `common`; el emisor cambia por organización, así que se valida su formato, no un valor fijo.)
- [ ] Microsoft: ¿vincular por correo? Recomendado: **no**; identificar por `oid`/`sub` y, si el correo ya existe, pedir iniciar sesión con la contraseña antes de vincular.
- [ ] ¿Apple se retoma más adelante? (requiere Apple Developer Program, US$99/año)
- [ ] Librería exacta para Microsoft en Expo (MSAL vs `expo-auth-session` genérico contra el endpoint de Entra ID) — se decide al implementar, no bloquea el contrato de este spec.

## Trazabilidad
Google en la web (2026-10-28). Microsoft y el login nativo siguen pendientes.

| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api (#32) | `Waggo.Domain/Entities/Identity/ExternalLogin.cs`, `Enums/Identity/ExternalProvider.cs`, `User.{RegisterExternal, ConfirmByExternalProvider}`, `IdentityErrors.{ExternalTokenInvalid, ExternalEmailNotVerified, ExternalProviderUnavailable}`; `Application/Identity/Commands/LoginWithExternalProvider/`, puertos `IExternalIdentityProvider` e `IExternalLoginRepository`; `Infrastructure/Services/Identity/{GoogleIdentityProvider, ExternalLoginRepository}.cs`, `Options/Identity/GoogleAuthOptions.cs`, migración `AddExternalLogins`; `Api/Endpoints/Identity/{Requests/GoogleLoginRequest, Validators/GoogleLoginRequestValidator}.cs` y la ruta `POST /auth/login/google` | `ExternalLoginTests`, `UserExternalTests`, `LoginWithExternalProviderHandlerTests`, `GoogleIdentityProviderTests` (claves RSA de prueba), `GoogleLoginRequestValidatorTests`, `GoogleLoginEndpointTests` (proveedor falso, PostgreSQL real) |
| waggo-mobile (#31) | `src/shared/auth/{googleIdentity.ts, GoogleSignInButton.web.tsx, GoogleSignInButton.native.tsx, GoogleSignInButton.d.ts, googleSignInTypes.ts}`, `authApi.googleLogin`, `useGoogleLogin`, botón en `LoginScreen` y `RegisterScreen`, `env.googleWebClientId` | `googleIdentity.test.ts` (jsdom), `GoogleSignInButton.test.tsx`, `authApi.test.ts`, `LoginScreen.test.tsx`, `RegisterScreen.test.tsx` |
| waggo-infra (#7) | el ID de cliente y la variable `Authentication__Google__ClientIds__0` de la tarea de producción (repo privado) | `test/infra.test.ts` |
