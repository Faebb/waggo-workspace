# Backend checklist (waggo-api)

Single checklist used by `backend-test-writer`, `backend-implementer` and `architecture-reviewer`.
It summarizes the vault notes; when in doubt, the vault note wins:
`03 Desarrollo/Estructura de carpetas del backend.md`, `Convenciones de código.md`,
`Convención de respuestas y logging.md`, `02 Arquitectura/API - Pipeline, seguridad y errores.md`, ADR-005…ADR-012.

## 0. Principle
- [ ] **Simplicity first**: the simplest code that is understandable at a glance. No clever abstractions, nothing implicit.

## 1. Where each file goes (ADR-012)
| What | Folder |
|---|---|
| Entity (has Id, persisted) | `Waggo.Domain/Entities/<Module>/` |
| Value object | `Waggo.Domain/ValueObjects/<Module>/` |
| Enum | `Waggo.Domain/Enums/<Module>/` |
| Business error catalog `<Module>Errors` | `Waggo.Domain/Errors/<Module>/` |
| Custom exception | `Waggo.Domain/Exceptions/` (derive from `WaggoException`, `sealed`) |
| Domain logic spanning several objects | `Waggo.Domain/Services/<Module>/` |
| Interface (port) | `Waggo.Application/Common/Interfaces/<Module>/` |
| Use case | `Waggo.Application/<Module>/Commands|Queries/<UseCase>/` → `<X>Command|Query`, `<X>Handler`, `<X>Validator`, `<X>Response` |
| Helper (extension methods) | `Waggo.Application/Common/Extensions/` · `Waggo.Api/Infrastructure/Extensions/` |
| Constants / message codes `<Module>Messages` | `Waggo.Application/Common/Constants/<Module>/` |
| Interface implementation | `Waggo.Infrastructure/Services/<Module>/` |
| EF Core mapping `<Entity>Configuration` | `Waggo.Infrastructure/Persistence/Configurations/<Module>/` |
| Options (appsettings) | `Waggo.Infrastructure/Options/<Module>/` · `Waggo.Api/Infrastructure/Settings/` |
| Endpoints `<Module>Endpoints` | `Waggo.Api/Endpoints/<Module>/` |
| Request DTO + DTO validator | `Waggo.Api/Endpoints/<Module>/Requests/` · `Validators/` |
| Middleware, filters, auth | `Waggo.Api/Infrastructure/{Middleware,Filters,Authentication,Authorization}/` |
| Tests | Same folders under `Tests/<Project>.Tests/` |

- [ ] One type per file; namespace = folder; new things registered in the layer's `DependencyInjection.cs`.

## 2. Code conventions (ADR-008, enforced by the build)
- [ ] English code, comments and XML docs. **Public messages to the user in Spanish**, explaining how to fix the problem.
- [ ] Never `var`: explicit types, target-typed `new()`.
- [ ] `_camelCase` instance fields, `s_camelCase` private static readonly, `PascalCase` constants and public static catalogs.
- [ ] Braces always (Allman); `sealed` by default; access modifiers explicit; `CancellationToken` last.
- [ ] Lines ≤ 120; `dotnet format` leaves no changes.

## 3. Responses, validation and errors
- [ ] Every operation returns `WaggoResponse<T>`; result in `Data`; `AddError` / `AddWarning` / `AddInfo`.
- [ ] After calling another operation: `response.ConcatStacks(other); if (!response.IsValid) { return response; }`.
- [ ] **Validation layer 1 (DTO)**: `<X>RequestValidator` in `Waggo.Api/Endpoints/<Module>/Validators/`, codes `Request.Required` / `Request.InvalidValue` (`RequestErrors`), wired with `.WithRequestValidation<TRequest>()`.
- [ ] **Validation layer 2 (business)**: `<X>Validator` (`internal sealed`) next to the handler, rules with `.WithError(<Module>Errors.X)`, first step of the handler with `ValidateToResponseAsync`.
- [ ] Domain keeps its own invariants (value object factories return `WaggoResponse<T>`).
- [ ] Expected/accumulable errors → `AddError`. Operation cannot continue → custom exception (`NotFound`, `Conflict`, `Forbidden`, `Unauthorized`, `BusinessRule`, `ExternalService`) with a public `Error` + technical detail. Never `throw new Exception(...)`, never expose `exception.Message`.
- [ ] Methods do not log results; the endpoint calls `response.WriteLogs(logger, "<Operation>")` once. Internal data → `MessageVisibility.Internal`.

## 4. Endpoints and security
- [ ] Endpoint: DTO with `[AsParameters]` or body → `request.ToQuery()/ToCommand()` → handler → `WriteLogs` → `ToApiResult()` / `ToPagedApiResult()`. Never `Results.Ok/Problem`.
- [ ] `.RequireAuthorization(WaggoPolicies.Owner|Walker|Admin)` on every endpoint (fallback = authenticated). `AllowAnonymous` only if the spec says so.
- [ ] Paged lists: `PageRequest` (page ≥ 1, size 1–100) → `PagedList<T>`.
- [ ] No card data (RNF-004); sensitive data encrypted (RNF-003); no secrets in code.

## 5. Tests (ADR-005)
- [ ] Every example row of the spec has at least one test; names `Method_Scenario_ExpectedResult`; AAA; Shouldly; NSubstitute for ports.
- [ ] Assert on codes: `response.Errors.ShouldContain(e => e.Code == "<Module>.<Error>")`.
- [ ] DTO validator → `Tests/Waggo.Api.UnitTests/Endpoints/<Module>/Validators/`; business validator and handler → `Tests/Waggo.Application.UnitTests/<Module>/<Commands|Queries>/<UseCase>/`.
- [ ] Endpoint acceptance → `Tests/Waggo.Api.IntegrationTests/Endpoints/<Module>/`: real PostgreSQL (Testcontainers), deserialize `WaggoApiResponse<T>`, check status + `success` + `data` + `errors[].code`; role rules with header `X-Dev-Roles`.
- [ ] Reusable data in `TestData/` (Object Mother), doubles in `TestDoubles/`.

## 6. Done
- [ ] `dotnet build` (0 warnings) · `dotnet format whitespace --verify-no-changes` · `dotnet test` green (Docker for integration).
- [ ] Packages only in `Directory.Packages.props`; no known vulnerabilities (NU1901–NU1904 break the build).
