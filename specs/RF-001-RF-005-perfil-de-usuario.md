---
rf: RF-001, RF-005
titulo: Perfil de usuario — ver y editar la cuenta
estado: Borrador
modulo: Identity
sprint: por asignar
prioridad: Media
repos: [waggo-api, waggo-mobile]
actualizado: 2026-10-25
---

# RF-001 + RF-005 — Perfil de usuario

> Vault: [[Backlog - Perfil de usuario y panel de administración]] (contexto y por qué) · Decisión: [[ADR-016 Identidad propia con bcrypt y JWT emitido por la API|ADR-016]], [[ADR-017 Login sin 2FA obligatorio y federación OAuth con Google y Microsoft|ADR-017]]
> Extiende: `RF-001-RF-005-identidad-y-login.md`. Sin tabla de ejemplos ni contrato todavía — es un `Borrador` para que el PO priorice antes de refinarla con `/new-spec`.

## Historia de usuario
Como **dueño o paseador** quiero **ver y controlar los datos de mi cuenta** para **saber qué información tiene Waggo de mí y poder cambiarla o cerrarla cuando quiera**.

## Qué se quiere (sin refinar aún)
- Ver y editar el correo de la cuenta.
- Cambiar contraseña (reutiliza `PasswordPolicy`, ya existente en la recuperación de contraseña).
- Ver qué proveedores de login tiene vinculados (correo siempre; Google/Microsoft cuando exista `RF-001-RF-005-login-social-google-microsoft.md`) y poder desvincular uno si queda al menos otro método activo.
- Ver si es un paseador verificado (hoy `WalkerGate` lo sabe pero no se muestra en ningún otro lugar de la app).
- Cerrar sesión.
- Eliminar la cuenta.

## Preguntas abiertas para el PO
- [ ] ¿Eliminar cuenta es borrado real o desactivación (soft delete)? Afecta paseos, pagos y mascotas históricos.
- [ ] ¿Cambiar el correo requiere reconfirmación (como el registro) o es inmediato?
- [ ] ¿Desvincular un proveedor social exige que quede al menos un método de entrada activo?

## Trazabilidad
Se completa al implementar.
