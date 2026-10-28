/* Teléfono de la presentación comercial: reproduce cómo se navega la app de Waggo.
   Las pantallas son los marcos reales de design/propuesta/pantallas (incrustados en <template id="pant-...">).
   Transiciones: empujar/volver (deslizamiento lateral), fundido, hoja inferior que sube, marcador que camina por la
   ruta, botón que se presiona (toque). Todo con la API Web Animations; con movimiento reducido no hay animación. */
(() => {
  'use strict';

  /** Ejecuta fn cuando termina la animación (con respaldo por tiempo: en pestañas ocultas o sin cuadros no avanza). */
  Animation.prototype.luego = function luego(fn) {
    let hecho = false;
    const una = () => {
      if (hecho) return;
      hecho = true;
      fn();
    };
    this.finished.then(una, () => {});
    setTimeout(una, (this.effect.getComputedTiming().endTime || 0) + 120);
  };

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const reducido = () => (window.Motor ? window.Motor.reducirMovimiento : window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const dur = (ms) => (reducido() ? 0 : ms);
  const esperar = (ms) => new Promise((r) => setTimeout(r, reducido() ? 0 : ms));
  const marco = (id) => {
    const plantilla = document.getElementById(`pant-${id}`);
    if (!plantilla) throw new Error(`Falta la pantalla ${id}`);
    return plantilla.content.firstElementChild.cloneNode(true);
  };

  /* ------------------------------------------------------------------
     Guion de teléfono: número de lámina (1) -> { acc: [estado por paso] }
     estado = { p: pantalla base, hoja?: marco cuya hoja inferior se superpone, modal?: con velo,
                desdeBase?: la hoja crece desde la hoja de la base, tr?: 'empujar'|'volver'|'fundido',
                toque?: texto o [x,y] que se toca antes de cambiar, vivo?: el marcador camina, chip?: estado }
     ------------------------------------------------------------------ */
  const P = {
    bienvenida: 'comun-onboarding-bienvenida--claro',
    inicio: 'dueno-inicio-tab--primer-uso-sin-perros',
    agregar: 'dueno-mascotas-agregar--formulario',
    perros: 'dueno-mascotas-lista--con-perros',
    cotizar: 'comun-cotizar-tarifa--con-precio',
    donde: 'dueno-pedir-paseo-donde--pin-en-mi-ubicacion',
    detalles: 'dueno-pedir-paseo-detalles--con-precio-en-vivo',
    confirmar: 'dueno-pedir-paseo-confirmar--resumen-y-pago',
    buscando: 'dueno-paseo-buscando--buscando',
    aceptado: 'dueno-paseo-aceptado--sheet-medio',
    aceptadoX: 'dueno-paseo-aceptado--sheet-expandido',
    vivo: 'dueno-paseo-en-vivo--sheet-medio',
    vivoX: 'dueno-paseo-en-vivo--sheet-expandido',
    alerta: 'dueno-paseo-alertas--salio-de-la-zona',
    avisos: 'comun-avisos-bandeja--con-urgentes',
    emConfirmar: 'comun-paseo-emergencia--confirmar-paseador',
    emEnviada: 'comun-paseo-emergencia--enviada-paseador',
    chat: 'comun-paseo-chat--conversacion-activa',
    resumen: 'dueno-paseo-resumen--terminado-y-pagado',
    hazte: 'paseador-onboarding-hazte-paseador--formulario',
    verificando: 'paseador-onboarding-verificacion--verificando',
    aprobado: 'paseador-onboarding-verificacion--aprobado',
    solicitudes: 'paseador-inicio-solicitudes--mapa-y-lista',
    asignado: 'paseador-paseo-asignado--camino-a-la-recogida',
    enCurso: 'paseador-paseo-en-curso--compartiendo-ubicacion',
    terminarHoja: 'paseador-paseo-en-curso--confirmar-terminar',
    terminado: 'paseador-paseo-terminado--pagado',
    ganancias: 'paseador-ganancias-tab--con-ganancias',
  };

  const GUION = {
    3: { acc: [{ p: P.bienvenida, tr: 'fundido' }] },
    4: {
      acc: [
        { p: P.inicio, tr: 'fundido' },
        { p: P.agregar, toque: 'Agregar mi perro', tr: 'empujar' },
        { p: P.perros, toque: 'Guardar perro', tr: 'volver' },
      ],
    },
    5: {
      acc: [
        { p: P.donde, tr: 'empujar' },
        { p: P.detalles, toque: 'Confirmar recogida', tr: 'empujar' },
        { p: P.confirmar, toque: 'Continuar', tr: 'empujar' },
        { p: P.buscando, toque: 'Pedir paseo', tr: 'empujar' },
      ],
    },
    6: {
      acc: [
        { p: P.buscando, tr: 'fundido' },
        { p: P.aceptado, tr: 'fundido' },
        { p: P.aceptado, hoja: P.aceptadoX, desdeBase: true, tr: 'fundido' },
      ],
    },
    7: {
      acc: [
        { p: P.vivo, tr: 'fundido', vivo: true },
        { p: P.vivo, hoja: P.vivoX, desdeBase: true, tr: 'fundido' },
      ],
    },
    8: {
      acc: [
        { p: P.alerta, tr: 'fundido' },
        { p: P.avisos, toque: [352, 53], tr: 'empujar' },
      ],
    },
    9: {
      acc: [
        { p: P.enCurso, tr: 'fundido' },
        { p: P.enCurso, hoja: P.emConfirmar, modal: true, toque: 'SOS', tr: 'fundido' },
        { p: P.enCurso, hoja: P.emEnviada, modal: true, toque: 'Sí, es una emergencia', tr: 'fundido' },
      ],
    },
    10: { acc: [{ p: P.chat, tr: 'fundido' }] },
    11: {
      acc: [
        { p: P.vivo, tr: 'fundido', chip: 'En curso' },
        { p: P.resumen, tr: 'fundido', chip: 'Terminado' },
      ],
    },
    12: { acc: [{ p: P.cotizar, tr: 'fundido' }] },
    13: {
      acc: [
        { p: P.hazte, tr: 'fundido' },
        { p: P.verificando, toque: 'Enviar para verificación', tr: 'empujar' },
        { p: P.aprobado, tr: 'fundido' },
      ],
    },
    14: {
      acc: [
        { p: P.solicitudes, tr: 'fundido' },
        { p: P.asignado, toque: 'Aceptar', tr: 'empujar' },
        { p: P.enCurso, toque: 'Iniciar paseo', tr: 'fundido' },
      ],
    },
    15: {
      acc: [
        { p: P.enCurso, tr: 'fundido', vivo: true, chip: 'En curso' },
        { p: P.enCurso, hoja: P.terminarHoja, modal: true, toque: 'Terminar paseo', tr: 'fundido', chip: 'En curso' },
        { p: P.terminado, toque: 'Sí, terminar paseo', tr: 'fundido', chip: 'Terminado' },
        { p: P.ganancias, tr: 'fundido', chip: 'Terminado' },
      ],
    },
    18: { acc: [{ p: P.bienvenida, tr: 'fundido' }] },
  };

  /* ------------------------------------------------------------------
     Un teléfono: lo que se ve en pantalla y cómo cambia
     ------------------------------------------------------------------ */
  function Telefono(raiz) {
    const pantalla = raiz.querySelector('.tel-pantalla');
    const pila = raiz.querySelector('.tel-pila');
    const toques = raiz.querySelector('.tel-toques');
    let actual = null; // { estado, base, hoja, velo }

    const nuevaPant = (id) => {
      const el = document.createElement('div');
      el.className = 'pant';
      el.appendChild(marco(id));
      return el;
    };

    /** Y donde empieza la hoja inferior de un marco (arriba de la hoja). */
    function arribaDeHoja(svg) {
      const g = svg.querySelector('[id*="BottomSheet"]');
      return g ? Math.round(g.getBBox().y) : 844;
    }

    function nuevaHoja(id) {
      const el = document.createElement('div');
      el.className = 'hoja';
      const svg = marco(id);
      el.appendChild(svg);
      pila.appendChild(el);
      const arriba = arribaDeHoja(svg);
      svg.style.clipPath = `inset(${arriba}px 0 0 0)`;
      el.dataset.arriba = String(arriba);
      return el;
    }

    function nuevoVelo(visible) {
      const v = document.createElement('div');
      v.className = 'scrim';
      v.style.opacity = visible ? '1' : '0';
      pila.appendChild(v);
      return v;
    }

    /** Pone el estado sin animar (saltos, impresión y arranque). */
    function fijar(estado) {
      pila.textContent = '';
      toques.textContent = '';
      const base = nuevaPant(estado.p);
      pila.appendChild(base);
      let velo = null;
      let hoja = null;
      if (estado.hoja) {
        if (estado.modal) velo = nuevoVelo(true);
        hoja = nuevaHoja(estado.hoja);
        if (velo) pila.insertBefore(velo, hoja);
      }
      actual = { estado, base, hoja, velo };
    }

    /** Un toque en la pantalla: marca el punto y aprieta el botón. */
    async function tocar(destino) {
      if (!actual) return;
      let x;
      let y;
      let boton = null;
      const k = pantalla.getBoundingClientRect().width / 390;
      const p0 = pantalla.getBoundingClientRect();
      if (Array.isArray(destino)) {
        [x, y] = destino;
      } else {
        const raices = [actual.hoja, actual.base].filter(Boolean);
        let texto = null;
        for (const r of raices) {
          texto = Array.from(r.querySelectorAll('text')).find((t) => t.textContent.trim().startsWith(destino));
          if (texto) break;
        }
        if (!texto) return;
        boton = texto.closest('[id*="Button/"], [id*="MapFab"]') || texto.parentElement;
        const r = texto.getBoundingClientRect();
        x = (r.left + r.width / 2 - p0.left) / k;
        y = (r.top + r.height / 2 - p0.top) / k;
      }
      const punto = document.createElement('div');
      punto.className = 'toque';
      punto.style.left = `${x}px`;
      punto.style.top = `${y}px`;
      toques.appendChild(punto);
      if (reducido()) {
        punto.remove();
        return;
      }
      punto.animate(
        [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'scale(1)', offset: 0.35 }, { opacity: 0, transform: 'scale(1.35)' }],
        { duration: 620, easing: 'ease-out' },
      ).luego(() => punto.remove());
      if (boton) {
        boton.style.transformBox = 'fill-box';
        boton.style.transformOrigin = 'center';
        boton.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.94)', offset: 0.4 }, { transform: 'scale(1)' }], {
          duration: 420,
          delay: 140,
          easing: 'ease-in-out',
        });
      }
      await esperar(560);
    }

    /** El marcador del paseador camina por la ruta y la ruta se va dibujando. */
    function animarVivo(svg, ms) {
      const marcador = svg.querySelector('[id$="Marker/WalkerLive"]');
      const trazos = svg.querySelectorAll('[id$="Route/walked"] path');
      if (!marcador || !trazos.length || reducido()) return;
      const guia = trazos[trazos.length - 1];
      const largo = guia.getTotalLength();
      const fin = guia.getPointAtLength(largo);
      const N = 60;
      const posiciones = [];
      const dibujo = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const pt = guia.getPointAtLength(largo * t);
        posiciones.push({ transform: `translate(${(pt.x - fin.x).toFixed(1)}px, ${(pt.y - fin.y).toFixed(1)}px)`, offset: t });
        dibujo.push({ strokeDashoffset: `${(largo * (1 - t)).toFixed(1)}`, offset: t });
      }
      trazos.forEach((t) => {
        t.style.strokeDasharray = String(largo);
        t.animate(dibujo, { duration: ms, easing: 'linear' }).luego(() => {
          t.style.strokeDasharray = '';
        });
      });
      marcador.animate(posiciones, { duration: ms, easing: 'linear' });
    }

    /** Cambio animado de un estado a otro. */
    async function ir(estado, { hacia = 'adelante', conToque = true } = {}) {
      const previo = actual;
      if (!previo) return fijar(estado);
      if (conToque && estado.toque && hacia === 'adelante') await tocar(estado.toque);
      if (hacia !== 'adelante') {
        // Al retroceder no se repite el toque; la hoja baja o la pantalla vuelve.
      }

      const mismaBase = previo.estado.p === estado.p;
      if (mismaBase) {
        cambiarHoja(previo, estado);
      } else {
        cambiarPantalla(previo, estado, hacia);
      }
      if (estado.vivo) animarVivo(actual.base.querySelector('svg'), 7200);
    }

    function cambiarHoja(previo, estado) {
      const antes = previo.hoja;
      const velo = previo.velo;
      const base = previo.base;
      if (estado.hoja && !antes) {
        // La hoja sube.
        const v = estado.modal ? nuevoVelo(false) : null;
        const h = nuevaHoja(estado.hoja);
        const arriba = Number(h.dataset.arriba);
        const desde = estado.desdeBase ? arribaDeHoja(base.querySelector('svg')) : 844;
        if (v) v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur(380), fill: 'forwards' });
        h.animate([{ transform: `translateY(${desde - arriba}px)` }, { transform: 'translateY(0)' }], { duration: dur(560), easing: EASE });
        if (v) pila.insertBefore(v, h);
        actual = { estado, base, hoja: h, velo: v };
        if (v) v.style.opacity = '1';
      } else if (estado.hoja && antes) {
        // Una hoja se reemplaza por otra (cambia el contenido de la hoja).
        const h = nuevaHoja(estado.hoja);
        h.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur(380), easing: 'ease-out' });
        antes.animate([{ opacity: 1 }, { opacity: 1 }], { duration: dur(380) }).luego(() => antes.remove());
        actual = { estado, base, hoja: h, velo };
      } else if (!estado.hoja && antes) {
        // La hoja baja.
        const arriba = Number(antes.dataset.arriba);
        if (velo) velo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur(360), fill: 'forwards' }).luego(() => velo.remove());
        antes.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${844 - arriba}px)` }], { duration: dur(420), easing: EASE, fill: 'forwards' }).luego(() => antes.remove());
        actual = { estado, base, hoja: null, velo: null };
      } else {
        actual = { ...previo, estado };
      }
    }

    function cambiarPantalla(previo, estado, hacia) {
      const vieja = previo.base;
      const nueva = nuevaPant(estado.p);
      // Lo que cuelga de la pantalla anterior (hoja y velo) se va con ella.
      const colgantes = [previo.hoja, previo.velo].filter(Boolean);
      let tr = estado.tr || 'fundido';
      if (hacia !== 'adelante') tr = tr === 'empujar' ? 'volver' : tr === 'volver' ? 'empujar' : 'fundido';

      if (tr === 'empujar') {
        nueva.classList.add('empuja');
        pila.appendChild(nueva);
        nueva.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: dur(520), easing: EASE }).luego(() => nueva.classList.remove('empuja'));
        vieja.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-28%)' }], { duration: dur(520), easing: EASE, fill: 'forwards' }).luego(() => {
          vieja.remove();
          colgantes.forEach((c) => c.remove());
        });
      } else if (tr === 'volver') {
        pila.insertBefore(nueva, vieja);
        vieja.classList.add('empuja');
        nueva.animate([{ transform: 'translateX(-28%)' }, { transform: 'translateX(0)' }], { duration: dur(520), easing: EASE });
        vieja.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], { duration: dur(520), easing: EASE, fill: 'forwards' }).luego(() => {
          vieja.remove();
          colgantes.forEach((c) => c.remove());
        });
      } else {
        pila.appendChild(nueva);
        nueva.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur(480), easing: 'ease-out' }).luego(() => {
          vieja.remove();
          colgantes.forEach((c) => c.remove());
        });
      }
      let hoja = null;
      let velo = null;
      if (estado.hoja) {
        // Un estado que llega con hoja (por saltos) la pone ya subida.
        if (estado.modal) velo = nuevoVelo(true);
        hoja = nuevaHoja(estado.hoja);
      }
      actual = { estado, base: nueva, hoja, velo };
    }

    return { fijar, ir, tocar, get actual() { return actual; } };
  }

  /* ------------------------------------------------------------------
     Conexión con el motor
     ------------------------------------------------------------------ */
  const MARCO_TELEFONO =
    '<div class="telefono"><div class="tel-cuerpo"><div class="tel-pantalla"><div class="tel-pila"></div><div class="tel-toques"></div></div><div class="tel-isla"></div></div></div>';

  const capa = document.querySelector('.capa-tel');
  capa.innerHTML = `<div class="halo"></div>${MARCO_TELEFONO}`;
  const vivo = Telefono(capa.querySelector('.telefono'));
  let ultimo = { indice: -1, paso: 0 };
  let primeraVez = true;

  function estadoDe(cfg, paso) {
    return cfg.acc[Math.min(paso, cfg.acc.length - 1)];
  }

  function resaltarPuntos(lamina) {
    const visibles = Array.from(lamina.querySelectorAll('.col-der .punto[data-paso].paso-visible'));
    visibles.forEach((el) => el.classList.remove('actual'));
    if (visibles.length) visibles[visibles.length - 1].classList.add('actual');
  }

  function pintarChip(lamina, estado) {
    const chip = lamina.querySelector('.chip-estado');
    if (!chip || !estado.chip || chip.dataset.estado === estado.chip) return;
    chip.dataset.estado = estado.chip;
    const texto = chip.querySelector('.texto-estado');
    if (texto) {
      texto.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)', offset: 0.45 }, { opacity: 0, transform: 'translateY(10px)', offset: 0.55 }, { opacity: 1, transform: 'translateY(0)' }], { duration: dur(700) });
      setTimeout(() => { texto.textContent = estado.chip; }, reducido() ? 0 : 320);
    }
  }

  async function manejar(d) {
    const n = d.indice + 1;
    const cfg = GUION[n];
    resaltarPuntos(d.lamina);

    const salto = Math.abs(d.indice - ultimo.indice) > 1 || (d.indice === ultimo.indice && Math.abs(d.paso - ultimo.paso) > 1);
    const retrocede = d.indice < ultimo.indice || (d.indice === ultimo.indice && d.paso < ultimo.paso);
    ultimo = { indice: d.indice, paso: d.paso };

    if (!cfg) {
      capa.classList.add('fuera');
      return;
    }
    const estado = estadoDe(cfg, d.paso);
    const chip = d.lamina.querySelector('.chip-estado');
    if (chip && estado.chip) {
      chip.dataset.estado = estado.chip;
      const t = chip.querySelector('.texto-estado');
      if (t) t.textContent = estado.chip;
    }

    const estabaFuera = capa.classList.contains('fuera');
    if (estabaFuera || primeraVez || salto) {
      vivo.fijar(estado);
      capa.classList.remove('fuera');
      if (estado.vivo) setTimeout(() => vivo.actual && animarMarcador(vivo), estabaFuera ? 900 : 0);
      primeraVez = false;
      return;
    }
    primeraVez = false;
    if (!vivo.actual || vivo.actual.estado !== estado) {
      await vivo.ir(estado, { hacia: retrocede ? 'atras' : 'adelante' });
    }
    pintarChip(d.lamina, estado);
  }
  window.Motor.alCambiar(manejar);
  // El motor ya mostró la primera lámina antes de cargar este archivo.
  manejar({ indice: window.Motor.indice, paso: window.Motor.paso, cambioLamina: true, lamina: window.Motor.laminas[window.Motor.indice] });

  function animarMarcador(tel) {
    // Reinicia el recorrido del marcador sobre la pantalla actual (entrada del teléfono).
    tel.ir({ ...tel.actual.estado }, { hacia: 'adelante', conToque: false });
  }

  /* Impresión: cada lámina con teléfono lleva el suyo, en su estado final. */
  function prepararImpresion() {
    window.Motor.laminas.forEach((lamina, i) => {
      const cfg = GUION[i + 1];
      if (!cfg || lamina.querySelector('.tel-impr')) return;
      const caja = document.createElement('div');
      caja.className = 'tel-impr';
      caja.innerHTML = `<div class="halo"></div>${MARCO_TELEFONO}`;
      lamina.querySelector('.contenido-lamina').appendChild(caja);
      Telefono(caja.querySelector('.telefono')).fijar(cfg.acc[cfg.acc.length - 1]);
      const chip = lamina.querySelector('.chip-estado');
      const fin = cfg.acc[cfg.acc.length - 1];
      if (chip && fin.chip) {
        chip.dataset.estado = fin.chip;
        const t = chip.querySelector('.texto-estado');
        if (t) t.textContent = fin.chip;
      }
    });
  }
  document.addEventListener('motor:imprimir', prepararImpresion);
  if (document.body.classList.contains('imprimiendo')) prepararImpresion();
  document.addEventListener('motor:fin-impresion', () => {
    document.querySelectorAll('.tel-impr').forEach((el) => el.remove());
  });

  window.WaggoComercial = { GUION };
})();
