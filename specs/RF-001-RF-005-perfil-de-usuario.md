---
rf: RF-001, RF-005
titulo: Perfil de usuario — ver y editar la cuenta
estado: Borrador
modulo: Identity
sprint: por asignar
prioridad: Media
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-26
---

# RF-001 + RF-005 — Perfil de usuario

> Vault: [[Backlog - Perfil de usuario y panel de administración]] (contexto y por qué) · Decisión: [[ADR-016 Identidad propia con bcrypt y JWT emitido por la API|ADR-016]], [[ADR-017 Login sin 2FA obligatorio y federación OAuth con Google y Microsoft|ADR-017]]
> Extiende: `RF-001-RF-005-identidad-y-login.md`. Sin tabla de ejemplos ni contrato todavía — es un `Borrador` para que el PO priorice antes de refinarla con `/new-spec`.

> [!warning] Desviación: ya hay código para una parte de esto (2026-10-26)
> `waggo-api` (PR #20) y `waggo-mobile` (PR #20/#21) ya implementaron "ver y editar nombre completo y celular" (`GET/PUT /api/v1/users/me`, pantalla "Información personal" dentro de Configuración) **sin que esta spec pasara por `Lista`** (tabla de ejemplos, contrato de API y preguntas resueltas por el PO), saltándose el flujo spec → TDD → docs descrito en `waggo-workspace/CLAUDE.md`. El resto del alcance (correo, contraseña, proveedores vinculados, estado de paseador verificado, eliminar cuenta) sigue sin implementar. No se cambia el estado a `Implementada` ni se redacta aquí el contrato retroactivo — se deja como hallazgo para que el PO/equipo decida si se formaliza esta porción como spec `Lista` separada o se sigue así. Detalle de archivos en [[Estado de implementación]]#Perfil de usuario (nombre y celular).

## Historia de usuario
Como **dueño o paseador** quiero **ver y controlar los datos de mi cuenta** para **saber qué información tiene Waggo de mí y poder cambiarla o cerrarla cuando quiera**.

## Qué se quiere (sin refinar aún)
- Ver el correo de la cuenta (cambiarlo ya está implementado: `RF-001-RF-005-recuperacion-y-seguridad-de-cuenta.md`, slice D).
- ~~Cambiar contraseña~~ — implementado, ver `RF-001-RF-005-recuperacion-y-seguridad-de-cuenta.md` (slice C).
- Ver qué proveedores de login tiene vinculados (correo siempre; Google/Microsoft cuando exista `RF-001-RF-005-login-social-google-microsoft.md`) y poder desvincular uno si queda al menos otro método activo.
- Ver si es un paseador verificado (hoy `WalkerGate` lo sabe pero no se muestra en ningún otro lugar de la app).
- ~~Cerrar sesión~~ — implementado, ver `RF-001-RF-005-recuperacion-y-seguridad-de-cuenta.md` (slice B).
- Eliminar la cuenta.

## Preguntas abiertas para el PO
- [ ] ¿Eliminar cuenta es borrado real o desactivación (soft delete)? Afecta paseos, pagos y mascotas históricos.
- [ ] ¿Cambiar el correo requiere reconfirmación (como el registro) o es inmediato?
- [ ] ¿Desvincular un proveedor social exige que quede al menos un método de entrada activo?

## Trazabilidad
Se completa al implementar.
