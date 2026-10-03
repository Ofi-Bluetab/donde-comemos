# Estado actual

Actualizado: 2026-10-03. Historial en AGENT_LOG.md y CHANGELOG.md.

## Aplicación
- Cloudflare Workers + D1, plan Free, presupuesto cero.
- URL: https://donde-comemos.mesa-equipo-dfv.workers.dev
- Última versión publicada: 28b080ad-7b78-43ec-92d7-a4e06e6a5ec0 (ADR 0016), desplegada y assets online comprobados el 2026-10-03.
- Registro libre, listado común y selección de participantes para cada comida. Notas personales y filtros diarios en Europe/Madrid. ADR 0008 sustituye los grupos persistentes de 0007; tablas históricas conservadas sin uso.
- Cercanos: CartoCiudad, OSM/Overpass, rutas peatonales FOSSGIS, filtros estrictos y precios aportados por el equipo. Tarjetas prioritarias, mapa desplegable y enlaces gratuitos Google Maps (sin importar ratings).
- Geolocalización explícita opcional guardada como salida personal «Mi ubicación»; campo de solo lectura con coordenadas; búsqueda escrita retirada y publicada (ADR 0016). Migración 0005 aplicada según registro previo. D1 y PASSWORD_PEPPER existentes se conservan.

## Verificación registrada y límites
- Verificaciones previas: ocho pruebas SQL/SQLite, checks y build dry-run correctos. Smoke local/remoto y QA de cercanos/listado/filtros completados según bitácora, con limpieza de cuentas QA.
- Geolocalización: éxito y errores probados mediante simulación; ubicación real y diálogo de permiso no comprobados.
- Último recuento remoto registrado: 2 cuentas, 1 restaurante y 1 valoración, sin QA. Es una comprobación previa, no un recuento actual.
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
