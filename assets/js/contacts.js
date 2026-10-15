// Emergency contacts: search/filter. Phone links only for verified numbers.
(() => {
  const { el, json, status } = CA;
  const q = document.getElementById('q'), cat = document.getElementById('cat'), list = document.getElementById('list'), count = document.getElementById('count');
  let all = [];
  const validTel = c => c.verified === true && typeof c.number === 'string' && /^\+?[\d][\d\s()-]{2,19}$/.test(c.number);
  const card = c => el('article', { class: 'card' }, [
    el('h2', { text: c.name }), el('p', {}, el('span', { class: 'tag', text: c.category })), el('p', { text: c.description }),
    el('p', { class: 'meta', text: 'Hours: ' + (c.hours || 'Not specified') }), el('p', { class: 'meta', text: c.instructions || '' }),
    validTel(c) ? el('a', { class: 'btn', href: 'tel:' + c.number.replace(/[^\d+]/g, ''), text: 'Call ' + c.number })
      : el('p', { class: 'notice warn', text: 'Example record: contact information needs verification.' })
  ]);
  const render = () => {
    const terms = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const r = all.filter(c => (!cat.value || c.category === cat.value) && terms.every(t => [c.name, c.category, c.description].join(' ').toLowerCase().includes(t)));
    count.textContent = r.length + ' of ' + all.length + ' contacts shown';
    if (!r.length) return status(list, 'empty', 'No contacts match your search. Try other keywords or clear the filters.');
    list.replaceChildren(el('div', { class: 'grid' }, r.map(card)));
  };
  q.addEventListener('input', render);
  cat.addEventListener('change', render);
  document.getElementById('filters').addEventListener('submit', e => e.preventDefault());
  document.getElementById('clear').addEventListener('click', () => { q.value = ''; cat.value = ''; render(); q.focus(); });
  json('assets/data/contacts.json').then(d => {
    if (!Array.isArray(d) || !d.length) throw new Error('empty');
    all = d; [...new Set(d.map(c => c.category))].forEach(c => cat.append(el('option', { value: c, text: c }))); render();
  }).catch(() => { count.textContent = ''; status(list, 'error', 'Contacts could not be loaded. Please try again.', CA.reloadBtn()); });
})();
