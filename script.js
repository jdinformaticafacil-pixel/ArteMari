/* Mimo & Arcilla — interactividad de la web de muestra */
(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.add('js');
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conRaton = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Preferencias del visitante (se guardan en su navegador) ---------- */
  var CLAVE_PREFS = 'mimo-preferencias';
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(CLAVE_PREFS)) || {}; } catch (e) { prefs = {}; }
  function guardarPrefs() {
    try { localStorage.setItem(CLAVE_PREFS, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ }
  }
  var reducirSistema = reducir;
  if (typeof prefs.animaciones === 'boolean') reducir = !prefs.animaciones;
  function aplicarClases() {
    raiz.classList.toggle('sin-animaciones', reducir);
    raiz.classList.toggle('texto-grande', !!prefs.textoGrande);
  }
  aplicarClases();

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

  /* ---------- Botón de WhatsApp ---------- */
  /* Cambia aquí el número (con prefijo de país, sin + ni espacios) y el mensaje */
  var WHATSAPP_NUMERO = '34600000000';
  var WHATSAPP_MENSAJE = 'Hola, he visto vuestra web y me gustaría más información.';
  var whatsapp = document.createElement('a');
  whatsapp.className = 'whatsapp';
  whatsapp.href = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(WHATSAPP_MENSAJE);
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener';
  whatsapp.setAttribute('aria-label', 'Escribir por WhatsApp');
  whatsapp.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z"/>' +
    '<path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>' +
    '<span class="whatsapp-texto">¿Hablamos?</span>';
  document.body.appendChild(whatsapp);

  /* ---------- Puntero interactivo (ratón y pantallas táctiles) ---------- */
  var tactil = !conRaton && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (conRaton || tactil) {
    var punto = document.createElement('div');
    punto.className = 'cursor-punto';
    var anillo = document.createElement('div');
    anillo.className = 'cursor-anillo';
    anillo.innerHTML = '<span></span>';
    var etiquetaAnillo = anillo.querySelector('span');
    punto.setAttribute('aria-hidden', 'true');
    anillo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(anillo);
    document.body.appendChild(punto);
    if (!conRaton) raiz.classList.add('cursor-tactil');
    aplicarPuntero();

    var mx = -100, my = -100, ax = -100, ay = -100, moviendo = false;
    function moverA(x, y) {
      mx = x; my = y;
      punto.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      raiz.classList.add('cursor-visible');
      if (!moviendo) { moviendo = true; requestAnimationFrame(seguir); }
    }
    if (tactil) {
      document.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        if (ax < 0) { ax = t.clientX; ay = t.clientY; }
        moverA(t.clientX, t.clientY);
        anillo.classList.remove('pulso'); void anillo.offsetWidth; anillo.classList.add('pulso');
      }, { passive: true });
      document.addEventListener('touchmove', function (e) {
        var t = e.touches[0];
        moverA(t.clientX, t.clientY);
      }, { passive: true });
    }
    function seguir() {
      var suavidad = reducir ? 1 : (tactil ? 0.12 : 0.18);
      ax += (mx - ax) * suavidad;
      ay += (my - ay) * suavidad;
      anillo.style.transform = 'translate(' + ax.toFixed(1) + 'px,' + ay.toFixed(1) + 'px)';
      if (Math.abs(mx - ax) > 0.1 || Math.abs(my - ay) > 0.1) {
        requestAnimationFrame(seguir);
      } else {
        moviendo = false;
      }
    }
    if (conRaton) {
      document.addEventListener('mousemove', function (e) { moverA(e.clientX, e.clientY); });
    }
    document.addEventListener('mouseleave', function () { raiz.classList.remove('cursor-visible'); });
    document.addEventListener('mousedown', function () { anillo.classList.add('pulsado'); });
    document.addEventListener('mouseup', function () { anillo.classList.remove('pulsado'); });

    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var campo = t.closest('input, textarea, select');
      raiz.classList.toggle('cursor-escondido', !!campo);
      var foto = t.closest('.tarjeta:not(.proximamente), .curso, .categoria, .zoom, .video, .tarjeta-encargo');
      var interactivo = t.closest('a, button, summary, label');
      anillo.classList.remove('activo', 'ver');
      punto.classList.remove('encima');
      if (foto) {
        var texto = foto.classList.contains('zoom') ? 'Zoom'
          : foto.classList.contains('video') ? 'Ver vídeo'
          : foto.classList.contains('tarjeta-encargo') ? 'Encargar'
          : 'Ver';
        etiquetaAnillo.textContent = texto;
        anillo.classList.add('ver');
        punto.classList.add('encima');
      } else if (interactivo) {
        anillo.classList.add('activo');
      }
    });
  }

  function aplicarPuntero() {
    var activo = prefs.puntero !== false;
    raiz.classList.toggle('sin-puntero', !activo);
    if (conRaton) raiz.classList.toggle('cursor-propio', activo);
  }

  /* ---------- Rueda de preferencias en la cabecera ---------- */
  var iconos = document.querySelector('.iconos');
  if (iconos) {
    var rueda = document.createElement('button');
    rueda.type = 'button';
    rueda.className = 'icono-btn boton-ajustes';
    rueda.setAttribute('aria-label', 'Preferencias');
    rueda.setAttribute('aria-expanded', 'false');
    rueda.setAttribute('aria-controls', 'panel-ajustes');
    rueda.innerHTML = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';
    iconos.insertBefore(rueda, iconos.querySelector('.boton-carrito'));

    var panel = document.createElement('div');
    panel.className = 'panel-ajustes';
    panel.id = 'panel-ajustes';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Preferencias');
    panel.inert = true;
    function interruptor(clave, texto) {
      return '<button type="button" class="interruptor" role="switch" aria-checked="false" data-pref="' + clave + '">' +
        '<span>' + texto + '</span><span class="pista-switch" aria-hidden="true"><span class="mando"></span></span></button>';
    }
    panel.innerHTML =
      '<div class="ajustes-cabeza"><b>Preferencias</b>' +
      '<button type="button" class="icono-btn cerrar-ajustes" aria-label="Cerrar preferencias"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div><span class="ajuste-titulo" id="titulo-idioma">Idioma</span>' +
      '<div class="segmentado" role="group" aria-labelledby="titulo-idioma">' +
      '<button type="button" data-idioma="es" aria-pressed="false">Español</button>' +
      '<button type="button" data-idioma="ca" aria-pressed="false">Català</button>' +
      '<button type="button" data-idioma="en" aria-pressed="false">English</button></div></div>' +
      '<div class="ajustes-lista">' +
      interruptor('puntero', 'Puntero interactivo') +
      interruptor('animaciones', 'Animaciones') +
      interruptor('textoGrande', 'Texto más grande') +
      '</div>' +
      '<button type="button" class="restablecer">Restablecer</button>';
    document.body.appendChild(panel);

    var AVISOS_IDIOMA = {
      es: 'Idioma: español.',
      ca: 'Versió en català: a la web real es carregarà amb el connector d’idiomes.',
      en: 'English version: on the real site it will load with the language plugin.'
    };

    function pintarAjustes() {
      var idioma = prefs.idioma || 'es';
      panel.querySelectorAll('[data-idioma]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-idioma') === idioma));
      });
      var valores = { puntero: prefs.puntero !== false, animaciones: !reducir, textoGrande: !!prefs.textoGrande };
      panel.querySelectorAll('[data-pref]').forEach(function (b) {
        b.setAttribute('aria-checked', String(valores[b.getAttribute('data-pref')]));
      });
    }
    function abrirAjustes() {
      var c = document.querySelector('.cabecera');
      panel.style.top = ((c ? c.getBoundingClientRect().bottom : 70) + 8) + 'px';
      pintarAjustes();
      panel.inert = false;
      panel.classList.add('abierto');
      rueda.setAttribute('aria-expanded', 'true');
    }
    function cerrarAjustes(devolverFoco) {
      if (!panel.classList.contains('abierto')) return;
      panel.classList.remove('abierto');
      panel.inert = true;
      rueda.setAttribute('aria-expanded', 'false');
      if (devolverFoco) rueda.focus();
    }

    rueda.addEventListener('click', function () {
      if (panel.classList.contains('abierto')) cerrarAjustes(false); else abrirAjustes();
    });
    panel.querySelector('.cerrar-ajustes').addEventListener('click', function () { cerrarAjustes(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarAjustes(true); });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('abierto') && !panel.contains(e.target) && !rueda.contains(e.target)) cerrarAjustes(false);
    });
    window.addEventListener('scroll', function () { cerrarAjustes(false); }, { passive: true });

    panel.addEventListener('click', function (e) {
      var idioma = e.target.closest('[data-idioma]');
      if (idioma) {
        prefs.idioma = idioma.getAttribute('data-idioma');
        guardarPrefs(); pintarAjustes();
        avisar(AVISOS_IDIOMA[prefs.idioma]);
        return;
      }
      var sw = e.target.closest('[data-pref]');
      if (sw) {
        var clave = sw.getAttribute('data-pref');
        var nuevo = sw.getAttribute('aria-checked') !== 'true';
        if (clave === 'animaciones') { prefs.animaciones = nuevo; reducir = !nuevo; }
        else prefs[clave] = nuevo;
        guardarPrefs(); aplicarClases(); aplicarPuntero(); pintarAjustes();
        if (clave === 'animaciones' && !nuevo) {
          document.querySelectorAll('.revelar').forEach(function (el) { el.classList.add('visible'); });
          fotosHero.forEach(function (img) { img.style.transform = ''; });
        }
        return;
      }
      if (e.target.closest('.restablecer')) {
        prefs = {};
        reducir = reducirSistema;
        guardarPrefs(); aplicarClases(); aplicarPuntero(); pintarAjustes();
        avisar('Preferencias restablecidas.');
      }
    });
  }

  /* ---------- Menú móvil a pantalla completa ---------- */
  var navPrincipal = document.querySelector('.menu');
  if (iconos && navPrincipal) {
    var botonMenu = document.createElement('button');
    botonMenu.type = 'button';
    botonMenu.className = 'icono-btn boton-menu';
    botonMenu.setAttribute('aria-label', 'Abrir menú');
    botonMenu.setAttribute('aria-expanded', 'false');
    botonMenu.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';
    iconos.appendChild(botonMenu);

    var menuMovil = document.createElement('nav');
    menuMovil.className = 'menu-movil';
    menuMovil.setAttribute('aria-label', 'Menú');
    menuMovil.inert = true;
    var enlacesMenu = '';
    navPrincipal.querySelectorAll('a').forEach(function (a, i) {
      enlacesMenu += '<a href="' + a.getAttribute('href') + '" style="--i:' + i + '"' +
        (a.getAttribute('aria-current') ? ' aria-current="page"' : '') + '>' + a.textContent + '</a>';
    });
    menuMovil.innerHTML =
      '<button type="button" class="icono-btn cerrar-menu" aria-label="Cerrar menú"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="menu-movil-enlaces">' + enlacesMenu + '</div>' +
      '<p class="menu-movil-pie">Hecho a mano · Piezas únicas · Cursos y talleres</p>';
    document.body.appendChild(menuMovil);

    function abrirMenu() {
      menuMovil.inert = false;
      menuMovil.classList.add('abierto');
      botonMenu.setAttribute('aria-expanded', 'true');
      document.body.classList.add('sin-scroll');
      setTimeout(function () { menuMovil.querySelector('.cerrar-menu').focus(); }, 50);
    }
    function cerrarMenu() {
      if (!menuMovil.classList.contains('abierto')) return;
      menuMovil.classList.remove('abierto');
      menuMovil.inert = true;
      botonMenu.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sin-scroll');
      botonMenu.focus();
    }
    botonMenu.addEventListener('click', abrirMenu);
    menuMovil.querySelector('.cerrar-menu').addEventListener('click', cerrarMenu);
    menuMovil.addEventListener('click', function (e) { if (e.target.closest('a')) cerrarMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  /* ---------- Buscador ---------- */
  var INDICE = [
    { t: 'Taza «El sabio de la pizarra»', c: 'Pieza única · Disponible', u: 'producto.html', k: 'taza sabio pizarra formulas ciencia profesor pelo blanco' },
    { t: 'Taza «La jardinera»', c: 'Pieza única · Vendida', u: 'personalizados.html', k: 'taza jardinera flores sombrero chica vendida' },
    { t: 'Tienda', c: 'Página', u: 'tienda.html', k: 'tienda comprar tazas llaveros imanes figuras productos' },
    { t: 'Pedidos personalizados', c: 'Página', u: 'personalizados.html', k: 'encargo personalizado presupuesto a medida regalo mascota personaje' },
    { t: 'Modela tu primera figura en taza', c: 'Curso online · De pago', u: 'curso.html', k: 'curso online modelar figura taza iniciacion pago' },
    { t: 'Iniciación a la arcilla polimérica', c: 'Curso online · Gratis', u: 'taller.html#cursos', k: 'curso gratis gratuito iniciacion arcilla polimerica materiales' },
    { t: 'Rostros y expresiones en miniatura', c: 'Curso online · De pago', u: 'taller.html#cursos', k: 'curso caras rostros expresiones intermedio' },
    { t: 'Tu taza en una mañana', c: 'Taller presencial · De pago', u: 'taller.html#presencial', k: 'taller presencial mañana grupo taza' },
    { t: 'Taller familiar de modelado', c: 'Taller presencial · De pago', u: 'taller.html#presencial', k: 'taller familiar niños familia presencial' },
    { t: 'Charlas y vídeos', c: 'Contenido gratuito', u: 'taller.html#charlas', k: 'charlas videos gratis proceso cuidados' },
    { t: 'Preguntas frecuentes', c: 'Ayuda', u: 'index.html#preguntas', k: 'preguntas faq lavavajillas envio devolucion plazo cuidados microondas' },
    { t: 'Contacto', c: 'Ayuda', u: 'index.html#contacto', k: 'contacto correo whatsapp novedades' }
  ];
  function normalizar(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  var botonBuscar = iconos && iconos.querySelector('[aria-label="Buscar"]');
  if (botonBuscar) {
    botonBuscar.removeAttribute('data-aviso');
    botonBuscar.setAttribute('aria-expanded', 'false');
    var buscador = document.createElement('div');
    buscador.className = 'buscador';
    buscador.setAttribute('role', 'dialog');
    buscador.setAttribute('aria-label', 'Buscar en la web');
    buscador.inert = true;
    buscador.innerHTML =
      '<div class="contenedor">' +
      '<div class="buscador-caja"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<input type="search" placeholder="Busca tazas, cursos, encargos…" aria-label="Buscar en la web" autocomplete="off">' +
      '<button type="button" class="icono-btn cerrar-buscador" aria-label="Cerrar buscador"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<ul class="buscador-resultados" aria-live="polite"></ul></div>';
    var veloBuscador = document.createElement('div');
    veloBuscador.className = 'velo velo-buscador';
    document.body.appendChild(veloBuscador);
    document.body.appendChild(buscador);
    var campoBuscar = buscador.querySelector('input');
    var listaResultados = buscador.querySelector('.buscador-resultados');

    function pintarResultados() {
      var q = normalizar(campoBuscar.value.trim());
      if (!q) {
        listaResultados.innerHTML = '<li class="buscador-pista">Prueba con: <button type="button" data-sugerencia="taza">taza</button> <button type="button" data-sugerencia="curso">curso</button> <button type="button" data-sugerencia="encargo">encargo</button> <button type="button" data-sugerencia="gratis">gratis</button></li>';
        return;
      }
      var palabras = q.split(/\s+/);
      var encontrados = INDICE.filter(function (it) {
        var texto = normalizar(it.t + ' ' + it.c + ' ' + it.k);
        return palabras.every(function (p) { return texto.indexOf(p) > -1; });
      });
      listaResultados.innerHTML = encontrados.length
        ? encontrados.map(function (it) {
            return '<li><a href="' + it.u + '"><b>' + escapar(it.t) + '</b><span>' + escapar(it.c) + '</span></a></li>';
          }).join('')
        : '<li class="buscador-pista">No hay resultados para «' + escapar(campoBuscar.value) + '». <a class="enlace" href="personalizados.html">¿Te lo hago por encargo?</a></li>';
    }
    function abrirBuscador() {
      buscador.inert = false;
      buscador.classList.add('abierto');
      veloBuscador.classList.add('abierto');
      botonBuscar.setAttribute('aria-expanded', 'true');
      pintarResultados();
      setTimeout(function () { campoBuscar.focus(); }, 60);
    }
    function cerrarBuscador() {
      if (!buscador.classList.contains('abierto')) return;
      buscador.classList.remove('abierto');
      veloBuscador.classList.remove('abierto');
      buscador.inert = true;
      botonBuscar.setAttribute('aria-expanded', 'false');
      botonBuscar.focus();
    }
    botonBuscar.addEventListener('click', abrirBuscador);
    buscador.querySelector('.cerrar-buscador').addEventListener('click', cerrarBuscador);
    veloBuscador.addEventListener('click', cerrarBuscador);
    campoBuscar.addEventListener('input', pintarResultados);
    buscador.addEventListener('click', function (e) {
      var s = e.target.closest('[data-sugerencia]');
      if (s) { campoBuscar.value = s.getAttribute('data-sugerencia'); pintarResultados(); campoBuscar.focus(); return; }
      if (e.target.closest('a')) cerrarBuscador();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarBuscador(); });
  }

  /* ---------- Barra fija de compra en el móvil y botón de compartir ---------- */
  var botonCompra = document.querySelector('.compra [data-carrito], .curso-compra [data-carrito]');
  if (botonCompra) {
    var precioTexto = (document.querySelector('.detalle .precio-grande, .curso-compra .precio-grande') || {}).textContent || '';
    var tituloTexto = (document.querySelector('h1') || {}).textContent || '';
    var barra = document.createElement('div');
    barra.className = 'barra-compra';
    barra.setAttribute('aria-hidden', 'true');
    barra.innerHTML = '<div><b></b><span></span></div>';
    barra.querySelector('b').textContent = tituloTexto;
    barra.querySelector('span').textContent = precioTexto;
    var copia = botonCompra.cloneNode(true);
    copia.setAttribute('tabindex', '-1');
    barra.appendChild(copia);
    document.body.appendChild(barra);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        var fuera = !entradas[0].isIntersecting && entradas[0].boundingClientRect.top < 0;
        barra.classList.toggle('visible', fuera);
        raiz.classList.toggle('con-barra', fuera);
      }).observe(botonCompra);
    }

    var compartir = document.createElement('button');
    compartir.type = 'button';
    compartir.className = 'compartir';
    compartir.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>Compartir';
    var contenedorCompra = botonCompra.parentNode;
    if (contenedorCompra.classList.contains('compra')) {
      contenedorCompra.parentNode.insertBefore(compartir, contenedorCompra.nextSibling);
    } else {
      contenedorCompra.insertBefore(compartir, botonCompra.nextSibling);
    }
    compartir.addEventListener('click', function () {
      var datos = { title: document.title, text: tituloTexto, url: window.location.href.split('?')[0] };
      if (navigator.share) {
        navigator.share(datos).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(datos.url).then(function () { avisar('Enlace copiado.'); }, function () { avisar(datos.url); });
      } else {
        avisar(datos.url);
      }
    });
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
        var signo = i ? -1 : 1;
        img.style.transform = 'perspective(900px) translateY(' + (y * (i ? -0.08 : 0.06)).toFixed(1) + 'px)' +
          ' rotateX(' + (inclinY * -6).toFixed(2) + 'deg) rotateY(' + (inclinX * 8 * signo).toFixed(2) + 'deg)';
      });
    }
  }
  window.addEventListener('scroll', function () {
    if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); }
  }, { passive: true });

  /* Inclinación 3D de las fotos del inicio al mover el ratón */
  var inclinX = 0, inclinY = 0;
  var hero = document.querySelector('.hero');
  if (hero && conRaton) {
    hero.addEventListener('mousemove', function (e) {
      if (reducir) return;
      var r = hero.getBoundingClientRect();
      inclinX = (e.clientX - r.left) / r.width - 0.5;
      inclinY = (e.clientY - r.top) / r.height - 0.5;
      if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); }
    });
    hero.addEventListener('mouseleave', function () {
      inclinX = 0; inclinY = 0;
      if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); }
    });
  }
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
