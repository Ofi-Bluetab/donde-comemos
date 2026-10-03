# ADR 0017: dirección aproximada y mapa junto al listado

2026-10-03. Aceptado por petición del usuario. Supersede coordenadas visibles/sin geocodificación inversa de ADR0016 y mapa secundario plegable de ADR0012.

Reutilizar CartoCiudad reverseGeocode (IGN/CNIG) mediante endpoint autenticado, caché/límite existentes. Dirección del portal más próximo (hasta 350m según documentación oficial), marcada como aproximada. Mantener coordenadas GPS como origen real, nunca sustituirlas por las del portal. Sin costes, búsqueda escrita ni API Google. Si no hay dirección o falla proveedor, conservar punto y mostrar ubicación sin dirección disponible, sin coordenadas visibles.

Resolver ubicaciones guardadas sin dirección al abrir cercanos (solo lectura), y nuevas al localizar/ajustar antes de guardar. No mover ubicaciones ajenas ni guardar resultados obsoletos. Mapa siempre visible a la derecha, listado a la izquierda, tarjetas compactas; en móvil apilados y mapa de altura acotada.

Fuente: https://www.cartociudad.es/web/portal/directorio-de-servicios/geoprocesamiento
