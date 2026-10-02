# Estado actual

Actualizado: 2026-10-02. Historial en AGENT_LOG.md y CHANGELOG.md.

## Aplicación
- Cloudflare Workers + D1, plan Free, presupuesto cero.
- URL: https://donde-comemos.mesa-equipo-dfv.workers.dev
- Última versión publicada registrada: 2b696b14-2e96-4d94-a762-c0ef2c5a3d5c (ADR 0013). No se ha vuelto a consultar Cloudflare en esta intervención.
- Registro libre, listado común y selección de participantes para cada comida. Notas personales y filtros diarios en Europe/Madrid. ADR 0008 sustituye los grupos persistentes de 0007; tablas históricas conservadas sin uso.
- Cercanos: CartoCiudad, OSM/Overpass, rutas peatonales FOSSGIS, filtros estrictos y precios aportados por el equipo. Tarjetas prioritarias, mapa desplegable y enlaces gratuitos Google Maps (sin importar ratings).
- Geolocalización explícita opcional guardada como salida personal «Mi ubicación»; alternativa de dirección escrita. Migración 0005 aplicada según registro previo. D1 y PASSWORD_PEPPER existentes se conservan.

## Verificación registrada y límites
- Verificaciones previas: ocho pruebas SQL/SQLite, checks y build dry-run correctos. Smoke local/remoto y QA de cercanos/listado/filtros completados según bitácora, con limpieza de cuentas QA.
- Geolocalización: éxito y errores probados mediante simulación; ubicación real y diálogo de permiso no comprobados.
- Último recuento remoto registrado: 2 cuentas, 1 restaurante y 1 valoración, sin QA. Es una comprobación previa, no un recuento actual.
- Renovación directa Overpass desde Workers agotó el tiempo. Smoke online pasó con caché pública real y rutas reales; no confirma renovación futura. Frescura seis horas y respaldo máximo siete días con aviso; otros destinos sin caché pueden fallar.
- Sin respaldos diarios externos, verificación de correo, recuperación de contraseña, monitor periódico ni despliegue automático. Más límites en RISKS.md.

## Código y colaboración
- GitHub: https://github.com/David-Fde/donde-comemos, privado, propietario David-Fde (ID 54890715), rama main. Identidad y rama verificadas en esta intervención; ADR 0015 sustituye el destino organización de 0014.
- Copia inicial de 70 archivos cargada y cinco PNG Leaflet verificados por hashes. Datos/secretos excluidos; sin invitaciones ni Actions añadidas.
- Esta carpeta local sigue sin commits ni remoto; no representa un clon sincronizado. Continuar desarrollo desde un clon nuevo conservando esta copia y sus datos locales. gh no instalado; conector GitHub disponible.
- Colaboradores pendientes de identificar. Varios Admin requieren retomar organización; no se han concedido accesos de infraestructura.

## Instrucciones de trabajo
- AGENTS.md creado en la raíz con plan breve, continuidad, diseño proporcional, protección de datos y comprobaciones concretas.
- STATUS consolidado: estados antiguos conservados en AGENT_LOG, sin presentarlos como vigentes.
- Esta intervención modifica solo documentación; no modifica código, datos ni producción. Verificación de carga automática de instrucciones pendiente de un chat nuevo en el proyecto.
