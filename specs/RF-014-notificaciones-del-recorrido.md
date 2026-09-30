---
rf: RF-014
titulo: Notificaciones del recorrido (bandeja en la app; push después)
estado: En progreso
modulo: Messaging
sprint: 6
prioridad: Alta
repos: [waggo-api, waggo-mobile]
actualizado: 2026-09-30
---

# RF-014 — Notificaciones del recorrido

> Vault: `01 Proyecto/Requerimientos funcionales.md` (RF-014, y el aviso prioritario de RF-009, RF-010 y RF-012), RNF-008 (outbox) · Roadmap: sprint 6

Como en Uber, cada momento del paseo avisa a la otra parte: el paseo fue aceptado, empezó, terminó o se canceló, el paseador recibió su pago, y hubo una emergencia o una alerta automática. Cada aviso queda guardado como **notificación** del usuario. La app muestra cuántas hay sin leer y una bandeja con todas. Las emergencias y alertas son de **prioridad alta**.

> [!note] Decisiones asumidas por el desarrollador
> - **Entrega en la app primero**. El envío *push* (Expo Push / FCM / APNs) necesita un build de desarrollo, un proyecto EAS y los tokens de cada teléfono. Queda para un slice propio. La tabla de notificaciones ya sirve de *outbox* (RNF-008): el push enviará las que falten.
> - Los mensajes del chat (RF-013) **no** generan notificación por ahora, para no llenar la bandeja. Pregunta para el PO.
> - La bandeja muestra las 50 más recientes. "Marcar como leídas" marca todas.

## Historias de usuario
- Como **dueño** quiero **enterarme cuando aceptan, empiezan o terminan el paseo, y de cualquier alerta** para **estar tranquilo sin mirar la app todo el tiempo**.
- Como **paseador** quiero **saber si el dueño canceló, si hay una emergencia y cuándo me pagaron** para **no perder tiempo ni dinero**.

## Criterios de aceptación
- [ ] Se crean notificaciones en estos momentos:

  | Momento | Para | Prioridad |
  |---|---|---|
  | Aceptado | dueño | normal |
  | Iniciado | dueño | normal |
  | Terminado | dueño | normal |
  | Pagado | paseador | normal |
  | Cancelado, si ya había paseador | paseador | normal |
  | Emergencia | la otra parte | alta |
  | Salida de zona y detención | dueño | alta |
- [ ] Cada usuario ve solo sus notificaciones, la más reciente primero, con cuántas no ha leído.
- [ ] El usuario marca todas como leídas.
- [ ] La app muestra el contador en el inicio del dueño y del paseador, abre la bandeja y desde una notificación va al paseo.

## Tabla de ejemplos
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | Paseador acepta el paseo | Dueño: `GET /notifications` → `unreadCount: 1`, `kind: WalkAccepted`, "Tu paseo fue aceptado" | Feliz |
| 2 | Paseador inicia y termina | Dueño: `WalkStarted` y `WalkFinished`; paseador: `WalkPaid` | Feliz |
| 3 | Dueño cancela un paseo aceptado | Paseador: `WalkCancelled` | Feliz |
| 4 | Dueño cancela un paseo sin paseador | Nadie recibe notificación | Borde |
| 5 | Paseador reporta emergencia | Dueño: `Emergency`, `priority: High` | Feliz |
| 6 | El recorrido sale de la zona | Dueño: `Geofence`, `priority: High` | Feliz |
| 7 | `POST /notifications/read` | `unreadCount: 0`, cada una con `readAt` | Feliz |
| 8 | Otro usuario consulta | No ve las notificaciones ajenas | Autorización |

## Reglas de negocio
| Regla | Valor | Origen |
|---|---|---|
| Notificaciones en la bandeja | Las 50 más recientes | ⚠️ provisional |
| Prioridad alta | Emergencia, salida de zona, detención | RF-009, RF-010, RF-012 |
| Actualización en la app | Cada 15 s | ⚠️ provisional (hasta el push) |

## Diseño
- **Domain**: `Entities/Notifications/Notification` (`ForWalk`, `MarkRead`) con título y texto en español por tipo; `Enums/Notifications/{NotificationKind, NotificationPriority}`.
- **Application**: `INotificationRepository`. `AcceptWalk`, `StartWalk`, `FinishWalk`, `CancelWalk`, `RaiseEmergency` y `RecordTrack` crean la notificación después de guardar. `Notifications/Queries/ListMyNotifications` y `Notifications/Commands/MarkNotificationsRead` devuelven `NotificationsResponse(unreadCount, items)`.
- **Infrastructure**: `messaging.notifications` (índice por usuario y fecha), migración `AddNotifications`.
- **Api**: `GET /api/v1/notifications`, `POST /api/v1/notifications/read`.
- **Mobile**: `features/notifications` — `NotificationBell` (botón con el número sin leer) en los dos inicios, `NotificationsScreen` en `/notificaciones` y `/paseador/notificaciones`. Al abrir la bandeja se marcan como leídas.

## Preguntas abiertas para el PO
- [ ] ¿Los mensajes del chat deben notificar?
- [ ] Proveedor de push: Expo Push (simple, gratis) o FCM/APNs directo.
- [ ] ¿Cuánto tiempo se guardan las notificaciones?

## Trazabilidad
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-api | _se completa al cerrar_ | |
| waggo-mobile | _se completa al cerrar_ | |
