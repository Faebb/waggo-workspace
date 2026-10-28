/* Motor de presentaciones de Waggo (v1). Sin dependencias.
   - Láminas 16:9 de 1920x1080 escaladas al visor.
   - Navegación: flechas, espacio, Re Pág/Av Pág, Inicio/Fin, clic, deslizamiento táctil y puntos de progreso.
   - Pasos dentro de una lámina: elementos con data-paso="n" o data-pasos="N" en la lámina.
   - Notas del orador (tecla N), pantalla completa (F), impresión a PDF (Ctrl+P o ?imprimir).
   - API: window.Motor (ver LEEME.md). Las presentaciones se enganchan con Motor.alCambiar(fn). */
(() => {
  'use strict';

  const ANCHO = 1920;
  const ALTO = 1080;
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (new URLSearchParams(location.search).has('estatico')) document.documentElement.classList.add('estatico');
  const visor = document.querySelector('.visor');
  const lienzo = visor && visor.querySelector('.lienzo');
  if (!visor || !lienzo) {
    console.error('Motor: falta .visor > .lienzo');
    return;
  }
  const laminas = Array.from(lienzo.querySelectorAll(':scope > .lamina'));
  const total = laminas.length;
  const escuchas = [];

  let indice = -1;
  let paso = 0;
  let ultimoToque = 0;
  let temporizadorInactivo = 0;

  const tituloDe = (i) => laminas[i].dataset.titulo || `Lámina ${i + 1}`;

  const pasosDe = (i) => {
    const lamina = laminas[i];
    let max = Number(lamina.dataset.pasos || 0);
    lamina.querySelectorAll('[data-paso]').forEach((el) => {
      max = Math.max(max, Number(el.dataset.paso) || 0);
    });
    return max;
  };

  /* ---------- Escala ---------- */
  function ajustarEscala() {
    const escala = Math.min(window.innerWidth / ANCHO, window.innerHeight / ALTO);
    document.documentElement.style.setProperty('--escala', String(escala));
  }

  /* ---------- Controles ---------- */
  const icono = (trazos) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${trazos}</svg>`;
  const ICONOS = {
    anterior: icono('<path d="M15 5l-7 7 7 7"/>'),
    siguiente: icono('<path d="M9 5l7 7-7 7"/>'),
    notas: icono('<path d="M5 4h14v12H9l-4 4z"/><path d="M9 8h6M9 12h4"/>'),
    pantalla: icono('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  };

  const barra = document.createElement('div');
  barra.className = 'motor-barra';
  barra.setAttribute('role', 'toolbar');
  barra.setAttribute('aria-label', 'Controles de la presentación');
  barra.innerHTML =
    `<button class="motor-btn" type="button" data-accion="anterior" aria-label="Lámina o paso anterior">${ICONOS.anterior}</button>` +
    '<ol class="motor-puntos" aria-label="Láminas"></ol>' +
    '<span class="motor-contador" aria-hidden="true"></span>' +
    `<button class="motor-btn" type="button" data-accion="siguiente" aria-label="Siguiente lámina o paso">${ICONOS.siguiente}</button>` +
    `<button class="motor-btn" type="button" data-accion="notas" aria-pressed="false" aria-label="Notas del orador (tecla N)" title="Notas del orador (N)">${ICONOS.notas}</button>` +
    `<button class="motor-btn" type="button" data-accion="pantalla" aria-label="Pantalla completa (tecla F)" title="Pantalla completa (F)">${ICONOS.pantalla}</button>`;
  document.body.appendChild(barra);

  const lista = barra.querySelector('.motor-puntos');
  const contador = barra.querySelector('.motor-contador');
  const puntos = laminas.map((_, i) => {
    const li = document.createElement('li');
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'motor-punto';
    boton.setAttribute('aria-label', `Ir a la lámina ${i + 1} de ${total}: ${tituloDe(i)}`);
    boton.title = `${i + 1}. ${tituloDe(i)}`;
    boton.addEventListener('click', () => ir(i, 0));
    li.appendChild(boton);
    lista.appendChild(li);
    return boton;
  });

  const panelNotas = document.createElement('section');
  panelNotas.className = 'motor-notas';
  panelNotas.hidden = true;
  panelNotas.setAttribute('aria-label', 'Notas del orador');
  document.body.appendChild(panelNotas);

  const anuncio = document.createElement('div');
  anuncio.className = 'motor-solo-lector';
  anuncio.setAttribute('aria-live', 'polite');
  anuncio.setAttribute('role', 'status');
  document.body.appendChild(anuncio);

  function pintarNotas() {
    const origen = laminas[indice].querySelector(':scope > .notas');
    const siguiente = indice + 1 < total ? `Siguiente: ${tituloDe(indice + 1)}` : 'Última lámina';
    panelNotas.innerHTML =
      `<h2>Lámina ${indice + 1} de ${total} · ${tituloDe(indice)}</h2>` +
      (origen ? origen.innerHTML : '<p>Esta lámina no tiene notas.</p>') +
      `<p class="motor-atajos">${siguiente} · <kbd>←</kbd> <kbd>→</kbd> navegar · <kbd>N</kbd> notas · <kbd>F</kbd> pantalla completa · <kbd>Inicio</kbd> <kbd>Fin</kbd> · Ctrl+P guarda el PDF</p>`;
  }

  /* ---------- Estado ---------- */
  function aplicar(nuevoIndice, nuevoPaso, direccion) {
    const anterior = indice;
    const cambioLamina = nuevoIndice !== indice;
    indice = nuevoIndice;
    paso = nuevoPaso;
    visor.dataset.dir = direccion;

    laminas.forEach((lamina, i) => {
      const activa = i === indice;
      lamina.classList.toggle('activa', activa);
      lamina.setAttribute('aria-hidden', activa ? 'false' : 'true');
      if (activa) lamina.removeAttribute('inert');
      else lamina.setAttribute('inert', '');
      lamina.querySelectorAll('[data-paso]').forEach((el) => {
        // Las láminas ya vistas muestran todo; la actual, hasta el paso en curso; las demás empiezan limpias.
        const visible = i < indice || (i === indice && Number(el.dataset.paso) <= paso);
        el.classList.toggle('paso-visible', visible);
      });
    });

    puntos.forEach((p, i) => {
      if (i === indice) p.setAttribute('aria-current', 'true');
      else p.removeAttribute('aria-current');
      p.dataset.hecho = String(i < indice);
    });
    contador.textContent = `${indice + 1} / ${total}`;
    barra.querySelector('[data-accion="anterior"]').disabled = indice === 0 && paso === 0;
    barra.querySelector('[data-accion="siguiente"]').disabled = indice === total - 1 && paso >= pasosDe(indice);

    if (cambioLamina) {
      anuncio.textContent = `Lámina ${indice + 1} de ${total}: ${tituloDe(indice)}`;
      const activo = puntos[indice];
      if (activo && lista.scrollWidth > lista.clientWidth) activo.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    pintarNotas();

    try {
      history.replaceState(null, '', `#${indice + 1}${paso ? `-${paso}` : ''}`);
    } catch (e) {
      /* file:// en algunos navegadores: se ignora */
    }

    const detalle = {
      indice,
      paso,
      pasos: pasosDe(indice),
      anterior,
      cambioLamina,
      direccion,
      lamina: laminas[indice],
      total,
      reducirMovimiento: reducirMovimiento.matches,
    };
    escuchas.forEach((fn) => fn(detalle));
    document.dispatchEvent(new CustomEvent('motor:cambio', { detail: detalle }));
  }

  function ir(i, p = 0) {
    const destino = Math.max(0, Math.min(total - 1, i));
    const pasoDestino = Math.max(0, Math.min(pasosDe(destino), p));
    if (destino === indice && pasoDestino === paso) return;
    const direccion = destino < indice || (destino === indice && pasoDestino < paso) ? 'atras' : 'adelante';
    aplicar(destino, pasoDestino, direccion);
  }

  function siguiente() {
    if (paso < pasosDe(indice)) ir(indice, paso + 1);
    else if (indice < total - 1) ir(indice + 1, 0);
  }

  function anterior() {
    if (paso > 0) ir(indice, paso - 1);
    else if (indice > 0) ir(indice - 1, pasosDe(indice - 1));
  }

  /* ---------- Notas y pantalla completa ---------- */
  function alternarNotas(forzar) {
    const abrir = typeof forzar === 'boolean' ? forzar : panelNotas.hidden;
    panelNotas.hidden = !abrir;
    barra.querySelector('[data-accion="notas"]').setAttribute('aria-pressed', String(abrir));
  }

  function alternarPantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }

  barra.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const accion = boton.dataset.accion;
    if (accion === 'anterior') anterior();
    else if (accion === 'siguiente') siguiente();
    else if (accion === 'notas') alternarNotas();
    else if (accion === 'pantalla') alternarPantallaCompleta();
  });

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const tecla = e.key;
    let manejada = true;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(tecla)) {
      // Con el foco en un botón, Espacio y Enter lo activan en lugar de avanzar.
      if ((tecla === ' ' || tecla === 'Enter') && e.target.closest && e.target.closest('button, a')) manejada = false;
      else siguiente();
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(tecla)) anterior();
    else if (tecla === 'Home') ir(0, 0);
    else if (tecla === 'End') ir(total - 1, pasosDe(total - 1));
    else if (tecla === 'n' || tecla === 'N') alternarNotas();
    else if (tecla === 'f' || tecla === 'F') alternarPantallaCompleta();
    else if (tecla === 'Escape' && !panelNotas.hidden) alternarNotas(false);
    else manejada = false;
    if (manejada) e.preventDefault();
    despertar();
  });

  /* ---------- Clic y táctil ---------- */
  visor.addEventListener('click', (e) => {
    if (Date.now() - ultimoToque < 450) return;
    if (e.target.closest('a, button, input, textarea, select, summary, [data-no-nav]')) return;
    if (window.getSelection && String(window.getSelection())) return;
    if (e.clientX < window.innerWidth * 0.22 || e.shiftKey) anterior();
    else siguiente();
  });

  let inicioX = 0;
  let inicioY = 0;
  visor.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    inicioX = e.touches[0].clientX;
    inicioY = e.touches[0].clientY;
  }, { passive: true });
  visor.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - inicioX;
    const dy = t.clientY - inicioY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      ultimoToque = Date.now();
      if (dx < 0) siguiente();
      else anterior();
    }
  }, { passive: true });

  /* ---------- Barra que se oculta sola ---------- */
  function despertar() {
    document.body.classList.remove('motor-inactivo');
    clearTimeout(temporizadorInactivo);
    temporizadorInactivo = setTimeout(() => document.body.classList.add('motor-inactivo'), 3500);
  }
  ['pointermove', 'pointerdown', 'touchstart', 'focusin'].forEach((tipo) => document.addEventListener(tipo, despertar, { passive: true }));

  /* ---------- Impresión ---------- */
  function prepararImpresion() {
    document.body.classList.add('imprimiendo');
    laminas.forEach((l) => {
      l.removeAttribute('inert');
      l.setAttribute('aria-hidden', 'false');
      l.classList.add('activa');
    });
    document.dispatchEvent(new CustomEvent('motor:imprimir'));
  }
  function terminarImpresion() {
    if (new URLSearchParams(location.search).has('imprimir')) return;
    document.body.classList.remove('imprimiendo');
    document.dispatchEvent(new CustomEvent('motor:fin-impresion'));
    const i = indice;
    const p = paso;
    indice = -1;
    aplicar(i, p, 'adelante');
  }
  window.addEventListener('beforeprint', prepararImpresion);
  window.addEventListener('afterprint', terminarImpresion);

  /* ---------- Arranque ---------- */
  window.addEventListener('resize', ajustarEscala);
  document.addEventListener('fullscreenchange', ajustarEscala);
  ajustarEscala();

  window.Motor = {
    ir,
    siguiente,
    anterior,
    alCambiar(fn) {
      escuchas.push(fn);
    },
    get indice() { return indice; },
    get paso() { return paso; },
    get total() { return total; },
    get laminas() { return laminas; },
    get reducirMovimiento() { return reducirMovimiento.matches; },
    escala: () => Number(getComputedStyle(document.documentElement).getPropertyValue('--escala')) || 1,
  };

  const hash = /^#(\d+)(?:-(\d+))?$/.exec(location.hash);
  const inicial = hash ? Math.max(0, Math.min(total - 1, Number(hash[1]) - 1)) : 0;
  aplicar(inicial, 0, 'adelante');
  if (hash && hash[2]) ir(inicial, Number(hash[2]));
  if (new URLSearchParams(location.search).has('imprimir')) prepararImpresion();
  despertar();
})();
