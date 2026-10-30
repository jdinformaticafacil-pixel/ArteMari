/* Mimo & Arcilla — interactividad de la web de muestra */
(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.add('js');
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conRaton = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Aviso flotante ---------- */
  var aviso = document.createElement('div');
  aviso.className = 'aviso-flotante';
  aviso.setAttribute('role', 'status');
  aviso.setAttribute('aria-live', 'polite');
  document.body.appendChild(aviso);
  var temporizador;
  function avisar(texto) {
    aviso.textContent = texto;
    aviso.classList.add('visible');
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { aviso.classList.remove('visible'); }, 3200);
  }

  /* ---------- Barra de progreso y botón de volver arriba ---------- */
  var progreso = document.createElement('div');
  progreso.className = 'progreso';
  progreso.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progreso);
  var arriba = document.createElement('button');
  arriba.type = 'button';
  arriba.className = 'arriba';
  arriba.setAttribute('aria-label', 'Volver arriba');
  arriba.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  arriba.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reducir ? 'auto' : 'smooth' }); });
  document.body.appendChild(arriba);

  /* ---------- Cabecera compacta y parallax del hero ---------- */
  var cabecera = document.querySelector('.cabecera');
  var fotosHero = document.querySelectorAll('.hero-fotos img');
  var pendiente = false;
  function alDesplazar() {
    pendiente = false;
    var y = window.scrollY || 0;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    progreso.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, y / total) : 0).toFixed(4) + ')';
    arriba.classList.toggle('visible', y > 700);
    if (cabecera) cabecera.classList.toggle('compacta', y > 40);
    if (!reducir && y < 1200) {
      fotosHero.forEach(function (img, i) {
        img.style.transform = 'translateY(' + (y * (i ? -0.08 : 0.06)).toFixed(1) + 'px)';
      });
    }
  }
  window.addEventListener('scroll', function () {
    if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); }
  }, { passive: true });
  alDesplazar();

  /* ---------- Aparición al hacer scroll ---------- */
  var revelables = document.querySelectorAll('.revelar');
  if (reducir || !('IntersectionObserver' in window)) {
    revelables.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); observador.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revelables.forEach(function (el) { observador.observe(el); });
  }

  /* ---------- Carrito (solo demostración) ---------- */
  var CLAVE = 'mimo-carrito';
  var memoria = [];
  function leer() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE)) || []; } catch (e) { return memoria.slice(); }
  }
  function guardar(lista) {
    memoria = lista.slice();
    try { sessionStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ }
  }

  var velo = document.createElement('div');
  velo.className = 'velo';
  var cajon = document.createElement('aside');
  cajon.className = 'cajon';
  cajon.setAttribute('aria-label', 'Carrito');
  cajon.inert = true;
  cajon.innerHTML =
    '<div class="cajon-cabeza"><h2>Tu carrito</h2>' +
    '<button class="icono-btn cerrar-cajon" type="button" aria-label="Cerrar carrito">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    '</button></div>' +
    '<ul class="cajon-lista"></ul>' +
    '<div class="cajon-pie"><div class="cajon-total"></div>' +
    '<button class="boton boton-acento finalizar" type="button">Finalizar compra</button>' +
    '<p class="nota-muestra">Web de muestra: el pago real lo gestionará WooCommerce.</p></div>';
  document.body.appendChild(velo);
  document.body.appendChild(cajon);
  var listaCajon = cajon.querySelector('.cajon-lista');
  var totalCajon = cajon.querySelector('.cajon-total');
  var ultimoFoco = null;

  function escapar(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pintar() {
    var lista = leer();
    if (!lista.length) {
      listaCajon.innerHTML = '<li class="cajon-vacio">Todavía no has añadido nada.</li>';
    } else {
      listaCajon.innerHTML = lista.map(function (item, i) {
        return '<li class="cajon-item"><div><b>' + escapar(item.nombre) + '</b><span>' + escapar(item.precio) + '</span></div>' +
          '<button type="button" class="quitar" data-quitar="' + i + '" aria-label="Quitar ' + escapar(item.nombre) + '">Quitar</button></li>';
      }).join('');
    }
    totalCajon.textContent = lista.length === 1 ? '1 artículo' : lista.length + ' artículos';
    document.querySelectorAll('.contador').forEach(function (c) {
      c.textContent = lista.length;
      c.classList.toggle('activo', lista.length > 0);
    });
  }

  function saltar() {
    document.querySelectorAll('.contador').forEach(function (c) {
      c.classList.remove('salto'); void c.offsetWidth; c.classList.add('salto');
    });
  }

  function abrir() {
    ultimoFoco = document.activeElement;
    cajon.inert = false;
    cajon.classList.add('abierto');
    velo.classList.add('abierto');
    document.body.classList.add('sin-scroll');
    var cerrarBtn = cajon.querySelector('.cerrar-cajon');
    setTimeout(function () { cerrarBtn.focus(); }, 50);
  }
  function cerrar() {
    cajon.classList.remove('abierto');
    velo.classList.remove('abierto');
    document.body.classList.remove('sin-scroll');
    cajon.inert = true;
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cajon.classList.contains('abierto')) cerrar();
  });

  document.addEventListener('click', function (e) {
    var anadir = e.target.closest('[data-carrito]');
    if (anadir) {
      e.preventDefault();
      var lista = leer();
      var nombre = anadir.getAttribute('data-nombre');
      var repetido = lista.some(function (x) { return x.nombre === nombre; });
      if (repetido) {
        avisar(anadir.getAttribute('data-repetido') || 'Ya está en tu carrito.');
        abrir();
        return;
      }
      lista.push({ nombre: nombre, precio: anadir.getAttribute('data-precio') || '' });
      guardar(lista);
      pintar();
      saltar();
      abrir();
      return;
    }
    if (e.target.closest('.boton-carrito')) { abrir(); return; }
    if (e.target.closest('.cerrar-cajon') || e.target === velo) { cerrar(); return; }
    var quitar = e.target.closest('[data-quitar]');
    if (quitar) {
      var l = leer();
      l.splice(Number(quitar.getAttribute('data-quitar')), 1);
      guardar(l);
      pintar();
      return;
    }
    if (e.target.closest('.finalizar')) {
      avisar(leer().length ? 'Aquí empezaría el pago con WooCommerce.' : 'El carrito está vacío.');
      return;
    }
    var conAviso = e.target.closest('[data-aviso]');
    if (conAviso) { e.preventDefault(); avisar(conAviso.getAttribute('data-aviso')); }
  });

  pintar();

  /* ---------- Formularios de muestra ---------- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      avisar(form.getAttribute('data-demo'));
      form.reset();
      form.querySelectorAll('.lista-archivos').forEach(function (l) { l.textContent = ''; });
    });
  });

  document.querySelectorAll('input[type="file"]').forEach(function (input) {
    var destino = input.parentNode.querySelector('.lista-archivos');
    if (!destino) return;
    input.addEventListener('change', function () {
      var nombres = Array.prototype.map.call(input.files, function (f) { return f.name; });
      destino.textContent = nombres.length ? 'Seleccionadas: ' + nombres.join(', ') : '';
    });
  });

  /* ---------- Galería con miniaturas y zoom ---------- */
  var zoom = document.querySelector('.zoom');
  if (zoom) {
    var principal = zoom.querySelector('img');
    var miniaturas = document.querySelectorAll('.miniaturas button');
    miniaturas.forEach(function (btn) {
      btn.addEventListener('click', function () {
        miniaturas.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        principal.style.objectPosition = btn.getAttribute('data-pos');
        principal.alt = btn.querySelector('img').alt;
      });
    });
    if (conRaton) {
      zoom.addEventListener('mousemove', function (e) {
        var r = zoom.getBoundingClientRect();
        principal.style.transformOrigin =
          ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' +
          ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
        zoom.classList.add('ampliado');
      });
      zoom.addEventListener('mouseleave', function () { zoom.classList.remove('ampliado'); });
    }
  }

  /* ---------- Filtros (cursos y tienda) ---------- */
  var filtros = document.querySelectorAll('.filtro');
  var filtrables = document.querySelectorAll('.filtrable [data-tipo]');
  var sinResultados = document.querySelector('.sin-resultados');
  var cuenta = document.querySelector('.cuenta');
  function filtrar(filtro, animar) {
    var valor = filtro.getAttribute('data-filtro');
    filtros.forEach(function (o) { o.setAttribute('aria-pressed', String(o === filtro)); });
    var visibles = 0;
    filtrables.forEach(function (c) {
      var encaja = valor === 'todos' || c.getAttribute('data-tipo').split(' ').indexOf(valor) > -1;
      c.classList.toggle('oculto', !encaja);
      if (encaja) {
        visibles++;
        if (animar) {
          c.classList.add('visible');
          c.classList.remove('entra'); void c.offsetWidth; c.classList.add('entra');
        }
      }
    });
    if (sinResultados) sinResultados.hidden = visibles > 0;
    if (cuenta) cuenta.textContent = visibles === 1 ? '1 resultado' : visibles + ' resultados';
  }
  filtros.forEach(function (filtro) {
    filtro.addEventListener('click', function () { filtrar(filtro, true); });
  });
  if (filtros.length) {
    var pedido = new URLSearchParams(window.location.search).get('filtro');
    var inicial = pedido && document.querySelector('.filtro[data-filtro="' + pedido.replace(/[^a-z]/g, '') + '"]');
    filtrar(inicial || filtros[0], false);
  }

  /* ---------- Vídeos de muestra ---------- */
  document.querySelectorAll('.video .play').forEach(function (boton) {
    boton.addEventListener('click', function () {
      boton.closest('.video').classList.add('reproduciendo');
    });
  });
})();
