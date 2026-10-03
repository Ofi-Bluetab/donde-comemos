# Registro de cambios

## 2026-10-02

- Publicada en https://donde-comemos.mesa-equipo-dfv.workers.dev con D1 WEUR y plan Free.
- Autorización por dispositivo completada, base y secretos configurados, subdominio gratuito registrado.
- Eliminado límite CPU personalizado rechazado por Free (API 100328); usados límites predeterminados gratuitos.
- Pruebas remotas completas, persistencia tras redeploy y aislamiento de notas OK; QA temporal retirada.
- Exportación inicial y archivo local de invitación entregados, sin importar pruebas anteriores.

- Sustituido intento OAuth caducado por conexión con código de dispositivo; publicación pendiente de autorización.

- Cuenta Cloudflare creada por el usuario; iniciado OAuth de Wrangler, pendiente de autorización. Sin recursos remotos creados.

- Worker + D1 con interfaz reutilizada y base nueva sin importar pruebas.
- Registro con invitación, PBKDF2 con pepper, sesiones hash y controles de origen.
- Wrangler, lockfile y scripts de preparación/publicación/exportación.
- Cuatro pruebas Node/SQLite, migración y smoke real workerd/D1 local OK; dry-run OK.
- Publicación pendiente de cuenta gratuita Cloudflare autenticada.

- Registrado presupuesto cero con SQLite; descartada contratación de Render mediante ADR 0004. Sin cambios de código ni publicación.

- Preparado piloto por Internet en Render: Blueprint con disco persistente y despliegue manual, sin contratar ni publicar.
- Ruta de datos configurable; copias consistentes al arrancar y mediante comando manual.
- Restricción por correo, código de invitación y cookies Secure en HTTPS gestionado.
- Límites persistentes de autenticación y cinco pruebas superadas, con reinicio/respaldo.
- Guía de acceso compartido y restauración.

- Aplicación local con cuentas individuales y sesiones HttpOnly.
- Catálogo compartido y notas de calidad, servicio, precio y distancia.
- Recomendaciones por participantes con cobertura y sugerencias similares.
- Persistencia SQLite, interfaz en español y ejemplos marcados.
- Pruebas HTTP y algoritmo: dos pruebas superadas.
- Corregido cierre de conexiones SQLite tras fallo de limpieza en Windows.
- 2026-10-02: filtros personales diarios de distancia de ida, presupuesto y cocina. Guardado por cuenta en D1, intersección del grupo, reinicio diario y quitar filtros. Migración aditiva y publicación gratuita conservando cuentas, restaurantes y notas. Cinco pruebas SQL, smoke local y QA remoto OK; revisión de filtros en escritorio y móvil local.
- 2026-10-02: registro sin código de invitación global y grupos privados. Crear/unirse por código/cambiar grupo, catálogo y participantes aislados, validación de notas y recomendaciones por pertenencia. Migración conserva el equipo actual en «Mi equipo» con sesiones, contraseñas y datos intactos. Ocho pruebas y QA local/remoto OK; Free sin cambios.
- 2026-10-02: simplificado según aclaración del usuario: listado común de compañeros, selección de comensales para cada comida y registro libre. Retirados grupos/códigos de interfaz y API, conservando todos los restaurantes, notas, filtros y sesiones. Seis pruebas y QA local/remoto OK; Free sin cambios.

## 2026-10-02 — Restaurantes cercanos
- Mapa OSM y origen guardado por cuenta; radio 500–2000 m, hasta 30 rutas peatonales.
- Filtros de todos los seleccionados en servidor; desconocidos no cumplen límites, precio pendiente separado.
- Guardar descubrimientos en catálogo sin duplicar identificador OSM; caché y proveedores acotados gratuitos.
- Migración aditiva 0004 y siete pruebas SQL, smoke real local, UI escritorio/móvil y dry-run OK.

- Publicada versión 03b9c3a2-f08b-4ed0-9115-0682a616c88c en Free; smoke remoto real OK, QA retirada y recuentos originales conservados.

## 2026-10-02 — Dirección y corrección de búsqueda (local, pendiente publicar)
- Dirección CartoCiudad y confirmación de portal; ajuste de acceso mediante mapa, coordenadas internas.
- GET Overpass evita rechazo reproducido; fuente compartida por radios y respaldo con aviso. Errores diferenciados y respuestas parciales no cacheadas.
- Mapa comprueba teselas antes de mostrar y ofrece reintento, redimensiona y centra. Rutas en Google Maps mediante enlaces sin facturación.
- Ocho pruebas SQLite, dry-run, tres radios reales y QA visual de dirección/mapa/móvil correctos. Pendiente publicación por OAuth caducado.

- Corrección de dirección/mapa publicada en versión ebc23e11-e405-4bb9-b477-f7fb199fc464; migración 0005 remota y respaldo previo. Ocho tests y smoke online en tres radios pasan con fuente pública reciente en caché y rutas peatonales reales. Conservados 2 usuarios/1 restaurante/1 nota; retirada QA.
- Preparador manual de caché pública por fragmentos SQL y diagnósticos privados de proveedor. Se mantiene Overpass principal; renovación directa desde Workers todavía sujeta a TimeoutError. Sin pagos, cambios de secretos ni automatizaciones.

- Listado cercano convertido en tarjetas adaptables con tiempo/precio destacados, estado de compatibilidad y reseñas Google por enlace gratuito. Mapa al final desplegable; acceso por tarjeta mantiene marcadores.

- Localizar dirección solicita ubicación explícita al navegador; alternativa manual y mensajes de denegación, indisponibilidad y timeout.

- Preparada colaboración administrativa: guía de cuentas/roles y desarrollo/publicación, exportador de código sin datos/secretos conocidos, exclusiones adicionales Git. Sin cambios de aplicación ni producción.

- GitHub: verificada cuenta personal David-Fde en vivo; ADR 0015 sustituye destino organización. Documentación y preparación local actualizadas, sin recursos externos creados.

- Autorizada creación y carga del repositorio personal; verificada identidad y copia de 70 archivos. Pendiente sesión del navegador.

- Creado repositorio privado David-Fde/donde-comemos y cargados 70 archivos revisados en main; imágenes binarias preservadas. Sin producción ni permisos adicionales.

- Añadido AGENTS.md para instrucciones persistentes. STATUS.md consolidado en estado vigente; contenido anterior conservado en AGENT_LOG.md. Sin cambios de aplicación ni producción.

## 2026-10-03
- ADR 0016: búsqueda escrita retirada, ubicación guardada visible en campo de solo lectura y actualización inmediata tras localizar. Conservados puntos guardados y ajuste en mapa; sin geocodificación inversa ni migraciones.

- Publicado ADR 0016: versión 28b080ad-7b78-43ec-92d7-a4e06e6a5ec0. HTML/JS online comprobados; respaldo previo D1 y datos/secretos conservados.
- Guardada autorización persistente de despliegue en AGENTS.md: cambios de aplicación comprobados se publican salvo instrucción contraria; documentación se sincroniza sin redeploy innecesario.

- ADR 0017 publicado (2ed696b6-7190-4336-b957-7b84d1dbd8c7): dirección aproximada del portal más cercano sin sustituir GPS, mapa abierto lateral, tarjetas compactas y móvil apilado. Sin búsqueda escrita ni migración.
