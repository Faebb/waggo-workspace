# 07 — Especificación por pantalla

Formato: **Objetivo** · **Jerarquía** (de arriba abajo) · **Componentes** · **Copy** · **Estados** (C = carga, V = vacío, E = error, P = sin permiso, O = sin conexión) · **A11y**. Los números de pantalla son los de `06`. Los valores marcados ⚠️ vienen de specs donde ya son provisionales; no se inventó ninguno nuevo.

Reglas comunes a todas: título con rol `header`; acción principal en `ActionFooter` o en el sheet; errores de la API se muestran con su `message` en español tal como llega; sin conexión = banner `warning` arriba "Sin conexión. Mostramos lo último que recibimos." y acciones que escriben deshabilitadas; objetivo táctil ≥ 44; soporta texto hasta 200 %.

---

## Comunes

### 1 · Bienvenida (UX-001)
- **Objetivo**: entender la propuesta en segundos y elegir rol.
- **Jerarquía**: logo completo (corgi + rótulo "Waggo", ver [08](08-marca.md); en oscuro, sobre la medalla crema) → antetítulo → titular "Paseos **seguros** para tu perro" → apoyo → 3 pilares (ícono + título + frase) → "Pedir un paseo" (primario) → "Quiero ser paseador" (secundario) → "Ya tengo cuenta · Iniciar sesión".
- **Copy**: pilares "Paseadores verificados / Paseo en vivo / Pagas al final" (los de UX-001, con frase de apoyo nueva).
- **Estados**: claro/oscuro. Con sesión activa se salta a la pestaña Inicio del rol.
- **A11y**: el titular se lee entero ("Paseos seguros para tu perro"), no partido en tres textos; los íconos de pilares son decorativos; el logo lleva etiqueta "Waggo" y no se repite como texto.

### 2 · Iniciar sesión
- **Jerarquía**: atrás → título y apoyo → banner de error (si hay) → Google / Microsoft → "o con tu correo" → Correo, Contraseña (Mostrar) → "¿Olvidaste tu contraseña?" → pie: "Entrar" + "¿No tienes cuenta? Crear cuenta".
- **Copy de errores** (de la spec): "Correo o contraseña incorrectos." · "Confirma tu correo antes de iniciar sesión." · "Demasiados intentos, espera 15 minutos." (se muestra con cuenta regresiva) · "No pudimos validar tu cuenta de Google/Microsoft, intenta de nuevo." · "Tu sesión expiró, inicia sesión de nuevo."
- **Estados**: por defecto, error, bloqueado (botón deshabilitado + temporizador), sin confirmar (con "Reenviar enlace": `nueva — requiere spec`, no hay endpoint), error del proveedor, sesión expirada, entrando (spinner). O: "Entrar" deshabilitado.
- **A11y**: el banner de error recibe el foco y se anuncia; los botones sociales dicen "Continuar con Google"; los logos de Google y Microsoft deben ser los oficiales (los del SVG son marcadores).
- **Nota**: "¿Olvidaste tu contraseña?" lleva a la pantalla 5 (`nueva — requiere spec`).

### 3 · Crear cuenta
- **Jerarquía**: igual a login; debajo de la contraseña, **lista de reglas en vivo** (8 caracteres, una mayúscula, un número ⚠️ provisional) con check verde; texto legal.
- **Estados**: escribiendo (botón deshabilitado hasta cumplir reglas), correo ya registrado ("Ese correo ya tiene una cuenta. ¿Olvidaste tu contraseña?"), enviando.
- **A11y**: cada regla anuncia "cumplida / pendiente"; no depender solo del color verde.

### 4 · Confirmar correo
- **Estados**: enviado ("Te enviamos un enlace a …; vence en 24 horas" ⚠️), confirmada, vencido (`Identity.ConfirmationTokenExpired`), inválido o usado (`Identity.ConfirmationTokenInvalid`). "Enviar un enlace nuevo": `nueva — requiere spec`.

### 6 · Cotizador público (RF-019)
- Chips de tipo y duración; tarjeta con total grande, "Para el paseador" y "Comisión de Waggo". C: esqueleto de la tarjeta. E: banner con "Intentar de nuevo". Pie: "Pedir este paseo" (lleva a login si no hay sesión).

### 20 · Chat del paseo (RF-013)
- **Jerarquía**: atrás + avatar del otro (con insignia de verificado si es paseador) + estado del paseo → mensajes con separadores de sistema ("Paseo iniciado · 3:10 p. m.") → compositor.
- **Componentes**: `MessageBubble` (propias `primary` a la derecha, ajenas `surface` a la izquierda, hora dentro), `Composer`.
- **Estados**: activa; V: "Coordina la recogida" + respuestas rápidas (mejora); no enviado: burbuja atenuada + "No se envió. Toca para reintentar."; solo lectura (paseo terminado o cancelado): el compositor se reemplaza por "El paseo terminó. El chat queda solo para leer."; E de carga: banner con reintento; O: compositor deshabilitado.
- **A11y**: cada burbuja se lee "Bruno, 3:02 p. m.: …"; los mensajes nuevos se anuncian con región *polite*.

### 21 · Emergencia (RF-012)
- **Confirmar** (hoja sobre el mapa, fondo con `scrim`): ícono de alerta, "¿Es una emergencia?", "Avisaremos de inmediato a [nombre] con tu ubicación actual.", tipo (Se soltó / Se lastimó / Otro: precarga el `message`), mensaje opcional (≤ 500), "Sí, es una emergencia" (`danger`) y "No, volver".
- **Enviada**: banner rojo fijo arriba (no se puede cerrar mientras dure el paseo), marcador de alerta en el mapa, "Mantén la calma", "Escribir a …", "Llamar al 123" (⚠️ el PO confirma si se muestra la línea pública de emergencias de Colombia).
- **Recibida**: igual, con "Bruno reportó una emergencia" y anuncio asertivo + vibración.
- **E**: si falla el envío, el botón queda en "Reintentar" y el banner dice "No pudimos enviar la alerta. Llama al 123 si es urgente." La ubicación se envía si el teléfono la tiene, sin esperar al GPS (como hoy).
- **A11y**: el botón SOS se anuncia "Emergencia"; la etiqueta del botón rojo usa `dangerText` (ver `03`).

### 22 · Avisos (RF-014)
- Lista agrupada por día (Hoy, Ayer); fila con ícono, título, detalle y punto de no leído; las urgentes con fondo rojo suave, ícono de alerta y la palabra "URGENTE" (no solo color). Al abrir, todo queda leído (comportamiento actual). Pie: "Mostramos los últimos 50 avisos." ⚠️
- **Estados**: con urgentes, V ("No tienes avisos…"), E ("No pudimos cargar tus avisos" + reintentar).
- **A11y**: el contador de la campana se anuncia "Avisos, 2 sin leer".

### 23–25 · Configuración, Cuenta y seguridad, Información personal
- **Configuración**: tarjeta de perfil → Tu cuenta (Información personal, Cuenta y seguridad) → Preferencias (Tema con selector Claro/Oscuro, Notificaciones) → Ayuda (Centro de ayuda `nueva — requiere spec`, Términos y privacidad) → "Cerrar sesión".
- **Cuenta y seguridad** (spec en Borrador): correo y contraseña con "Cambiar"; métodos para entrar con "Vincular/Desvincular" (desvincular deshabilitado si es el último método ⚠️ pregunta del PO); bloque Paseador ("No eres paseador" o "Paseador verificado"); "Eliminar mi cuenta" en rojo.
- **Eliminar cuenta**: hoja con escritura de "ELIMINAR" para habilitar el botón (⚠️ borrado real o desactivación: pregunta abierta).
- **A11y**: el selector de tema es un `radiogroup`.

## Dueño

### 7 · Inicio del dueño
- **Jerarquía**: saludo + campana → (si hay paseo activo) **tarjeta del paseo** con mini mapa, estado, "Luna con Bruno C.", métricas y "Ver en vivo" → tarjeta principal "¿Quién sale a pasear hoy?" → Próximos → pestañas.
- **Estados**: primer uso sin perros (tarjeta "Primero, cuéntanos de tu perro" + "Agregar mi perro" + cómo funciona), con paseo en curso, C (esqueletos), E (banner en lugar de la tarjeta del paseo, el resto usable).
- **A11y**: el mini mapa es decorativo (la info está en texto); la tarjeta entera es un botón "Ver paseo en vivo de Luna".

### 8–10 · Mis perros, Agregar perro, Detalle
- **Mis perros**: tarjetas con avatar, nombre, "Raza · Tamaño · Peso", indicador "Notas médicas privadas"; contador "2 de 10 perros" ⚠️. V: "Aún no tienes perros" + "Agregar mi primer perro". E: reintentar.
- **Agregar**: Nombre, Tamaño (chips con rango de peso, de RF-004), Raza, Nacimiento (selector nativo), Peso, Notas médicas ("Se guardan cifradas. Hoy solo tú las ves."). Errores por campo con el mensaje de la API (`Pets.InvalidName`, `Pets.InvalidWeight`, `Pets.InvalidBirthDate`). Límite: banner `warning` y botón deshabilitado (`Pets.LimitReached`).
- **Detalle**: avatar, datos, tarjeta de notas médicas con candado, "Pedir paseo con Luna" (preselecciona al perro). Editar y foto: fuera de alcance (pregunta abierta RF-004).

### 11 · Pedir paseo 1 · ¿Dónde?
- **Jerarquía**: barra de búsqueda flotante (atrás + "¿Dónde recogemos a tus perros?") + "Paso 1 de 3" → mapa a pantalla completa con **pin fijo al centro** y mi ubicación → botón recentrar → sheet con "Recogida", dirección (geocodificación inversa), ayuda "Mueve el mapa para ajustar el punto exacto." y "Confirmar recogida".
- **Búsqueda**: lista con "Usar mi ubicación actual", sugerencias (dirección + barrio), recientes, "Elegir en el mapa" y atribución del proveedor de búsqueda.
- **Estados**: con permiso; moviendo pin (pin levantado, dirección en esqueleto, botón deshabilitado); P denegado (banner + "Abrir Ajustes"; el mapa abre en la última dirección usada o en el centro de la ciudad); precisión aproximada (halo grande + banner); E geocodificación ("No encontramos esa dirección. Prueba con calle y número."); mapa no carga (campo de dirección de texto como hoy, sin mapa); O (búsqueda deshabilitada, se puede usar la dirección reciente).
- **Datos**: produce `pickupAddress`, `latitude`, `longitude` del contrato actual de RF-007 (sin cambios de API).
- **A11y**: alternativa al gesto: el campo de búsqueda; el pin anuncia la dirección al soltar.

### 12 · Pedir paseo 2 · ¿Quién y cuánto?
- Perros (chips con avatar, hasta 3 ⚠️), Tipo, Duración (30–120 cada 15 ⚠️), ¿Cuándo? (Ahora, En 1 hora, Mañana 8:00, Mañana 17:00 — los de hoy — y "Otra fecha", hasta 14 días ⚠️), Indicaciones (≤ 500). Pie con total en vivo (cotización RF-019) y "Continuar".
- **Estados**: sin perros (tarjeta "Agrega a tu perro para pedir"), E de cotización (total "—" + "No pudimos calcular el precio. Reintentar."), errores de la API (`Walks.InvalidPets`, `Walks.InvalidSchedule`) vuelven a este paso con el campo marcado.

### 13 · Pedir paseo 3 · Confirmar y pagar
- Mini mapa de la recogida, resumen, tarjeta de pago (total, "Incluye la comisión de Waggo", método de pago con "Cambiar"), nota de escrow con escudo, pie "Pedir paseo · $ 23.000".
- **Estados**: pidiendo (spinner, todo bloqueado), pago rechazado (`Payments.Declined`: banner + "Intentar de nuevo"; el paseo no existe), O (botón deshabilitado).
- **Nota**: el método de pago "Visa •••• 4242" es un marcador: el registro de tarjetas depende de la pasarela (⚠️ pregunta abierta RF-015).

### 14 · Buscando paseador
- Mapa centrado en la recogida con pulso; sheet: "Buscando paseador" (pulsante) + tiempo transcurrido, "Te avisamos apenas alguien acepte.", barra indeterminada, resumen con "Retenido", "Cancelar paseo".
- **Estados**: buscando; confirmar cancelación (hoja: "Liberamos los $ 23.000 retenidos"); **nadie aceptó** tras X min (`nueva — requiere spec`, pregunta abierta de RF-007; "15 minutos" es solo el ejemplo del SVG); E de refresco (banner, sigue mostrando el último estado).
- **A11y**: el cambio a "Aceptado" se anuncia.

### 15 · Paseo aceptado
- Mapa con la recogida; sheet: "Aceptado", "Bruno va en camino", **tarjeta del paseador** (avatar, nombre, "Paseador verificado" con escudo `secondary`, botón de chat), resumen de pago; expandido: detalle completo, "Cancelar paseo" y "Cancelar es gratis hasta que el paseo empiece." (regla actual ⚠️). SOS visible (la emergencia se permite en `Accepted`).
- **Nota**: la posición del paseador antes de iniciar **no existe** en la API (el rastreo empieza en `InProgress`). Mostrarla con ETA es `nueva — requiere spec`.

### 16 · Paseo en vivo
- **Jerarquía**: barra superior flotante → mapa (zona acordada, recorrido, recogida, paseador con perro y rumbo, etiqueta "Hace 10 s") → recentrar + SOS → atribución → sheet.
- **Sheet colapsado**: estado + "1,2 km · 24 de 60 min" + chat. **Medio**: título, métricas (Distancia, Tiempo, Termina), barra de progreso, Mensajes, Detalles. **Expandido**: tarjeta del paseador, detalle, pago, alertas del paseo, "Reportar una emergencia".
- **Estados**: los tres del sheet; señal perdida (marcador gris, "Última posición hace 3 min", banner `info`); mapa no carga (fondo neutro, "Reintentar", toda la info en el sheet); oscuro; O (banner, datos en caché con su hora).
- **Rendimiento**: refresco cada 5 s (hoy); el marcador se interpola 1 s; con la app en segundo plano se pausa el refresco.
- **A11y**: el mapa tiene etiqueta resumen ("Bruno y Luna a 600 m de la recogida, actualizado hace 10 s") y la lista de métricas es la alternativa.

### 17 · Alertas automáticas
- **Salió de la zona** (prioridad alta, rojo): mapa alejado con la geocerca en rojo, rombo en el punto de salida, banner fijo "El paseo salió de la zona acordada · a 1,8 km · hace 1 min"; sheet "¿Todo bien con Luna?", "Escribir a Bruno", "Reportar una emergencia".
- **Detenido 10 min** (ámbar ⚠️ umbral provisional): banner "Puede ser una pausa para jugar…", reloj en el mapa.
- Al volver a la zona o retomar el paso, el banner baja a una fila en "Alertas del paseo" del sheet (no desaparece sin rastro).

### 18 · Resumen
- Mapa con la ruta completa; "Luna volvió a casa"; distancia, duración, hora de recogida y de entrega (prueba de servicio, patrón de Fetch!); "Pagado · $ 23.000"; tarjeta "Califica a Bruno" (`nueva — requiere spec`); "Pedir otro paseo".
- **Cancelado**: "Liberado: no se cobró…", detalle, "Pedir de nuevo".
- **Pregunta abierta**: ¿cuánto tiempo se guarda la ruta? (RF-008).

### 19 · Mis paseos
- Secciones En curso (tarjeta destacada), Programados, Historial (estado con color + palabra). V: "Aún no has pedido paseos" + "Pedir un paseo". E: reintentar.

## Paseador

### 26–27 · Hazte paseador y verificación
- **Formulario**: Nombre, Tipo de documento (Cédula, Cédula de extranjería, Pasaporte), Número (con nota de cifrado y últimos 4 dígitos), Celular, Experiencia (≤ 500, contador). Errores por campo con los códigos `Walkers.InvalidFullName / InvalidDocument / InvalidPhone`. Ya registrado (`Walkers.AlreadyRegistered`) → va directo a Verificación.
- **Verificando**: línea de tiempo de tres pasos, resumen de datos (documento enmascarado), "Revisar de nuevo" (hoy se sondea cada 30 s). **Rechazado**: motivo + "Escribir a soporte" (canal `nueva — requiere spec`; reintento = pregunta abierta). **Aprobado**: próximos pasos + "Ver solicitudes".

### 28 · Solicitudes cerca
- Barra "Modo paseador · Disponible" (el estado Disponible es `nueva — requiere spec`; hoy no existe) → mapa con mi ubicación, **píldoras de precio** por solicitud y grupos → sheet sobre las pestañas con tarjetas: "Ganas $ 18.400", "Individual · 60 min · 1 perro", "Chapinero · a 1,2 km · Hoy 3:30 p. m.", "Aceptar".
- **Estados**: sin ubicación (orden por hora, sin distancias, banner "Comparte tu ubicación"), V ("No hay solicitudes cerca por ahora", radio 5 km ⚠️), tomada por otro (409: banner + tarjeta "Ya no disponible"), no verificado (403 `Walkers.NotVerified` → pantalla 27), O (tarjetas atenuadas, "Aceptar" deshabilitado).
- **Privacidad**: antes de aceptar se muestra zona y no la dirección exacta en la tarjeta (⚠️ pregunta abierta RF-007); el pin del mapa se dibuja en el centro de la cuadra.

### 29 · Paseo aceptado (paseador)
- Mapa con ruta pendiente (discontinua) desde mi ubicación a la recogida, "A 6 min · 450 m" (ETA calculada en el teléfono: `nueva — requiere spec` y costo de *directions* según proveedor); sheet: "Recoge a Luna", dirección exacta + "Abrir en Maps" (abre Google Maps / Apple Maps, sin costo para Waggo), indicaciones, perro, chat, "Iniciar paseo" + ayuda.
- **Dueño canceló**: banner, estado "Cancelado", "Ver otras solicitudes".

### 30 · Paseo en curso (paseador)
- Mapa siguiendo mi posición, recorrido, zona acordada, recogida; chip "Compartiendo cada 15 s" ⚠️; sheet: cronómetro, distancia, progreso, chat, "Terminar paseo".
- **Estados**: permiso solo "mientras se usa" (banner fijo con "Abrir Ajustes"), sin señal ("Guardamos 3 posiciones…", tramo sin enviar en gris punteado), confirmar terminar (hoja + aviso si está a más de X m de la recogida: `nueva — requiere spec`), alerta automática (mismo banner que el dueño, en primera persona).

### 31–33 · Terminado, Ganancias, Tus paseos
- **Terminado**: "¡Paseo terminado!", "Ganaste $ 18.400", "Pagado a tu cuenta", métricas, "Ver más solicitudes".
- **Ganancias** (pestaña propuesta): tarjeta con total y número de paseos, lista con "Pagado", aviso "Pronto podrás registrar la cuenta donde te llega el dinero" (⚠️ pregunta abierta RF-015). V: "Aún no tienes ganancias".
- **Tus paseos** (pestaña propuesta): Hoy, Próximos, Historial con estado.

## Administración

### 35 · Verificación de paseadores
- Antetítulo "Administración", selector Paseadores / Operación, tarjetas con nombre, hace cuánto se envió, documento enmascarado con botón "ver" (el admin debe poder verificar; registrar cada vez que se muestra es `nueva — requiere spec`), celular, experiencia, "Rechazar" y "Aprobar".
- **Estados**: pendientes, rechazar (hoja con motivo, "Confirmar rechazo" deshabilitado hasta 5 caracteres ⚠️), aprobado (toast), V ("No hay paseadores por verificar."), E ("No pudimos cargar los paseadores pendientes."). Copys de la spec del panel.

### 36 · Operación (slices 2–3)
- Teléfono: mapa de la ciudad con paseadores activos y grupos, alertas como rombos; sheet con "Emergencias activas" (tarjeta roja con "Ver paseo") y "Alertas automáticas"; pestaña "En curso" con la lista de paseos y su última señal.
- Tablet/web (1024×768): lista a la izquierda (360 px) y mapa a la derecha.
- Depende de un endpoint global que no existe (spec del panel).
