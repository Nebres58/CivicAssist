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
})();

// Icons, images, cards, footer (visual layer)
(() => {
  const { el } = CA; const NS = 'http://www.w3.org/2000/svg';
  const P = {"search": "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.5-4.5", "doc": "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6", "health": "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z", "assist": "M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 21v-3a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3", "business": "M3 8h18v12H3zM9 8V5h6v3M3 13h18", "education": "M3 5h7a3 3 0 0 1 2 1 3 3 0 0 1 2-1h7v13h-7a3 3 0 0 0-2 1 3 3 0 0 0-2-1H3zM12 6v13", "leaf": "M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7", "alert": "M12 3l10 18H2zM12 10v4M12 17.5v.5", "phone": "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z", "calendar": "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", "pin": "M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z", "clock": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2", "megaphone": "M3 10v4h4l8 5V5L7 10zM18 9a4 4 0 0 1 0 6", "home": "M3 11l9-8 9 8M5 10v10h14V10", "info": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5", "shield": "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z", "flame": "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 3 4", "users": "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 5a3 3 0 0 1 0 6M21 20v-2a4 4 0 0 0-3-4", "star": "M12 3l2.8 6 6.2.7-4.6 4.3 1.3 6.2L12 17l-5.7 3.2 1.3-6.2L3 9.7 9.2 9z"};
  CA.ico = (n) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'ico'); s.setAttribute('aria-hidden', 'true');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', P[n] || P.info); s.append(p); return s; };
  const CI = {'Civil Documents':'doc','Community Assistance':'assist','Health and Welfare':'health','Business and Permits':'business','Education and Youth':'education','Environmental Services':'leaf','Police':'shield','Fire and Rescue':'flame','Medical Emergency':'health','Disaster Risk Reduction':'alert','Community Office':'home','Utility Emergency Contacts':'alert'};
  const IM = {'Civil Documents':'civil','Community Assistance':'assist','Health and Welfare':'health','Business and Permits':'business','Education and Youth':'education','Environmental Services':'environment','Community Events':'community','Public Notices':'civil','Environmental Programs':'environment','Health Information':'health','Education':'education','General Announcements':'community','Police':'emergency','Fire and Rescue':'emergency','Medical Emergency':'health','Disaster Risk Reduction':'emergency','Community Office':'civil','Utility Emergency Contacts':'emergency'};
  CA.icon = (c) => el('span', { class: 'icon', 'aria-hidden': 'true' }, CA.ico(CI[c] || 'info'));
  CA.img = (cat, cls = 'thumb') => { const i = el('img', { src: 'assets/images/' + (IM[cat] || 'community') + '.svg', alt: 'Illustration for ' + cat, loading: 'lazy', width: '800', height: '500' });
    i.addEventListener('error', () => { i.src = 'assets/images/placeholder.svg'; }, { once: true }); return el('div', { class: cls }, i); };
  CA.chip = (ic, text) => el('span', { class: 'chip' }, [CA.ico(ic), text]);
  CA.serviceCard = (s, level = 'h3') => el('article', { class: 'card' }, [CA.img(s.category), el('div', { class: 'body' }, [
    el('span', { class: 'tag', text: s.category }), el(level, { text: s.name }), el('p', { text: s.short }),
    s.hours ? CA.chip('clock', s.hours) : null,
    el('div', { class: 'actions' }, [el('a', { class: 'btn sm', href: 'service-details.html?id=' + encodeURIComponent(s.id), text: 'View Details' }), CA.favBtn(s.id, s.name)])])]);
  document.querySelectorAll('[data-ico]').forEach(e => e.prepend(CA.ico(e.dataset.ico)));
  const nl = document.querySelector('.nav-list');
  if (nl) { const a = el('a', { href: 'services.html', 'aria-label': 'Search services', class: 'navsearch' }, [CA.ico('search'), el('span', { text: 'Search' })]); nl.append(el('li', {}, a)); }
  const ftr = document.getElementById('site-footer');
  if (ftr) { const L = (h, t) => el('li', {}, el('a', { href: h, text: t }));
    ftr.append(el('div', { class: 'wrap fgrid' }, [
      el('div', {}, [el('strong', { class: 'fbrand', text: 'CivicAssist' }), el('p', { text: 'A community information portal built as a student demonstration project.' })]),
      el('nav', { 'aria-label': 'Footer' }, [el('h2', { text: 'Explore' }), el('ul', {}, [L('index.html', 'Home'), L('services.html', 'Services'), L('announcements.html', 'Announcements'), L('emergency-contacts.html', 'Emergency Contacts'), L('about.html', 'About')])]),
      el('div', {}, [el('h2', { text: 'Service categories' }), el('ul', {}, CA.CATS.map(c => L('services.html?cat=' + encodeURIComponent(c), c)))]),
      el('div', {}, [el('h2', { text: 'Information notice' }), el('p', { text: 'All content is fictional demonstration data. Verify real information with official local offices. Only your favorite service IDs are saved in your own browser; no personal data is collected.' }), el('p', { text: '© 2026 CivicAssist student project. Not affiliated with any government agency.' })])]));
  }
})();
