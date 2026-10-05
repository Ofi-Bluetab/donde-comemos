# ADR 0019 — Recuperar consultas de restaurantes

2026-10-05. Aceptada. Supersede transporte GET obligatorio de ADR 0010 y amplía 0011.

La consulta pública actual devuelve HTTP 406 con GET y 200 con POST (726 elementos reales). El comportamiento difiere del observado el 2 de octubre. Se usa POST form-urlencoded documentado por Overpass; ante 406 se prueba GET en el mismo servidor. Sin cambiar la consulta, filtros, precios, caché ni origen del usuario.

Solo ante indisponibilidad (timeout, 5xx, datos incompletos) del servidor principal se intenta una instancia pública alternativa Private.coffee. Nunca se cambia de instancia para evadir 429 ni errores de autorización. Un OVERPASS_URL explícito limita la consulta a ese destino. Cada intento tiene 18 segundos; máximo tres intentos incluyendo alternativa de transporte. Se conserva límite global, frescura 6 horas y respaldo hasta 7 días con aviso. Datos incompletos/errores no se cachean.

Private.coffee no respondió en la comprobación actual del host; es una alternativa de mejor esfuerzo, no una garantía. Verificar con proveedores reales localmente y registrar por separado verificación remota autorizada. No se habilitan servicios de pago ni tareas periódicas.

La prueba remota de POST desde Cloudflare también agotó el tiempo. Por ello la interfaz consulta OSM directamente desde el navegador, sin cookies ni cuentas/filtros enviados al proveedor. Reutiliza respuesta en memoria seis horas por punto (máximo ocho puntos); ante fallo intenta la API y su caché. CSP permite únicamente los dos orígenes Overpass fijos además de los existentes.

El cliente remite elementos públicos reducidos a /api/nearby (máximo 512 KB, solo esta ruta). El servidor exige sesión/origen y valida hasta 2000 elementos: tipos OSM/ID positivos, coordenadas dentro de 2100 m del origen guardado, textos acotados. Aplica radio exacto/filtros vigentes y usa precios del catálogo y rutas calculadas por servidor; nunca confía en precios/tiempos enviados por cliente. Datos cliente no entran en caché compartida ni crean restaurantes. Un cliente modificado puede falsear nombres/elementos en sus propios resultados; no se presentan como datos certificados ni se propagan a otros usuarios.
