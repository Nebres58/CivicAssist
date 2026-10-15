// Services: home search/categories/featured, directory, and details page.
(() => {
  const { el, json, status, store, CATS } = CA;
  const pg = document.body.dataset.page;
  const loadAll = () => json('assets/data/services.json').then(d => { if (!Array.isArray(d) || !d.length) throw new Error('empty'); return d; });
  const fail = (box) => status(box, 'error', 'Services could not be loaded. Please check your connection and try again.', CA.reloadBtn());

  if (pg === 'home') {
    const f = document.getElementById('home-search');
    f.addEventListener('submit', e => { e.preventDefault(); const q = f.elements.q.value.trim(); location.href = 'services.html' + (q ? '?q=' + encodeURIComponent(q) : ''); });
    const cats = document.getElementById('cats');
    CATS.forEach(c => cats.append(el('a', { class: 'card cat', href: 'services.html?cat=' + encodeURIComponent(c) }, [CA.icon(c), el('span', { text: c })])));
    const box = document.getElementById('featured');
    loadAll().then(d => box.replaceChildren(el('div', { class: 'grid' }, d.filter(s => s.featured).slice(0, 6).map(s => CA.serviceCard(s))))).catch(() => fail(box));
  }

  if (pg === 'services') {
    const p = new URLSearchParams(location.search);
    const q = document.getElementById('q'), cat = document.getElementById('cat'), sort = document.getElementById('sort'), favs = document.getElementById('favs');
    const list = document.getElementById('list'), count = document.getElementById('count');
    CATS.forEach(c => cat.append(el('option', { value: c, text: c })));
    q.value = (p.get('q') || '').slice(0, 100);
    if (CATS.includes(p.get('cat'))) cat.value = p.get('cat');
    favs.checked = p.get('fav') === '1';
    let all = [];
    const render = () => {
      const terms = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const fv = store.get();
      const r = all.filter(s => (!cat.value || s.category === cat.value) && (!favs.checked || fv.includes(s.id)) &&
        terms.every(t => [s.name, s.category, s.short, s.detail, ...(s.keywords || [])].join(' ').toLowerCase().includes(t)));
      r.sort((a, b) => a.name.localeCompare(b.name) * (sort.value === 'za' ? -1 : 1));
      count.textContent = r.length + ' of ' + all.length + ' services shown';
      const u = new URLSearchParams();
      if (q.value.trim()) u.set('q', q.value.trim()); if (cat.value) u.set('cat', cat.value); if (favs.checked) u.set('fav', '1');
      history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
      if (!r.length) return status(list, 'empty', favs.checked && !fv.length ? 'You have no saved services yet.' : 'No services match your search. Try other keywords or clear the filters.');
      list.replaceChildren(el('div', { class: 'grid' }, r.map(s => CA.serviceCard(s))));
    };
    q.addEventListener('input', render);
    [cat, sort, favs].forEach(c => c.addEventListener('change', render));
    document.getElementById('filters').addEventListener('submit', e => e.preventDefault());
    document.getElementById('clear').addEventListener('click', () => { q.value = ''; cat.value = ''; sort.value = 'az'; favs.checked = false; render(); q.focus(); });
    document.addEventListener('favchange', () => { if (favs.checked) render(); });
    loadAll().then(d => { all = d; render(); }).catch(() => { count.textContent = ''; fail(list); });
  }

  if (pg === 'detail') {
    const box = document.getElementById('detail');
    const id = new URLSearchParams(location.search).get('id') || '';
    const back = () => el('a', { class: 'btn', href: 'services.html', text: 'Back to Services' });
    const sec = (h, c) => el('section', { class: 'panel' }, [el('h2', { text: h }), c]);
    const ul = a => el('ul', {}, a.map(t => el('li', { text: t })));
    loadAll().then(d => {
      const s = /^[\w-]{1,40}$/.test(id) ? d.find(x => x.id === id) : null;
      if (!s) return status(box, 'error', 'That service could not be found. The link may be invalid.', back());
      document.title = s.name + ' | CivicAssist';
      let rel = d.filter(x => x.category === s.category && x.id !== s.id);
      if (!rel.length) rel = d.filter(x => x.id !== s.id).slice(0, 3);
      box.replaceChildren(
        el('p', {}, back()),
        el('h1', { text: s.name }),
        el('p', {}, [el('span', { class: 'tag', text: s.category }), CA.favBtn(s.id, s.name)]),
        el('p', { class: 'notice', text: 'Demonstration data only. Requirements, fees and schedules are fictional examples; verify with the appropriate local office.' }),
        sec('Description', el('p', { text: s.detail })),
        sec('Illustrative requirements', ul(s.requirements || [])),
        sec('Preparation instructions', el('ol', {}, (s.steps || []).map(t => el('li', { text: t })))),
        sec('Office information', el('p', { text: s.office + (s.hours ? ' — ' + s.hours : '') + (s.processing ? '. ' + s.processing : '') })),
        sec('Important reminders', el('p', { text: s.notes || 'Verify details with the local office.' })),
        el('h2', { text: 'Related services' }),
        el('div', { class: 'grid' }, rel.slice(0, 3).map(x => CA.serviceCard(x)))
      );
    }).catch(() => fail(box));
  }
})();
