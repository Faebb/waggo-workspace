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
- Base: [`_template.md`](_template.md).
- La tabla de ejemplos es la fuente de las pruebas: cada fila se convierte en al menos una prueba.
- Valores de negocio sin confirmar se marcan `⚠️ provisional` y generan una pregunta al PO.

## Índice
| Spec | RF | Módulo | Sprint | Estado |
|---|---|---|---|---|
| [RF-019 Cotización de tarifa](RF-019-cotizacion-tarifa.md) | RF-019, RF-018 (cálculo) | `Pricing` | 0 | Implementada |
