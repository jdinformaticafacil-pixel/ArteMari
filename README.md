# Mimo & Arcilla · web de muestra

Maqueta navegable en HTML, CSS y JavaScript (sin dependencias) de la tienda de tazas artesanales con sección de formación. El nombre, la paleta y los textos entre corchetes son provisionales.

## Páginas

- `index.html`: inicio con últimas piezas y preguntas frecuentes
- `tienda.html`: catálogo con filtros por tipo y disponibilidad (admite `?filtro=tazas`)
- `producto.html`: ficha de producto con galería y zoom
- `personalizados.html`: encargos y formulario de presupuesto
- `taller.html`: cursos (online/presencial, gratis/de pago), charlas en vídeo y agenda
- `curso.html`: ficha de un curso con temario
- `sobre.html`: sobre mí, proceso y valores
- `contacto.html`: formulario, WhatsApp, datos del taller y mapa
- `legal.html`: aviso legal, privacidad, cookies y condiciones de venta (plantilla para revisar)
- `404.html`: página de error para GitHub Pages

Los colores están en las variables de `style.css` (bloque `:root`). El carrito, los formularios y los vídeos son de demostración: no envían ni cobran nada.

## Idiomas

Traducción manual en tres versiones: español en la raíz, catalán en `ca/` e inglés en `en/`. Cada página enlaza a sus equivalentes (`hreflang`) y el selector de la rueda de preferencias y el pie llevan a la misma página en el otro idioma. Los textos de la parte interactiva están en `script.js` (objeto `TEXTOS`).

## Notas

- **No indexable:** todas las páginas llevan `<meta name="robots" content="noindex">` para que Google no indexe la muestra y no compita con la web real (contenido duplicado). Para quitarlo, borra esa línea.
- **Fotos:** cada foto tiene versiones WebP de 480, 800 y 1050 px; el navegador elige la adecuada (`srcset`).
- **Preferencias del visitante:** idioma, puntero, animaciones, texto grande y modo oscuro (rueda de la cabecera).
- **Diseño adaptable:** probado en 23 tamaños (de 280 px a 3440 px, móviles en vertical y horizontal, tablets y pantallas grandes), en los tres idiomas y con el texto ampliado.
- **Accesibilidad:** revisada con axe-core (WCAG 2.1 AA) en modo claro y oscuro, sin incidencias.
