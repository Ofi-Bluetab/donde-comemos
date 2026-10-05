# Estado actual

Actualizado: 2026-10-05. Historial en AGENT_LOG.md y CHANGELOG.md.

## Aplicación
- Cloudflare Workers + D1, plan Free, presupuesto cero.
- URL: https://donde-comemos.mesa-equipo-dfv.workers.dev
- Última versión publicada: 6942a7f9-1b77-4284-9884-f129273224ad (ADR 0018), desplegada el 2026-10-05. Salud y app.js online comprobados sin modificar datos reales.
- Registro libre, listado común y selección de participantes para cada comida. Notas personales y filtros diarios en Europe/Madrid. ADR 0008 sustituye los grupos persistentes de 0007; tablas históricas conservadas sin uso.
- Cercanos: CartoCiudad, OSM/Overpass, rutas peatonales FOSSGIS, filtros estrictos y precios aportados por el equipo. Tarjetas prioritarias, mapa abierto junto al listado (apilado en móvil) y enlaces gratuitos Google Maps (sin importar ratings).
- Geolocalización explícita opcional guardada como salida personal «Mi ubicación»; campo de solo lectura con dirección aproximada CartoCiudad; búsqueda escrita retirada (ADR 0017). Migración 0005 aplicada según registro previo. D1 y PASSWORD_PEPPER existentes se conservan.

## Verificación registrada y límites
- Verificaciones previas: ocho pruebas SQL/SQLite, checks y build dry-run correctos. Smoke local/remoto y QA de cercanos/listado/filtros completados según bitácora, con limpieza de cuentas QA.
- Geolocalización: éxito y errores probados mediante simulación; ubicación real y diálogo de permiso no comprobados.
- Limpieza de producción autorizada y verificada el 2026-10-03: 0 usuarios, restaurantes, valoraciones, sesiones, filtros, ubicaciones, grupos históricos y caché. Respaldo privado previo data/backups/d1-20261003-112254.sql; estructura, migraciones y secretos conservados.
- Renovación directa Overpass desde Workers agotó el tiempo. Smoke online pasó con caché pública real y rutas reales; no confirma renovación futura. Frescura seis horas y respaldo máximo siete días con aviso; otros destinos sin caché pueden fallar.
- Sin respaldos diarios externos, verificación de correo, recuperación de contraseña, monitor periódico ni pipeline de despliegue. El agente despliega los cambios comprobados por autorización persistente del usuario, salvo instrucción contraria. Más límites en RISKS.md.

## Código y colaboración
- GitHub: https://github.com/David-Fde/donde-comemos, privado, propietario David-Fde (ID 54890715), rama main. Identidad y rama verificadas en esta intervención; ADR 0015 sustituye el destino organización de 0014.
- Copia inicial de 70 archivos cargada y cinco PNG Leaflet verificados por hashes. Datos/secretos excluidos; sin invitaciones ni Actions añadidas.
- Esta carpeta local sigue sin commits ni remoto; no representa un clon sincronizado. Continuar desarrollo desde un clon nuevo conservando esta copia y sus datos locales. gh no instalado; conector GitHub disponible.
- Colaboradores pendientes de identificar. Varios Admin requieren retomar organización; no se han concedido accesos de infraestructura.

## Instrucciones de trabajo
- AGENTS.md creado en la raíz con plan breve, continuidad, diseño proporcional, protección de datos y comprobaciones concretas.
- STATUS consolidado: estados antiguos conservados en AGENT_LOG, sin presentarlos como vigentes.
- AGENTS.md incluido en las instrucciones de la sesión. Cambio actual de UI descrito en ADR 0016; ADR 0016 publicado en producción.

ADR 0016: retirada búsqueda escrita en UI, campo de salida visible y solo lectura, botón Localizar mi ubicación y errores sin sugerir entrada manual. Ocho tests y sintaxis pasan; prueba simulada confirma actualización/persistencia y errores 1/2/3 sin escrituras. Build inicial falló EPERM/log y acceso esbuild por aislamiento; reintento fuera del aislamiento pasó (dry-run). Sin migración ni cambios de datos/secretos; UI publicada.




Autorización persistente 2026-10-03 guardada en AGENTS.md: desplegar cambios de aplicación comprobados salvo instrucción contraria. Respaldo previo data/backups/d1-20261003-110538.sql, despliegue exitoso, HTML/JS publicados verificados sin escribir cuentas QA. Permiso/ubicación real siguen pendientes de comprobación del usuario.

ADR 0017 publicado: dirección inversa CartoCiudad conserva origen GPS; sin dirección/proveedor muestra punto disponible sin coordenadas. Mapa abierto lateral escritorio y debajo móvil. Nueve tests/checks/dry-run OK, flujo UI simulado OK, QA visual local con datos ficticios y teselas reales; escritorio 1280 sin overflow, móvil390 una columna/mapa340 sin overflow. Fuente real probada con punto público de oficina desde host; endpoint autenticado probado con proveedor simulado, no se afirma prueba remota autenticada real. Respaldo data/backups/d1-20261003-111518.sql; sin migración, datos reales/secretos intactos.



Eliminar disponible en tarjetas de catálogo/recomendaciones con confirmación; elimina notas de todos los usuarios. Diez tests, check, build dry-run y smoke local real pasan. Respaldo previo data/backups/d1-20261005-091212.sql. Sin migración ni borrados QA remotos.
