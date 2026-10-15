// Shared utilities, header/footer, and reusable components.
(() => {
  const CA = window.CA = window.CA || {};
  const NAV = [['index.html','Home'],['services.html','Services'],['announcements.html','Announcements'],['emergency-contacts.html','Emergency Contacts'],['about.html','About']];
  CA.CATS = ['Civil Documents','Community Assistance','Health and Welfare','Business and Permits','Education and Youth','Environmental Services'];
  const ICON = {'Civil Documents':'CD','Community Assistance':'CA','Health and Welfare':'HW','Business and Permits':'BP','Education and Youth':'EY','Environmental Services':'ES'};
  // Safe DOM builder: only textContent / attributes, never innerHTML.
  const el = CA.el = (tag, attrs = {}, kids = []) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') e.textContent = v; else if (k === 'class') e.className = v; else e.setAttribute(k, v);
    }
    [].concat(kids).forEach(c => { if (c) e.append(c); });
    return e;
  };
  CA.icon = (c) => el('span', { class: 'icon', 'aria-hidden': 'true', text: ICON[c] || 'CA' });
  CA.json = async (path) => { const r = await fetch(path); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  CA.reloadBtn = () => { const b = el('button', { type: 'button', class: 'btn', text: 'Try again' }); b.addEventListener('click', () => location.reload()); return b; };
  CA.status = (box, type, msg, extra) => box.replaceChildren(el('div', { class: 'state ' + type, role: type === 'error' ? 'alert' : 'status' }, [el('p', { text: msg }), extra]));
  CA.favBtn = (id, name) => {
    const b = el('button', { type: 'button', class: 'btn alt sm', 'aria-label': 'Favorite: ' + name });
    const paint = () => { const on = CA.store.has(id); b.textContent = on ? '★ Saved' : '☆ Save'; b.setAttribute('aria-pressed', String(on)); };
    paint();
    b.addEventListener('click', () => { CA.store.toggle(id); paint(); document.dispatchEvent(new CustomEvent('favchange')); });
    return b;
  };
  CA.serviceCard = (s, level = 'h3') => el('article', { class: 'card' }, [
    el('div', { class: 'head' }, [CA.icon(s.category), el('div', {}, [el(level, { text: s.name }), el('span', { class: 'tag', text: s.category })])]),
    el('p', { text: s.short }),
    el('div', { class: 'actions' }, [el('a', { class: 'btn sm', href: 'service-details.html?id=' + encodeURIComponent(s.id), text: 'View Details' }), CA.favBtn(s.id, s.name)])
  ]);

  const path = location.pathname.split('/').pop() || 'index.html';
  const hdr = document.getElementById('site-header');
  if (hdr) {
    const ul = el('ul', { class: 'nav-list' }, NAV.map(([h, t]) => {
      const a = el('a', { href: h, text: t });
      if (h === path || (path === 'service-details.html' && h === 'services.html')) a.setAttribute('aria-current', 'page');
      return el('li', {}, a);
    }));
    const nav = el('nav', { id: 'nav', 'aria-label': 'Main' }, ul);
    const btn = el('button', { type: 'button', class: 'menu-btn', 'aria-expanded': 'false', 'aria-controls': 'nav', text: 'Menu' });
    const close = () => { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => btn.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); btn.focus(); } });
    hdr.append(el('div', { class: 'wrap bar' }, [el('a', { class: 'brand', href: 'index.html' }, ['Civic', el('span', { text: 'Assist' })]), btn, nav]));
  }
  const ftr = document.getElementById('site-footer');
  if (ftr) ftr.append(el('div', { class: 'wrap fgrid' }, [
    el('div', {}, [el('strong', { text: 'CivicAssist' }), el('p', { text: 'A community information portal built as a student demonstration project.' })]),
    el('nav', { 'aria-label': 'Footer' }, el('ul', {}, NAV.map(([h, t]) => el('li', {}, el('a', { href: h, text: t }))))),
    el('div', {}, [el('p', { text: 'All content is fictional demonstration data. Verify real information with official local offices.' }), el('p', { text: '© 2026 CivicAssist student project. Not affiliated with any government agency.' })])
  ]));
})();
