# ADR 0016: salida por ubicación sin búsqueda escrita

2026-10-03. Aceptado por petición del usuario. Supersede la alternativa de dirección escrita en la interfaz de ADR 0013 y la entrada editable de ADR 0010.

Usar geolocalización explícita y mostrar el punto guardado en un campo de solo lectura: etiqueta y coordenadas con cinco decimales para «Mi ubicación». No inventar una dirección postal ni añadir geocodificación inversa/proveedores. Retirar formulario/botón y llamadas de búsqueda escrita de la interfaz. Conservar datos guardados, API de dirección histórica y ajuste en mapa; sin migración ni eliminación de datos.

Guardar y actualizar la salida visible al completar geolocalización. Errores mantienen la salida anterior y ofrecen reintentar/habilitar permiso, sin sugerir dirección escrita. Verificar éxito, persistencia al sincronizar y errores con ubicación simulada, sin pedir ubicación personal real.
