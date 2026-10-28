---
rf: INF-001
titulo: Despliegue público en AWS (base de datos, API y web)
estado: En progreso
modulo: Infraestructura
sprint: transversal
prioridad: Alta
repos: [waggo-api, waggo-mobile, waggo-infra]
actualizado: 2026-10-27
---

# INF-001 — Despliegue público en AWS

> Vault: `02 Arquitectura/Contenedores y despliegue.md` ("Destino del piloto: por decidir") · `03 Desarrollo/CI-CD.md` (fases CD-1 y CD-2)
> No es un RF del SRS: es infraestructura (prefijo `INF-XXX`, misma plantilla). Al pasar a `Lista` genera un ADR con el destino elegido (`/new-adr`).

## Historia de usuario
Como **desarrollador de Waggo** quiero **que cada cambio que llega a `main` en `waggo-api` o `waggo-mobile` se publique solo en AWS** para **tener Waggo accesible públicamente en `mywaggo.com` sin desplegar a mano ni compartir credenciales**.

## Arquitectura propuesta (un solo ambiente: producción del piloto)

```mermaid
flowchart LR
  U[Usuario] --> CF[CloudFront<br/>app.mywaggo.com]
  CF --> S3[(S3<br/>build web Expo)]
  U --> API[api.mywaggo.com<br/>ECS Fargate · HTTPS]
  API --> DB[(RDS PostgreSQL 17<br/>+ PostGIS · privada)]
  API --> SES[SES<br/>noreply@mywaggo.com]
  API --> SM[Secrets Manager]
  GH[GitHub Actions<br/>OIDC, sin claves] --> ECR[ECR waggo-api]
  GH --> S3
  ECR --> API
```

| Pieza | Servicio | Por qué | Costo aprox./mes |
|---|---|---|---|
| Base de datos | RDS PostgreSQL 17 `db.t4g.micro`, 20 GB gp3, subred privada, backups 7 días | PostGIS soportado; gestionado | ~US$15 |
| API | ECS Fargate (0.25 vCPU / 0.5 GB) detrás de ALB con certificado ACM | Usa la imagen Docker actual sin cambios; ⚠️ verificar si App Runner sigue aceptando cuentas nuevas antes de elegirlo | ~US$10 + ~US$17 (ALB) |
| Web | S3 + CloudFront (el build `expo export --platform web` ya es estático; `nginx.conf` deja de usarse en producción) | Casi gratis; sin servidor | <US$2 |
| DNS y certificados | Route 53 + ACM (dominio `mywaggo.com` ya existe) | — | ~US$1 |
| Imágenes | ECR con lifecycle (últimas 10) | — | <US$1 |
| Secretos | Secrets Manager (contraseña de BD, clave JWT, credenciales OAuth) | Nada de secretos en el repo ni en la imagen | ~US$2 |

Total estimado: **~US$45–50/mes**. ⚠️ provisional.

## Qué pasa cuando cambias código y haces merge a `main`

### waggo-api
1. PR → CI actual (`build-test`, `conventional-title`) obligatorio, sin cambios.
2. Merge a `main` → job nuevo **`deploy`** (solo corre si CI pasó en ese commit):
   1. Autentica con AWS por **OIDC** (rol IAM que solo `Faebb/waggo-api@main` puede asumir; sin claves en GitHub).
   2. `docker build` y push a ECR con etiqueta = SHA del commit.
   3. **Migraciones**: tarea ECS de un solo uso con la misma imagen que ejecuta `MigrateDatabaseAsync` (hoy solo corre en local; ver Reglas).
   4. Actualiza el servicio ECS a la nueva imagen (rolling: la versión vieja sigue hasta que la nueva pasa `/health/ready`).
   5. Smoke test: `GET https://api.mywaggo.com/health/ready` → 200; si falla, el job falla y ECS conserva la versión anterior.

### waggo-mobile (web)
1. PR → CI actual.
2. Merge a `main` → job **`deploy-web`**: OIDC → `expo export --platform web` con `EXPO_PUBLIC_API_URL=https://api.mywaggo.com` → `aws s3 sync` → invalidación de CloudFront.
3. Apps iOS/Android: fuera de alcance (EAS Build, fase CD-3).

### Cambios que tocan los dos repos (contrato `/api/v1`)
- Flujo `/api-contract-change`: **API primero, web después**. Todo cambio de contrato debe ser compatible hacia atrás durante el intervalo entre ambos despliegues (agregar campos sí; renombrar o borrar solo en dos pasos).
- Migraciones de BD: patrón expandir/contraer (nunca borrar una columna en el mismo release que deja de usarla).

### Rollback
- API: volver a desplegar el SHA anterior desde ECR (workflow manual `rollback` con el SHA como parámetro).
- Web: re-ejecutar el deploy del commit anterior (S3 + invalidación).
- BD: backups automáticos de RDS; una migración mala se corrige con otra migración hacia adelante.

## Criterios de aceptación
- [ ] `https://api.mywaggo.com/health/ready` responde 200 y `https://app.mywaggo.com` carga la app web hablando con esa API.
- [ ] RDS sin IP pública; solo el security group de la API puede conectarse al puerto 5432.
- [ ] Merge a `main` en `waggo-api` publica la nueva versión sin pasos manuales y sin claves AWS guardadas en GitHub (OIDC).
- [ ] Merge a `main` en `waggo-mobile` publica la web nueva e invalida CloudFront.
- [ ] Si el health check de la versión nueva falla, la versión anterior sigue sirviendo.
- [ ] En producción **no** se ejecuta el seed de usuarios de prueba (DEV-001) y `Authentication__UseDevelopmentUser=false`.
- [ ] La infraestructura se puede recrear desde código (repo `waggo-infra`), no solo desde la consola.
- [ ] El correo sale por SES con el rol de la tarea ECS, no con las claves del perfil `waggo-ses`.

## Tabla de ejemplos
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | Merge a `main` en waggo-api con CI verde | Imagen `:<sha>` en ECR, migraciones aplicadas, servicio actualizado, smoke test 200 | Feliz |
| 2 | Merge a `main` en waggo-mobile con CI verde | Web nueva en `app.mywaggo.com` tras invalidar caché | Feliz |
| 3 | CI rojo en el PR | No se puede hacer merge (protección de rama); no hay deploy | Error |
| 4 | Migración falla en el despliegue | Job falla; el servicio no se actualiza; la versión anterior sigue activa | Error |
| 5 | Versión nueva no pasa `/health/ready` | ECS no la promueve; el job falla | Error |
| 6 | PR externo (fork) | No recibe credenciales AWS: `deploy` solo corre en `push` a `main` | Límite |
| 7 | Dos merges seguidos a `main` | Los despliegues se serializan (`concurrency` por servicio), no se pisan | Límite |
| 8 | Rollback manual a SHA anterior | Servicio vuelve a esa imagen; las migraciones no se revierten | Feliz |

## Reglas de negocio / técnicas
| Regla | Valor | Origen |
|---|---|---|
| Región | `us-east-1` (donde ya está SES y la cuenta) | Estado actual |
| Cuenta AWS | `021882900326` | Estado actual |
| Ambientes | Uno (producción del piloto); staging se evalúa cuando haya usuarios reales | ⚠️ provisional |
| Despliegue a producción | Automático al merge (el merge ya exige PR + CI verde) | ⚠️ provisional |
| Credenciales de CI | OIDC, rol con permisos mínimos por repo | Seguridad |
| Migraciones | Paso explícito del despliegue; `MigrateDatabaseIfLocalAsync` sigue siendo solo local | Código actual |
| Seed y usuario de desarrollo | Desactivados fuera de Development/Testing | DEV-001 |
| Repos públicos | Los workflows no pueden imprimir secretos; los secretos viven en AWS, no en GitHub | Repos públicos MIT |

## Diseño

### `waggo-infra` (repo nuevo, IaC con AWS CDK en TypeScript) ⚠️ pendiente de aprobar
Stacks: `Network` (VPC, subredes, security groups) → `Data` (RDS, Secrets) → `Api` (ECR, ECS, ALB, rol de tarea con permiso SES) → `Web` (S3, CloudFront, ACM, Route 53) → `Pipeline` (proveedor OIDC de GitHub y roles de despliegue por repo).

### Backend (`waggo-api`)
| Parte | Cambio |
|---|---|
| `.github/workflows/deploy.yml` | Job `deploy` (ver flujo) con `permissions: id-token: write` solo en este job |
| Comando de migración | Modo de arranque `--migrate-only` (o argumento equivalente) que aplica migraciones y termina; hoy solo existe `MigrateDatabaseIfLocalAsync` |
| Configuración de producción | Todo por variables de entorno / Secrets Manager; sin `Seed` en `appsettings.json` |

### Mobile (`waggo-mobile`)
| Parte | Cambio |
|---|---|
| `.github/workflows/deploy.yml` | Job `deploy-web` (ver flujo); URL de la API como variable del repo, no secreto |
| CORS | La API debe permitir el origen `https://app.mywaggo.com` ⚠️ verificar en `Program.cs` |

## Plan (adaptado de TDD a infraestructura)
Cada paso termina verificado contra AWS real antes de pasar al siguiente:
1. **Red + base de datos**: RDS + PostGIS + secreto. Verificación: `CREATE EXTENSION postgis` y conexión desde una tarea efímera dentro de la VPC.
2. **API**: ECR, ECS, ALB, `api.mywaggo.com`. Primer despliegue manual de la imagen actual; `/health/ready` = 200 contra RDS.
3. **Migración como paso**: `--migrate-only` con pruebas (TDD en `waggo-api`) y su prueba de integración.
4. **Web**: S3 + CloudFront + `app.mywaggo.com`; primer `sync` manual.
5. **CD**: workflows `deploy` en ambos repos con OIDC; probar con un cambio trivial (un PR real) y con un fallo provocado (caso 4 y 5).
6. **Docs**: ADR del destino, actualizar `Contenedores y despliegue.md`, `CI-CD.md` (fases CD-1/CD-2 hechas) y `Estado de implementación.md` (`/sync-docs`).

## RNF aplicables
| RNF | Cómo se cumple | Prueba |
|---|---|---|
| Seguridad (datos sensibles) | BD privada, TLS en ALB y CloudFront, secretos en Secrets Manager, sin claves de larga vida | Revisión de security groups; `aws iam` sin access keys para CI |
| Disponibilidad | Rolling deploy con health check; backups RDS | Casos 4 y 5 de la tabla |
| Costo | Un ambiente, instancias mínimas, alarma de presupuesto | AWS Budgets a US$60/mes ⚠️ provisional |

## Decisiones del PO (2026-10-27, ver ADR-020)
- [x] Un solo ambiente (producción del piloto).
- [x] Despliegue automático al merge.
- [x] Repo `waggo-infra` con CDK.
- [x] Subdominios `app.mywaggo.com` y `api.mywaggo.com`.
- [x] ECS Fargate para la API.
- [ ] Presupuesto mensual máximo (se usa US$60 como alarma provisional).

## Estado (2026-10-28)
| Paso del plan | Estado |
|---|---|
| 1. Red + base de datos | ✅ desplegado (RDS PostgreSQL 17, privada) |
| 2. API (ECR, ECS, ALB) | ✅ desplegada, HTTPS en `api.mywaggo.com` |
| 3. Migración como paso (`--migrate-only`) | ✅ waggo-api#30 |
| 4. Web (S3 + CloudFront, `app.mywaggo.com`) | ⏳ pendiente |
| 5. CD | ✅ API (`deploy.yml`, OIDC) · ⏳ web |
| 6. Docs | ✅ ADR-020 y guía de operación en el vault; se actualizan en cada paso |

Desviaciones respecto del borrador:
- **DNS en Cloudflare, no en Route 53**: el certificado ACM se valida con CNAME manual y `api` apunta al ALB con CNAME "solo DNS".
- **Producción corre con `Payments__Provider=Simulated`**: es el único proveedor que existe (ADR-014); no mueve dinero real.
- **GitHub emite el sujeto OIDC con ids inmutables** (`repo:Faebb@<id>/waggo-api@<id>`); el rol confía en ese formato.
- **CDK y el CI comparten la imagen de la API**: se despliega con `--exclusively` y `-c imageTag=<sha actual>`.

## Trazabilidad
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | `Waggo.Api/Infrastructure/Extensions/StartupArguments.cs`, `Waggo.Api/Program.cs`, `.github/workflows/deploy.yml` (PR #30, #31) | `Tests/Waggo.Api.UnitTests/Infrastructure/Extensions/StartupArgumentsTests.cs` |
| waggo-mobile | pendiente (web) | |
| waggo-infra | `lib/*-stack.ts`, `bin/waggo-infra.ts` (PR #1) | `test/infra.test.ts` (11 pruebas) |
