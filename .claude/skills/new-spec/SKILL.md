---
name: new-spec
description: Crea la especificación de un requerimiento de Waggo (RF-XXX) en specs/ a partir del vault, con tabla de ejemplos, contrato de API y plan TDD. Úsalo cuando se vaya a empezar un RF nuevo.
argument-hint: RF-XXX [slice opcional]
arguments: [rf]
---

Crea la spec de **$rf** (argumentos completos: `$ARGUMENTS`).

1. Si ya existe `specs/$rf-*.md`, no la sobrescribas: muéstrala y pregunta si se quiere un slice nuevo o editar la existente.
2. Delega en el subagente `requirements-analyst` con este encargo: *"Crea la spec de $rf siguiendo `specs/_template.md`. Argumentos: $ARGUMENTS"*.
3. Cuando termine, revisa que la spec tenga:
   - frontmatter con `rf`, `estado: Borrador`, `modulo`, `sprint`;
   - al menos un caso feliz, un límite y un error en la tabla de ejemplos;
   - contrato con códigos de error `<Modulo>.<Error>`;
   - plan TDD para backend y mobile;
   - preguntas abiertas para el PO (si las hay).
4. Agrega la spec al índice de `specs/README.md`.
5. Resume en español: ruta de la spec, número de ejemplos y preguntas abiertas. Recuerda que el PO debe aprobarla (estado `Lista`) antes de `/implement-spec`.
