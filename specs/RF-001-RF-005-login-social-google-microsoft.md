---
rf: RF-001, RF-005
titulo: Crear cuenta e iniciar sesión con Google o Microsoft
estado: Lista
modulo: Identity
sprint: 1
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-24
---

# RF-001 + RF-005 — Login social (Google, Microsoft)

> Vault: `01 Proyecto/Requerimientos funcionales.md` (RF-001, RF-005) · Decisión: [[ADR-017 Login sin 2FA obligatorio y federación OAuth con Google y Microsoft|ADR-017]]
> Extiende: `RF-001-RF-005-identidad-y-login.md` (correo+contraseña). Apple queda fuera de alcance por ahora (requiere Apple Developer Program de pago).

## Historia de usuario
Como **dueño o paseador** quiero **crear una cuenta o iniciar sesión usando mi cuenta de Google o Microsoft** para **no tener que inventar ni recordar otra contraseña**.

## Criterios de aceptación
- [ ] El móvil obtiene el `idToken` del proveedor (Google o Microsoft) con el SDK nativo; la API nunca ve la contraseña de esas cuentas.
- [ ] Si el correo del proveedor ya tiene cuenta en Waggo (por registro con correo+contraseña o por el otro proveedor), se vincula a esa cuenta — no se crea una duplicada.
- [ ] Si no existe ninguna cuenta con ese correo, se crea una nueva, ya confirmada (el proveedor ya verificó el correo).
- [ ] La sesión resultante es el mismo `accessToken`/`refreshToken` de siempre (ADR-016); el resto de la API no distingue cómo entró el usuario.
- [ ] Un `idToken` con firma inválida, emisor o audiencia equivocados se rechaza sin crear ni modificar ninguna cuenta.

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

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Vinculación por correo | Automática, sin paso de confirmación extra (el proveedor ya verificó el correo) | ADR-017 |
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
| Token inválido (firma, emisor, audiencia o expiración) | `Identity.ExternalTokenInvalid` | 400 | No pudimos validar tu cuenta de Google/Microsoft, intenta de nuevo. |

## Diseño

### Backend (`waggo-api`)
| Capa | Archivos nuevos o modificados |
|---|---|
| Domain | `Entities/Identity/ExternalLogin.cs` (`Provider`, `ProviderUserId`, `UserId`); `User.cs` gana una forma de registrarse ya confirmado desde un proveedor externo; `IdentityErrors.ExternalTokenInvalid` |
| Application | `Identity/Commands/{LoginWithGoogle,LoginWithMicrosoft}/` (o un único `LoginWithExternalProviderCommand` parametrizado por `OAuthProvider`, a decidir en el diseño detallado); puerto `IExternalIdentityProvider` (uno por proveedor) que valida el `idToken` y devuelve `(ProviderUserId, Email)`; puerto `IExternalLoginRepository` |
| Infrastructure | `Services/Identity/{GoogleIdentityProvider,MicrosoftIdentityProvider}.cs` (validan JWKS con `Microsoft.IdentityModel.Tokens`/`System.IdentityModel.Tokens.Jwt`, cacheando las claves públicas); `Options/Identity/{GoogleAuthOptions,MicrosoftAuthOptions}.cs` (`ClientId`, Microsoft además `TenantId` o `common`); `ExternalLoginRepository`; `Persistence/Configurations/Identity/ExternalLoginConfiguration.cs`; migración `AddExternalLogins` |
| Api | `Endpoints/Identity/IdentityEndpoints.cs` (dos rutas nuevas), `Requests/{GoogleLoginRequest,MicrosoftLoginRequest}.cs` + validadores |

Persistencia (schema `identity`):
- `identity.external_logins` (Id uuid pk, UserId fk, Provider text, ProviderUserId text, CreatedAt; índice único `(Provider, ProviderUserId)`)

### Mobile (`waggo-mobile`)
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
- [ ] Microsoft: ¿cualquier cuenta Microsoft/Outlook personal y corporativa (`common`), o solo un tenant específico?
- [ ] ¿Apple se retoma más adelante? (requiere Apple Developer Program, US$99/año)
- [ ] Librería exacta para Microsoft en Expo (MSAL vs `expo-auth-session` genérico contra el endpoint de Entra ID) — se decide al implementar, no bloquea el contrato de este spec.

## Trazabilidad
Se completa al implementar.

| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | | |
| waggo-mobile | | |
