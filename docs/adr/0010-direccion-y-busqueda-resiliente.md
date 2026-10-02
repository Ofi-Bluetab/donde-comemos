# ADR 0010: dirección de salida y búsquedas verificables

2026-10-02. Aceptado; modifica 0009.

El usuario solicita dirección en lugar de coordenadas, corregir fallo 503 observado con 500 m y comprobar mapa. CartoCiudad IGN/CNIG geocodifica direcciones de España sin claves mediante búsqueda explícita, sin autocomplete. Se ofrecen candidatos para confirmar el portal, y se conserva etiqueta junto a coordenadas internas en D1. El portal 11 de Plaza Pablo Ruiz Picasso, Madrid figura en la respuesta oficial en 40.45002533227958,-3.693875262562316; sustituye referencia aproximada inicial. Ubicaciones personales ya ajustadas no se sobrescriben. Mapa permite ajustar acceso, sin mostrar latitud/longitud; no se vincula una dirección nueva al punto viejo sin localizarla.

Overpass devuelve 406 en una consulta POST probada y 200 con GET equivalente. Usar GET codificado y Accept JSON; mensajes distinguen fuente de restaurantes y rutas, con diagnóstico de proveedor/status sin registrar direcciones ni usuarios. Una respuesta Overpass con remark/error nunca se cachea como catálogo válido. Normalizar coordenadas para claves reutilizables; reutilizar caché mayor para radios menores con distancia geográfica, y añadir ID estable de cada elemento al orden para matriz consistente. Caché fresca seis horas, última respuesta útil hasta siete días solo ante fallo externo, indicando antigüedad. No relajar filtros ni inventar rutas a pie si falla OSRM.

Mapa reserva espacio y muestra estado de carga; teselas fallidas detectadas, mensaje y botón para reintentar, lista utilizable. Esperar teselas visibles y recalcular tamaño al abrir/redimensionar, centrar origen/candidatos; limpiar mapa cuando cambia usuario. No afirmar disponibilidad futura garantizada por una comprobación puntual.

Se mantienen OSM/Leaflet y FOSSGIS gratuitos. Google Maps URLs se puede abrir sin clave ni cuenta de facturación; añadir enlace de ruta peatonal al resultado. Embed API es gratuito pero exige clave y cuenta de facturación; JavaScript/Places/Routes tienen cuotas y posibles cobros. No habilitar APIs Google ni facturación bajo requisito de coste cero.

Migración 0005 aditiva conserva datos; pruebas incluyen fallo de fuente, respuesta incompleta, caché de respaldo, dirección/selección, radios 500/1000/2000 y mapa escritorio/móvil antes de publicar.
