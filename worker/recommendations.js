const categories = ['quality', 'service', 'value', 'distance'];
const average = rating => categories.reduce((sum, category) => sum + rating[category], 0) / 4;

export function recommendations(restaurants, ratings, members) {
  const selected = new Set(members);
  const byRestaurant = new Map(restaurants.map(r => [r.id, r]));
  const favorites = ratings.filter(r => selected.has(r.user_id) && average(r) >= 4)
    .map(r => byRestaurant.get(r.restaurant_id)).filter(Boolean);
  const grouped = new Map();
  for (const rating of ratings) {
    if (!grouped.has(rating.restaurant_id)) grouped.set(rating.restaurant_id, []);
    grouped.get(rating.restaurant_id).push(rating);
  }
  return restaurants.map(restaurant => {
    const community = grouped.get(restaurant.id) || [];
    const own = community.filter(r => selected.has(r.user_id));
    const baseline = community.length ? community.reduce((sum, r) => sum + average(r), 0) / community.length : 3;
    let score = (own.reduce((sum, r) => sum + average(r), 0) + baseline) / (own.length + 1);
    const affinity = favorites.filter(r => r.cuisine.toLocaleLowerCase('es') === restaurant.cuisine.toLocaleLowerCase('es'))
      .reduce((best, r) => Math.max(best, 1 - Math.abs(r.price - restaurant.price) / 20 - Math.abs(r.minutes - restaurant.minutes) / 30), 0);
    if (!own.length && affinity) score = Math.min(5, score + .6 * affinity);
    const reason = own.length ? `${own.length} de ${selected.size} participantes lo han valorado.`
      : affinity ? 'Cocina, precio y distancia similares a sitios que os gustan.'
      : 'Sin valoraciones del grupo; una opción para explorar.';
    return {...restaurant, score: Math.round(score * 100) / 100, coverage: own.length, reason, new: !own.length};
  }).sort((a, b) => b.score - a.score || a.minutes - b.minutes || a.id - b.id);
}
