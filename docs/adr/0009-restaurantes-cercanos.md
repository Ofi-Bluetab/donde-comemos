# ADR 0009: descubrimiento cercano y mapa

Fecha: 2026-10-02. Estado: aceptado.

Se mantiene Workers/D1 Free y el listado común (0008). Overpass aporta restaurantes OSM; FOSSGIS OSRM foot calcula rutas peatonales en una matriz, nunca tiempos por distancia recta. Leaflet local y teselas OSM muestran oficina y resultados con atribución. Sin claves, geolocalización personal ni Nominatim. Proveedores públicos sin SLA: errores explícitos, catálogo independiente. Caché D1 de seis horas, consultas acotadas a 2 km/30 destinos y limitación global por proveedor a una petición por segundo. Se informa de búsqueda limitada, no exhaustiva.

La referencia inicial es la zona de Plaza de Pablo Ruiz Picasso, 11, Madrid, indicada por el usuario. Coordenadas aproximadas de la plaza, etiquetadas; cada cuenta puede ajustar y guardar el punto mediante mapa o coordenadas. No se presume el portal exacto. La búsqueda usa ese origen y exclusivamente filtros vigentes de participantes seleccionados, validados en servidor.

No se inventa presupuesto: OSM carece normalmente de precio por persona. Precio confirmado por el equipo al guardar un descubrimiento; identificador OSM único permite reutilizarlo. Sin precio conocido y con presupuesto activo queda fuera de recomendaciones. Candidatos compatibles con cocina/distancia pero sin precio aparecen en una sección separada para completar datos, nunca como compatibles. Cocina desconocida no cumple un filtro de cocina. Tiempo no calculable tampoco cumple un límite. Tiempos a pie son estimaciones, no promesas; no incluyen comer ni vuelta.

Migración aditiva 0004: coordenadas/identificador externo de restaurantes, origen personal y caché/límites de proveedores. Datos, contraseñas y tablas anteriores conservados. Invalidar resultados al cambiar participantes, filtros u origen. Importar exige precio y cocina, reutilizando el formulario existente.
