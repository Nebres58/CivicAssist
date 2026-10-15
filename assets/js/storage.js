// Favorites storage: validates data, falls back to memory if localStorage is unavailable.
window.CA = window.CA || {};
CA.store = (() => {
  const KEY = 'civicassist.favorites';
  let mem = [];
  const get = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (!Array.isArray(v)) return mem;
      mem = [...new Set(v.filter(x => typeof x === 'string'))];
    } catch (e) { /* corrupted or blocked storage */ }
    return mem;
  };
  const set = (arr) => {
    mem = [...new Set(arr)];
    try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* ignore */ }
  };
  const has = (id) => get().includes(id);
  const toggle = (id) => {
    const f = get().slice(); const i = f.indexOf(id);
    if (i < 0) f.push(id); else f.splice(i, 1);
    set(f); return i < 0;
  };
  return { get, has, toggle };
})();
