---
name: sync-docs
description: Sincroniza el vault de Obsidian de Waggo, las specs y los README de projects/ con el estado real de los repos. Úsalo después de implementar algo, al cerrar un sprint o cuando sospeches que la documentación está desactualizada.
shell: powershell
---

## Últimos commits
!`git -C ../waggo-api log --oneline -10; git -C ../waggo-mobile log --oneline -10`

## Instrucciones
1. Ejecuta `scripts/sync-readmes.ps1` para copiar los README de los repos a `projects/`. Muestra qué archivos cambiaron.
2. Delega en `docs-keeper`: *"Sincroniza el vault y las specs con el estado actual de waggo-api y waggo-mobile. Commits recientes arriba."*
3. Presenta en español:
   - notas del vault modificadas;
   - specs cuyo estado cambió;
   - desviaciones entre código y documentación que requieren decisión (no las resuelvas sin preguntar).
