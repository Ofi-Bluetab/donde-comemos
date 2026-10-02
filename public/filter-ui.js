import {emptyFilters, matchesFilters, today} from './filters.js';

const form = document.querySelector('#filters-form');
let currentState;
export function ownFilters(state) {
  return state.day === today() ? state.users.find(u => u.id === state.user.id)?.filters || emptyFilters() : emptyFilters();
}
export function filterRows(rows, state) {return rows.filter(r => matchesFilters(r, ownFilters(state)));}
function describe(filters) {
  return [filters.max_minutes !== null ? `hasta ${filters.max_minutes} min a pie` : '',
    filters.max_price !== null ? `hasta ${Number(filters.max_price).toLocaleString('es-ES')} €` : '', filters.cuisine].filter(Boolean).join(' · ') || 'Sin filtros';
}
export function syncFilters(state, escapeHTML) {
  currentState = state;
  const filters = ownFilters(state);
  form.elements.max_minutes.value = filters.max_minutes ?? '';
  form.elements.max_price.value = filters.max_price ?? '';
  const cuisines = [...new Set([...state.restaurants.map(r => r.cuisine),'Asiática','Italiana','Mediterránea','Española','Mexicana','Casera','Hamburguesas'])].sort((a,b) => a.localeCompare(b,'es'));
  if (filters.cuisine && !cuisines.includes(filters.cuisine)) cuisines.push(filters.cuisine);
  form.elements.cuisine.innerHTML = '<option value="">Todas las cocinas</option>' + cuisines.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
  form.elements.cuisine.value = filters.cuisine;
  document.querySelectorAll('.member').forEach(label => {
    const user = state.users.find(u => u.id === Number(label.querySelector('input').value));
    const note = document.createElement('small');
    note.className = 'member-filters';
    note.textContent = describe(state.day === today() ? user.filters : emptyFilters());
    label.querySelector('.member-name').append(note);
  });
  document.querySelector('#filters-status').textContent = `Tus filtros de hoy: ${describe(filters)}.`;
}
export function setupFilters(api, action, load, invalidate, notify) {
  form.onsubmit = e => {
    e.preventDefault();
    action(e.submitter, async () => {
      const values = Object.fromEntries(new FormData(form));
      await api('filters', {max_minutes:values.max_minutes === '' ? null : Number(values.max_minutes), max_price:values.max_price === '' ? null : Number(values.max_price), cuisine:values.cuisine});
      invalidate(); await load(); notify('Tus filtros de hoy están guardados.');
    });
  };
  document.querySelector('#clear-filters').onclick = e => action(e.currentTarget, async () => {
    await api('filters', emptyFilters()); invalidate(); await load(); notify('Tus filtros de hoy se han quitado.');
  });
  // A tab left open overnight must not retain yesterday's criteria.
  setInterval(() => {
    if (currentState && currentState.day !== today() && !document.hidden) {currentState = null; invalidate(); load().catch(e => notify(e.message));}
  }, 30000);
}
