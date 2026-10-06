# ADR 0020 — Buscar un restaurante por nombre y añadirlo desde el mapa

2026-10-06. Aceptada. Amplía ADR 0009/0019 sin sustituir filtros de recomendaciones.

En Añadir restaurante, búsqueda explícita por nombre (mínimo 2 caracteres), sin autocomplete, dentro de 2 km de la salida guardada. Reutiliza fuente OSM del navegador, validación de elementos y cálculo de rutas existentes. Endpoint autenticado restaurants/search busca el nombre antes del límite de 30 destinos e ignora filtros diarios únicamente para esta selección de alta. No altera recomendaciones ni guarda mientras se busca.

Mapa modal con origen azul y coincidencias. Pulsar marcador selecciona los datos reales y ofrece Añadir a la lista. Se completan nombre/cocina/dirección/tiempo cuando disponibles, se exige precio confirmado y cualquier dato requerido faltante. Sin precios inventados ni inserción al pulsar fondo del mapa. Listado equivalente facilita teclado/móvil. ID OSM conserva deduplicación existente.

Entrada manual sigue disponible para sitios fuera del radio o ausentes en OSM. Cambiar nombre elimina selección/ID anterior; cerrar/reabrir cancela resultados obsoletos. No nuevas migraciones, proveedores ni pagos.
