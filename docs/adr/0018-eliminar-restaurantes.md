# ADR 0018 — Eliminar restaurantes del catálogo común

Estado: aceptada. Fecha: 2026-10-05.

El usuario solicita eliminar restaurantes ya añadidos. Se mantiene el catálogo común de ADR 0008 y sus permisos colaborativos: cualquier cuenta autorizada puede añadir y eliminar.

Cada tarjeta ofrece Eliminar con confirmación explícita del nombre y del borrado de todas sus valoraciones. POST /api/restaurants/delete exige sesión, origen permitido e identificador entero positivo. DELETE RETURNING distingue inexistentes (404); la relación ON DELETE CASCADE elimina notas de todos los usuarios en la misma operación. No requiere migración.

Tras éxito se recargan catálogo y contador y se invalidan recomendaciones y cercanos. Cancelar no escribe; un fallo mantiene el catálogo visible y permite reintento. Un local eliminado puede volver a aparecer como descubrimiento público OSM y añadirse de nuevo, sin recuperar notas/precio anteriores. No se eliminan datos reales durante QA remota.
