# Specs

Una spec traduce un requerimiento del vault (RF-XXX) en algo que se puede implementar con TDD sin interpretar: ejemplos concretos, contrato y plan de pruebas.

## Ciclo de vida
| Estado | Significa | Quién lo cambia |
|---|---|---|
| `Borrador` | Creada con `/new-spec`, con preguntas abiertas | Analista / Claude |
| `Lista` | El PO validó los ejemplos y resolvió las preguntas (Definition of Ready) | PO |
| `En progreso` | `/implement-spec` en curso | Dev / Claude |
| `Implementada` | Código y pruebas en ambos repos; la trazabilidad está completa | Dev / Claude |
| `Obsoleta` | Reemplazada por otra spec o por un cambio de alcance | PO |

## Convenciones
- Archivo: `RF-XXX-<slug-en-español>.md`. Si un RF se parte en slices: `RF-XXX-<slug>-<slice>.md`.
- Una pantalla o flujo que no es un RF del SRS (por ejemplo, la bienvenida) usa el prefijo `UX-XXX` con la misma plantilla y explica en la spec a qué RF da entrada.
- Base: [`_template.md`](_template.md).
- La tabla de ejemplos es la fuente de las pruebas: cada fila se convierte en al menos una prueba.
- Valores de negocio sin confirmar se marcan `⚠️ provisional` y generan una pregunta al PO.

## Índice
| Spec | RF | Módulo | Sprint | Estado |
|---|---|---|---|---|
| [RF-019 Cotización de tarifa](RF-019-cotizacion-tarifa.md) | RF-019, RF-018 (cálculo) | `Pricing` | 0 | Implementada |
| [UX-001 Pantalla de bienvenida](UX-001-pantalla-de-bienvenida.md) | — (transversal, solo mobile) | `Onboarding` | 1 | Implementada |
| [RF-004 Perfil de mascota](RF-004-perfil-de-mascota.md) | RF-004, RNF-003 | `Pets` | 3 (adelantado) | Implementada |
| [RF-007 Solicitud de paseo — dueño](RF-007-solicitud-de-paseo-dueno.md) | RF-007 (slice dueño) | `Walks` | 3 | Implementada |
| [RF-007 Solicitud de paseo — paseador](RF-007-solicitud-de-paseo-paseador.md) | RF-007 (slice paseador) | `Walks` | 3 | Implementada |
| [RF-008 Paseo en vivo](RF-008-paseo-en-vivo.md) | RF-008, RF-011 | `Tracking` | 5 (adelantado) | Implementada |
| [RF-012 Alerta de emergencia](RF-012-alerta-de-emergencia.md) | RF-012 (sin push) | `Tracking` | 6 (adelantado) | Implementada |
| [RF-013 Chat del paseo](RF-013-chat-del-paseo.md) | RF-013 | `Messaging` | 8 (adelantado) | Implementada |
| [RF-009 + RF-010 Alertas automáticas](RF-009-RF-010-alertas-automaticas.md) | RF-009, RF-010 | `Tracking` | 6 (adelantado) | Implementada |
| [RF-006 Matching por cercanía](RF-006-matching-por-cercania.md) | RF-006 | `Walks` | 4 | Implementada |
| [RF-002 + RF-003 Paseadores verificados](RF-002-RF-003-paseadores-verificados.md) | RF-002, RF-003 (verificación manual) | `Identity` | 2 | Implementada |
| [RF-001 + RF-005 Identidad y login](RF-001-RF-005-identidad-y-login.md) | RF-001, RF-005, RNF-001, RNF-002 | `Identity` | 1 | Lista |
| [RF-015 – RF-018 Pagos con escrow](RF-015-RF-018-pagos-con-escrow.md) | RF-015 – RF-018 (pasarela simulada) | `Payments` | 7 (adelantado) | Implementada |
| [RF-014 Notificaciones del recorrido](RF-014-notificaciones-del-recorrido.md) | RF-014 (en la app, sin push) | `Messaging` | 6 | Implementada |
| [RF-001 + RF-005 Perfil de usuario](RF-001-RF-005-perfil-de-usuario.md) | RF-001, RF-005 | `Identity` | por asignar | Borrador |
| [RF-002 + RF-003 Panel de administración](RF-002-RF-003-panel-de-administracion.md) | RF-002, RF-003, RF-012 | `Walkers` | por asignar | Borrador |
