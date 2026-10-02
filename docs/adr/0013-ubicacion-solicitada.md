# ADR 0013: ubicación solicitada por el usuario

2026-10-02. Aceptado. Amplía 0010.

«Localizar dirección» solicita geolocalización solo tras pulsación explícita. Una lectura, sin seguimiento. Se guarda como salida personal mediante API office existente, etiquetada «Mi ubicación» sin inventar dirección postal. Informar antes de pulsar del guardado y uso de coordenadas por proveedores al buscar. Mantener búsqueda manual CartoCiudad con botón «Buscar dirección escrita». Denegación, falta de soporte y timeout conservan la salida anterior. Guardado solo si no cambió la dirección mientras se esperaba. Sin nueva fuente, clave, coste ni migración.
