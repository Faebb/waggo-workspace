---
name: tdd
description: Ejecuta ciclos TDD (Red → Green → Refactor) en waggo-api o waggo-mobile para un comportamiento puntual, un bug o un paso de una spec, con agentes separados para pruebas, implementación y verificación. Úsalo para cambios pequeños que no justifican una spec completa, o para corregir un bug empezando por la prueba que lo reproduce.
argument-hint: <api|mobile> "<comportamiento o bug>" [specs/RF-XXX-*.md]
arguments: [repo, behavior]
---

Ciclo TDD en **waggo-$repo** para: **$behavior**

Argumentos completos: `$ARGUMENTS`

1. Si hay una spec en los argumentos, léela y toma de ahí las filas de ejemplo que aplican. Si no hay spec, redacta con el usuario una tabla corta de ejemplos (entrada → resultado esperado) y **confírmala antes de seguir**. Para un bug, la primera fila es el caso que hoy falla.
2. Revisa `git -C ../waggo-$repo status --short` y la rama actual. Si está en `main`, propón una rama `fix/…` o `feat/…`.
3. Pregunta si se quieren commits locales por fase.
4. Delega en `tdd-orchestrator`:
   > Repo: waggo-$repo. Comportamiento: $behavior. Ejemplos: <tabla>. Commits por fase: <sí/no>. Plan outside-in reducido: solo los pasos necesarios para este comportamiento.
5. Muestra la tabla de ciclos que devuelve el orquestador y el título propuesto del PR (`fix(<modulo>): …` o `feat(<modulo>): …`).
