# Estado

Actualizado: 2026-10-02.

GitHub completado: https://github.com/David-Fde/donde-comemos, privado, propietario David-Fde ID 54890715 y rama main verificados. Copia revisada de 70 archivos cargada mediante conector. Cinco imágenes Leaflet corregidas mediante blobs base64 tras detectar conversión de texto. Sin datos/secretos, invitaciones, Actions ni cambios de producción. Git local sigue sin commits/remoto; trabajar desde un clon nuevo para continuar.

ADR0014: preparada colaboración con todos los colaboradores identificados como administradores. Guía docs/COLABORACION.md, exportador scripts/prepare-sharing.mjs y exclusiones Git ampliadas. Exportación local de 69 archivos pasa comprobación de secretos conocidos/patrones; Git ignora datos, vars, entornos y claves. GitHub conectado como DavidBluetab, sin organización disponible. Git sin commits/remoto; gh no disponible. Usuario aún no conoce correos. No se han creado recursos ni concedido permisos ni modificado producción.

ADR0012: tarjetas visuales de cercanos, tiempo/precio destacados, agrupación por compatibilidad y mapa desplegable secundario. Usuario confirma reseñas Google por enlace gratuito, sin importar ratings. Ocho tests y dry-run pasan; QA local con cinco resultados reales y apertura de marcador correctos. Sin cambios de datos/migraciones.

ADR 0010/0011 publicados: versión ebc23e11-e405-4bb9-b477-f7fb199fc464 en la URL existente, plan Free. OAuth renovado, copia previa data/backups/antes-direccion-20261002.sql y migración 0005 remota aplicada. Dirección CartoCiudad sustituye coordenadas visibles; portal 11 confirmado, mapa local verificado en escritorio/móvil y teselas completas. Ocho tests pasan. Smoke online de radios 500/1000/2000 correcto: 28 candidatos pendientes de precio, rutas a pie reales dentro de 10 minutos, filtros y dirección persistentes. QA temporal retirada; recuentos finales 2 cuentas, 1 restaurante, 1 valoración y 0 QA; PASSWORD_PEPPER intacto.

Limitación vigente: renovación directa Overpass desde Workers agotó el tiempo. Se incorporaron 724 elementos públicos reales de la caché reciente de esta oficina, conservando fecha y caducidad original; no se añadieron restaurantes/precios/notas. El smoke online usó esa fuente y cálculo real de rutas. Frescura seis horas y respaldo máximo siete días con aviso; futuras consultas sin caché pueden fallar. Preparador manual scripts/prepare-office-cache.mjs sin escrituras remotas automáticas.

Actualizado: 2026-10-02.

GitHub completado: https://github.com/David-Fde/donde-comemos, privado, propietario David-Fde ID 54890715 y rama main verificados. Copia revisada de 70 archivos cargada mediante conector. Cinco imágenes Leaflet corregidas mediante blobs base64 tras detectar conversión de texto. Sin datos/secretos, invitaciones, Actions ni cambios de producción. Git local sigue sin commits/remoto; trabajar desde un clon nuevo para continuar.

Mejora de cercanos ADR 0009 publicada: versión 03b9c3a2-f08b-4ed0-9115-0682a616c88c en la URL existente, Free. Migración 0004 remota aplicada. Smoke remoto real OK: rutas a pie, precio desconocido excluido con presupuesto, filtros y oficina persistentes tras nuevo acceso. Cuenta QA exacta retirada: 2 cuentas, 1 restaurante, 1 valoración y 0 QA restantes. Oficina aproximada de la plaza indicada, origen personal ajustable, OSM/Overpass, rutas a pie FOSSGIS, mapa Leaflet local, filtros estrictos de seleccionados y candidatos sin precio separados. Importación con precio confirmado y deduplicación OSM. Migración 0004 aditiva local OK. Siete tests SQLite, sintaxis, dry-run y smoke real local OK. UI con Asiática/10 min/20 €, formulario y móvil 390 revisada. Copia remota previa data/backups/antes-cercanos-20261002.sql: 2 cuentas, 1 restaurante, 1 nota. Sin cambiar datos reales ni secretos.

Actualizado: 2026-10-02.

GitHub completado: https://github.com/David-Fde/donde-comemos, privado, propietario David-Fde ID 54890715 y rama main verificados. Copia revisada de 70 archivos cargada mediante conector. Cinco imágenes Leaflet corregidas mediante blobs base64 tras detectar conversión de texto. Sin datos/secretos, invitaciones, Actions ni cambios de producción. Git local sigue sin commits/remoto; trabajar desde un clon nuevo para continuar.

Versión vigente: listado común y participantes de cada comida, ADR 0008 supersede 0007. Retirados creación/unión/selector/códigos de grupos y sus rutas; registro libre lleva directamente al catálogo y listado de compañeros. Marcar comensales aplica sus filtros del día y calcula recomendaciones. Notas y filtros personales conservados. Tablas/migraciones previas intactas y sin uso; no fue necesaria nueva migración.

Publicada 3098aa8b-6d36-4359-b947-c0efaf74574f en la URL existente, Free. Copia previa data/backups/antes-listado-20261002.sql. Seis tests SQLite OK, smoke workerd/D1 local OK, checks y dry-run OK. UI local revisada con dos participantes seleccionados y móvil 390 px. QA remoto OK: nuevas cuentas aparecen sin grupos, catálogo común, filtros solo de seleccionados, persistencia y rutas antiguas 404. Primer intento remoto obtuvo 400 en groups/create inmediatamente después de publicación; cuenta temporal retirada y prueba repetida correctamente. Recuentos previos/posteriores: 2 cuentas, 1 restaurante, 1 nota; 0 cuentas QA. PASSWORD_PEPPER y datos intactos. Historial inferior describe versiones anteriores.

Versión vigente: grupos privados y registro libre publicados, ADR 0007. Cuentas nuevas se crean sin invitación y empiezan sin acceso a otros usuarios/restaurantes. Creación, unión por código propio del grupo y selector de grupos por sesión. Catálogo, notas, filtros compartidos y recomendaciones limitados a miembros del grupo activo en el servidor. Mutaciones validan contexto; las valoraciones y filtros siguen siendo personales.

Migración 0003 aditiva aplicada local/remota; cuentas anteriores y datos conservados en «Mi equipo». Copia previa data/backups/antes-grupos-20261002.sql. Recuentos antes/después: 2 cuentas, 1 restaurante, 1 nota; grupo inicial con 2 miembros, 0 restaurantes sin grupo y 0 cuentas QA restantes. PASSWORD_PEPPER intacto; REGISTRATION_CODE sin uso, no borrado. Versión f574ae3b-4d43-47cb-9d57-5a21b4164e77 en la URL existente, Free.

Verificación vigente: ocho pruebas SQLite OK, incluidas migración de contraseña/sesión existente y aislamiento; smoke local workerd/D1 y dry-run OK. UI local crear/unir desde segunda cuenta/cambiar catálogo y 390 px revisada. QA remoto completo de grupos, notas/filtros persistentes y conflictos de contexto OK, con limpieza exacta de datos QA. Historial inferior describe versiones anteriores.

Mejora vigente: filtros personales diarios publicados, ADR 0006. Minutos máximos a pie (ida), presupuesto máximo por persona y cocina guardados en D1 por usuario. Catálogo filtrado por usuario; recomendaciones combinan filtros de todos los participantes; vacío explícito, quitar filtros, reinicio diario Europe/Madrid y actualización de pestañas abiertas al cambiar de día.

Usuario confirma uso correcto con otra persona. Se conservan datos reales: 2 cuentas, 1 restaurante y 1 valoración antes y después de esta actualización. Copia previa en data/backups/antes-filtros-20261002.sql. Migración aditiva 0002 aplicada en local y remoto. Versión publicada 0963411c-9098-4f28-b3b5-c6ddaeea6a9a. Cinco pruebas SQL OK, sintaxis OK, smoke workerd/D1 local de filtros OK y dry-run OK. Interfaz local comprobada en escritorio y 390 px. QA remoto de filtros: persistencia tras nuevo acceso, exclusión y quitar filtros OK; cuenta temporal retirada (0 cuentas QA). Ningún cambio de plan, secretos o alojamiento.

Las referencias a base vacía/versión anterior abajo describen la publicación inicial; ya hay datos reales.

Arquitectura vigente: Workers + D1 gratuitos, ADR 0005. Usuario autoriza avanzar, publicar y omitir datos de prueba; no puede mantener equipo encendido. No se han borrado archivos locales antiguos. D1 remoto empezará vacío.

Worker y migración SQL implementados. Interfaz reutilizada, con estado de catálogo vacío. Registro con invitación, acceso individual, sesiones hash, cuatro notas por persona, edición y recomendaciones. Acceso cerrado sin secretos y protección de origen/cookies/intentos.

Verificación: cuatro tests Node/SQLite OK; migración local y smoke HTTP completo en workerd/D1 local OK; empaquetado dry-run OK. Preview nuevo: http://127.0.0.1:8787. Puerto 8000 es la versión antigua.

Publicada: https://donde-comemos.mesa-equipo-dfv.workers.dev. Wrangler autenticado por dispositivo. D1 comemos creado en WEUR, migración inicial aplicada y dos secretos configurados. Plan Free confirmado por la API; retirado límite CPU personalizado incompatible con Free. Subdominio gratuito mesa-equipo-dfv registrado. Versión final e44f5341-557e-4f48-8cfa-9bdf38f945de.

Verificación remota OK: invitación incorrecta rechazada, registro/acceso, catálogo, notas, recomendaciones, sesión revocada, nuevo acceso, aislamiento de notas y conservación después de redeploy. Pruebas temporales retiradas: 0 usuarios, 0 restaurantes, 0 notas al cierre. Pantalla HTTPS publicada comprobada visualmente. Exportación inicial guardada. Invitación en data/invitacion.txt, secretos en data/deployment-secrets.json (excluidos de Git). No hay respaldo diario ni QA visual móvil completa; la autenticación funcionó en Free, sin medición detallada de CPU/cuotas.

Publicación visual completada: fcf7eeee-e4be-4319-b4c1-c8f0a0242212 en la URL existente, Free.

2026-10-02: ADR0013 publicado en 2b696b14-2e96-4d94-a762-c0ef2c5a3d5c. Localizar dirección pide permiso GPS/navegador, guarda salida personal y mantiene alternativa escrita. Sintaxis y prueba con geolocalización simulada: éxito y errores1/2/3 pasan, sin escrituras en errores. Ubicación real y diálogo de permiso no probados para evitar solicitar datos personales durante QA. Sin migración ni cambios de secretos.


GitHub creación autorizada el 2026-10-02: login conector confirma David-Fde. Navegador abierto en github.com/new redirige a inicio de sesión; pendiente acceso del usuario en esa pestaña. Nueva copia de 70 archivos pasa el exportador. No creado repositorio ni cargado archivos todavía.

