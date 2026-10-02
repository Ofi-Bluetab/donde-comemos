export const normalizeCuisine = value => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
export const today = (date = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Madrid', year:'numeric', month:'2-digit', day:'2-digit'}).format(date);
export const emptyFilters = () => ({max_minutes:null, max_price:null, cuisine:''});
export function matchesFilters(restaurant, filters) {
  return (filters.max_minutes === null || Number.isFinite(restaurant.minutes) && restaurant.minutes <= filters.max_minutes)
    && (filters.max_price === null || Number.isFinite(restaurant.price) && restaurant.price <= filters.max_price)
    && (!filters.cuisine || normalizeCuisine(restaurant.cuisine || '') === normalizeCuisine(filters.cuisine));
}
