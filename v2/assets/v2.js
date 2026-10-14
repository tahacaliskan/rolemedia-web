/* ROLE Medya v2: menü, saat, reveal, video önizleme, film oynatıcı, filtre, hizmet önizleme, brief -> WhatsApp */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '905349579693';
  const M = '../media/';

  /* menu */
  const bg = $('.burger');
  const setMenu = o => { document.body.classList.toggle('menu-open', o); bg && bg.setAttribute('aria-expanded', String(o)); $('.menu').setAttribute('aria-hidden', String(!o)); document.body.style.overflow = o ? 'hidden' : ''; };
  bg && bg.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('scroll', () => document.body.classList.toggle('scrolled', scrollY > 40), { passive: true });

  /* Gaziantep clock */
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const tick = () => { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })); const t = $('[data-time]'), dy = $('[data-day]'); if (t) t.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); if (dy) dy.textContent = days[d.getDay()] + ' · Gaziantep'; };
  tick(); setInterval(tick, 20000);

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* background videos: pause off-screen */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause(); }), { threshold: .05 });
  $$('.hero video, .svh video').forEach(v => { v.muted = true; if (reduce) { v.removeAttribute('autoplay'); v.pause(); } vio.observe(v); });

  /* card previews */
  const touch = matchMedia('(hover: none)').matches;
  const play = c => { const v = $('video', c); if (!v || reduce) return; if (!v.src) v.src = v.dataset.src; v.play().then(() => c.classList.add('playing')).catch(() => {}); };
  const stop = c => { const v = $('video', c); if (!v) return; v.pause(); c.classList.remove('playing'); };
  if (touch) {
    const cio = new IntersectionObserver(es => es.forEach(e => e.intersectionRatio > .7 ? play(e.target) : stop(e.target)), { threshold: [0, .7] });
    $$('.vc').forEach(c => cio.observe(c));
  } else $$('.vc').forEach(c => { c.addEventListener('mouseenter', () => play(c)); c.addEventListener('mouseleave', () => stop(c)); });

  /* film lightbox */
  const fd = $('#films'); const FILMS = fd ? JSON.parse(fd.textContent) : [];
  const by = Object.fromEntries(FILMS.map(f => [f.id, f]));
  const lb = $('.lb'); let list = [], idx = 0, back = null;
  const show = i => { idx = (i + list.length) % list.length; const f = by[list[idx]], v = $('video', lb); v.poster = M + f.id + '.webp'; v.src = M + f.id + '.mp4'; v.play().catch(() => {}); $('small', lb).textContent = f.client + ' · ' + f.project; $('h3', lb).textContent = f.title; $('.lbt p', lb).textContent = f.desc; $('.lbn span', lb).textContent = (idx + 1) + ' / ' + list.length; };
  const open = id => { list = $$('[data-film]').map(c => c.dataset.film).filter((x, i, a) => by[x] && a.indexOf(x) === i && !(document.querySelector(`.vc.hide[data-film="${x}"]`))); if (!list.includes(id)) list = [id]; back = document.activeElement; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; show(list.indexOf(id)); $('.x', lb).focus(); };
  const close = () => { if (!lb.classList.contains('open')) return; const v = $('video', lb); v.pause(); v.removeAttribute('src'); v.load(); lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; back && back.focus(); };
  $$('[data-film]').forEach(c => c.addEventListener('click', e => { if (!by[c.dataset.film] || e.metaKey || e.ctrlKey) return; e.preventDefault(); open(c.dataset.film); }));
  $('.x', lb).addEventListener('click', close);
  $('[data-prev]', lb).addEventListener('click', () => show(idx - 1));
  $('[data-next]', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { close(); setMenu(false); } if (!lb.classList.contains('open')) return; if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
  const h = location.hash.slice(1); if (by[h]) setTimeout(() => open(h), 300);

  /* filters */
  const fb = $$('[data-filter]');
  fb.forEach(b => b.addEventListener('click', () => { const k = b.dataset.filter; fb.forEach(x => x.setAttribute('aria-pressed', String(x === b))); $$('.grid .vc').forEach(c => c.classList.toggle('hide', k !== 'all' && !c.classList.contains('s-' + k))); }));

  /* service row hover preview */
  const sp = $('.sprev');
  if (sp && !touch) {
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; sp.style.left = x + 'px'; sp.style.top = y + 'px'; raf = requestAnimationFrame(loop); };
    $$('.srow[data-img]').forEach(r => {
      r.addEventListener('mouseenter', e => { sp.src = r.dataset.img; tx = x = e.clientX + 140; ty = y = e.clientY; sp.classList.add('on'); if (!raf) loop(); });
      r.addEventListener('mousemove', e => { tx = e.clientX + 140; ty = e.clientY; });
      r.addEventListener('mouseleave', () => { sp.classList.remove('on'); cancelAnimationFrame(raf); raf = 0; });
    });
  }

  /* brief -> WhatsApp */
  const form = $('form[data-brief]');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    $$('[required]', form).forEach(el => { const bad = !el.value.trim() || (el.type === 'tel' && el.value.replace(/\D/g, '').length < 10); el.closest('.f').classList.toggle('bad', bad); if (bad && ok) { el.focus(); ok = false; } });
    $('.err', form).textContent = ok ? '' : 'Lütfen işaretli alanları doldurun.';
    if (!ok) return;
    const v = n => (form.elements[n].value || '').trim();
    const need = $$('input[name=need]:checked', form).map(i => i.value);
    const text = ['Merhaba ROLE Medya, bir proje için görüşmek istiyorum.', '', `Ad soyad: ${v('ad')}`, v('firma') ? `Firma: ${v('firma')}` : '', `Telefon: ${v('tel')}`, need.length ? `İhtiyaç: ${need.join(', ')}` : '', '', v('msg')].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });
})();
