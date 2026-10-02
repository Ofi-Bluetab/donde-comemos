# ADR 0011: disponibilidad inicial de restaurantes cercanos

2026-10-02. Aceptado. Amplía 0010.

El smoke tras publicación obtuvo 503 de Overpass desde Workers pese a respuesta 200 a la misma consulta desde CLI local. No atribuir una causa exacta sin diagnósticos. Proveedores comunitarios siguen sin SLA. La instancia alternativa Private.coffee consultada no respondió en 25 s; no presentarla como solución verificada.

Se prepara un respaldo de datos públicos reales de OSM para la dirección de oficina indicada por el usuario mediante una consulta explícita y acotada durante publicación. Se incorpora únicamente la respuesta cruda válida (con fecha de obtención y copyright) a la caché D1 existente, con sus mismas seis horas de frescura y siete días máximos de respaldo. No se crean restaurantes, precios ni valoraciones y no se copian cuentas. Workers sigue aplicando filtros y calcula rutas reales; el respaldo no equivale a resolver ni garantizar la conexión futura con proveedores.

Fuente alternativa oficial Lambert solo si responde y se verifica desde Workers, de acuerdo con la excepción documentada por Overpass para un servidor no operativo; no rotar entre servidores para eludir límites. Ante datos recientes existentes, no esperar una llamada fallida para responder: la caché comparte búsqueda del área entre participantes/radios. Precios y filtros personales no forman parte del respaldo público.

No añade coste, servicios de pago, claves ni tareas periódicas. La publicación no se declara verificada hasta que el smoke online de tres radios y las rutas pasan. Documentar cualquier limitación que persista.

Resultado: Lambert también agotó el tiempo desde Workers; se mantiene el proveedor principal. Los diagnósticos confirmaron TimeoutError sin respuesta HTTP. Consulta acotada a timeout 10 s y maxsize 32 MiB, espera HTTP 35 s. Se incorporaron 724 elementos públicos de la caché local de la oficina conservando su caducidad original (2026-10-02T17:46:22.682Z). El smoke remoto pasó con esa fuente y rutas reales. scripts/prepare-office-cache.mjs prepara SQL por fragmentos para evitar el límite de tamaño de sentencia D1; no aplica cambios remotos. La renovación directa de Overpass sigue sin verificarse correctamente.
