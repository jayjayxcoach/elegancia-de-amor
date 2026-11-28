// Catálogo por evento. Cada index.html define window.CATALOGO antes de cargar este archivo:
// { evento: 'XV años', whatsapp: '593…', modelos: [[id, nombre, estilo, formato, enlace, favorita?], …], otros: [[texto, enlace], …] }
// Los archivos de cada modelo están en ../medios/portadas/<id>.webp y ../medios/sobres/<id>.mp4 (+ <id>.jpg de póster).
(() => {
  const C = window.CATALOGO;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const MEDIOS = '../medios/';
  const modelos = C.modelos.map(([id, nombre, estilo, formato, enlace, favorita], i) => ({ id, nombre, estilo, formato, enlace, favorita: !!favorita, n: i + 1 }));
  const wa = texto => 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(texto);
  const etiqueta = m => [m.estilo, m.formato ? 'Formato ' + m.formato.toLowerCase() : ''].filter(Boolean).join(' · ');

  function tarjeta(m, tipo) {
    const b = document.createElement('button');
    b.className = 'tarjeta';
    b.type = 'button';
    b.dataset.estilo = m.estilo || '';
    b.dataset.formato = m.formato || '';
    b.setAttribute('aria-label', (tipo === 'portada' ? 'Portada ' : 'Sobre ') + m.n + ': ' + m.nombre + '. Ver en grande');
    const medio = tipo === 'portada'
      ? `<img src="${MEDIOS}portadas/${m.id}.webp" alt="Portada de la invitación ${esc(m.nombre)}" loading="lazy" decoding="async" width="540" height="960">`
      : `<video muted loop playsinline preload="none" poster="${MEDIOS}sobres/${m.id}.jpg" data-src="${MEDIOS}sobres/${m.id}.mp4" aria-label="Sobre de la invitación ${esc(m.nombre)} abriéndose"></video>`;
    b.innerHTML = `<div class="marco"><span class="num">${m.n}</span>${m.favorita && tipo === 'portada' ? '<span class="estrella">⭐ La favorita</span>' : ''}${medio}
      <div class="nombre"><strong>${esc(m.nombre)}</strong><span>${esc(etiqueta(m))}</span></div></div>`;
    b.addEventListener('click', () => abrir(m, tipo));
    return b;
  }

  const rejPortadas = $('#rejilla-portadas'), rejSobres = $('#rejilla-sobres');
  modelos.forEach(m => rejPortadas.appendChild(tarjeta(m, 'portada')));
  modelos.forEach(m => rejSobres.appendChild(tarjeta(m, 'sobre')));

  // Videos: se cargan y suenan (sin sonido) solo cuando se ven
  const videos = [...rejSobres.querySelectorAll('video')];
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducido) {
    const io = new IntersectionObserver(entradas => entradas.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else v.pause();
    }), { threshold: 0.35 });
    videos.forEach(v => io.observe(v));
  }

  // Filtros
  const filtros = { estilo: '', formato: '' };
  document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
    const grupo = ch.dataset.grupo, valor = ch.dataset.valor;
    filtros[grupo] = filtros[grupo] === valor ? '' : valor;
    document.querySelectorAll('.chip[data-grupo="' + grupo + '"]').forEach(o => o.setAttribute('aria-pressed', String(filtros[grupo] === o.dataset.valor)));
    $('.chip[data-todas]') && $('.chip[data-todas]').setAttribute('aria-pressed', String(!filtros.estilo && !filtros.formato));
    aplicar();
  }));
  const todas = $('.chip[data-todas]');
  if (todas) todas.addEventListener('click', () => {
    filtros.estilo = filtros.formato = '';
    document.querySelectorAll('.chip').forEach(o => o.setAttribute('aria-pressed', String(o === todas)));
    aplicar();
  });
  function aplicar() {
    let visibles = 0;
    document.querySelectorAll('.tarjeta').forEach(t => {
      const ok = (!filtros.estilo || t.dataset.estilo === filtros.estilo) && (!filtros.formato || t.dataset.formato === filtros.formato);
      t.hidden = !ok;
      if (ok && t.closest('#rejilla-portadas')) visibles++;
    });
    document.querySelectorAll('.cuenta').forEach(c => { c.textContent = visibles === 1 ? '1 diseño' : visibles + ' diseños'; });
    document.querySelectorAll('.vacio').forEach(v => { v.hidden = visibles > 0; });
  }
  aplicar();

  // Vista grande
  const visor = $('#visor'), medio = $('#visor-medio');
  let ultimo = null;
  function abrir(m, tipo) {
    ultimo = document.activeElement;
    medio.innerHTML = tipo === 'portada'
      ? `<img src="${MEDIOS}portadas/${m.id}.webp" alt="Portada de la invitación ${esc(m.nombre)}">`
      : `<video src="${MEDIOS}sobres/${m.id}.mp4" poster="${MEDIOS}sobres/${m.id}.jpg" muted loop playsinline autoplay aria-label="Sobre de la invitación ${esc(m.nombre)} abriéndose"></video>`;
    $('#visor-titulo').textContent = (tipo === 'portada' ? 'Portada ' : 'Sobre ') + m.n + ' · ' + m.nombre;
    $('#visor-tipo').textContent = etiqueta(m);
    $('#visor-ver').href = m.enlace;
    $('#visor-wa').href = wa('Hola Vale 💕 Me gustó ' + (tipo === 'portada' ? 'la portada ' : 'el sobre ') + m.n + ' (' + m.nombre + ') del catálogo de ' + C.evento);
    visor.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#visor .cerrar').focus();
    videos.forEach(v => v.pause());
  }
  function cerrar() {
    visor.hidden = true;
    medio.innerHTML = '';
    document.body.style.overflow = '';
    if (ultimo) ultimo.focus();
  }
  visor.addEventListener('click', e => { if (e.target === visor) cerrar(); });
  $('#visor .cerrar').addEventListener('click', cerrar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !visor.hidden) cerrar(); });

  // WhatsApp general
  document.querySelectorAll('[data-wa]').forEach(a => { a.href = wa('Hola Vale 💕 Vi el catálogo de ' + C.evento + ' y me gustó…'); });
})();
