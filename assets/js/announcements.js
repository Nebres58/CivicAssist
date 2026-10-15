// Announcements: image cards on home; featured + searchable list on announcements page.
(() => {
  const { el, json, status } = CA;
  const pg = document.body.dataset.page;
  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const todayISO = () => { const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); };
  const expired = a => !!a.expires && a.expires < todayISO();
  const load = () => json('assets/data/announcements.json').then(d => { if (!Array.isArray(d) || !d.length) throw new Error('empty'); return d; });
  const fail = box => status(box, 'error', 'Announcements could not be loaded. Please try again.', CA.reloadBtn());
  const byDate = (arr, dir) => arr.slice().sort((a, b) => dir * (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const meta = a => el('p', { class: 'meta' }, [CA.chip('calendar', fmt(a.date)), el('span', { class: 'tag ' + (expired(a) ? 'expired' : 'active'), text: expired(a) ? 'Expired' : 'Active' })]);
  const card = (a, lvl, feat, full) => el('article', { class: 'card' + (feat ? ' feature' : ''), id: full ? a.id : null }, [CA.img(a.category), el('div', { class: 'body' }, [
    el('span', { class: 'tag', text: a.category }), el(lvl, { text: a.title }), meta(a), el('p', { text: a.summary }),
    full ? el('details', {}, [el('summary', { text: 'Read More' }), el('p', { text: a.description }), el('p', { class: 'meta', text: a.expires ? 'Expires: ' + fmt(a.expires) : 'No expiration date' })])
      : el('div', { class: 'actions' }, el('a', { class: 'btn sm', href: 'announcements.html#' + a.id, text: 'Read More' }))])]);
  if (pg === 'home') {
    const box = document.getElementById('latest');
    load().then(d => box.replaceChildren(el('div', { class: 'grid' }, byDate(d, -1).slice(0, 3).map(a => card(a, 'h3', false, false))))).catch(() => fail(box));
  }
  if (pg === 'announcements') {
    const q = document.getElementById('q'), cat = document.getElementById('cat'), sort = document.getElementById('sort');
    const list = document.getElementById('list'), count = document.getElementById('count');
    let all = [];
    const render = () => {
      const terms = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const r = byDate(all.filter(a => (!cat.value || a.category === cat.value) && terms.every(t => [a.title, a.category, a.summary, a.description].join(' ').toLowerCase().includes(t))), sort.value === 'old' ? 1 : -1);
      count.textContent = r.length + ' of ' + all.length + ' announcements shown';
      if (!r.length) return status(list, 'empty', 'No announcements match your search. Try other keywords or clear the filters.');
      const feat = !terms.length && !cat.value && sort.value === 'new' && r.length > 1;
      list.replaceChildren(...(feat ? [card(r[0], 'h2', true, true)] : []), el('div', { class: 'grid' }, r.slice(feat ? 1 : 0).map(a => card(a, 'h2', false, true))));
    };
    q.addEventListener('input', render);
    [cat, sort].forEach(c => c.addEventListener('change', render));
    document.getElementById('filters').addEventListener('submit', e => e.preventDefault());
    document.getElementById('clear').addEventListener('click', () => { q.value = ''; cat.value = ''; sort.value = 'new'; render(); q.focus(); });
    load().then(d => {
      all = d; [...new Set(d.map(a => a.category))].sort().forEach(c => cat.append(el('option', { value: c, text: c }))); render();
      const h = decodeURIComponent(location.hash.slice(1)); const c = h && document.getElementById(h);
      if (c) { const dt = c.querySelector('details'); if (dt) dt.open = true; c.scrollIntoView(); }
    }).catch(() => { count.textContent = ''; fail(list); });
  }
})();
