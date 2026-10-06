# Estado actual

Actualizado: 2026-10-06. Historial en AGENT_LOG.md y CHANGELOG.md.

## Aplicación
- Cloudflare Workers + D1, plan Free, presupuesto cero.
- URL: https://donde-comemos.mesa-equipo-dfv.workers.dev
- Última versión publicada: e31674d0-3c1a-4136-ba3a-b34d8e5cd3c2 (alta por nombre y mapa).
- Registro libre, catálogo común y participantes de cada comida; notas personales y filtros diarios Europe/Madrid. Sin grupos persistentes activos.
- Eliminar en tarjetas con confirmación retira restaurante y notas de todos los usuarios (ADR 0018).
- Cercanos: consulta OSM/Overpass desde navegador; API valida elementos, filtros estrictos, precios del catálogo y rutas FOSSGIS. Fuente cliente no crea restaurantes ni entra en caché compartida.
- Dirección aproximada CartoCiudad con origen GPS conservado, sin búsqueda escrita; mapa abierto lateral y apilado en móvil (ADR 0017).
- D1 y PASSWORD_PEPPER existentes conservados; sin migraciones nuevas.

## Verificación y datos
- Trece tests SQL/SQLite, pnpm check y build dry-run pasan el 2026-10-06. Smoke y alta desde mapa probados en D1 local; sin cuentas ni altas QA remotas en esta intervención.
- Smoke local/remoto con fuente pública actual: radios 500/1000/2000, presupuesto desconocido separado y rutas <=10 min. Oficina pública de prueba: 28 compatibles; UI real publicada confirma resultados y mapa.
- Consulta directa Overpass desde Workers sigue agotando tiempo; solo POST no bastó. Flujo navegador probado evita ese problema. CORS/red/proveedores pueden fallar; API/caché son alternativa sin garantía.
- Memoria de navegador 6h por origen/máximo 8 puntos; caché D1 6h y respaldo hasta 7 días con aviso cuando se usa.
- QA remota autorizada y retirada exactamente: 0 cuentas QA; recuento final 1 usuario real, 0 restaurantes, 0 notas. Foreign key check vacío. Datos reales intactos.
- Respaldo privado previo: data/backups/d1-20261005-092113.sql. Limpieza general del 3 de octubre en bitácora.
- Ubicación personal/permiso GPS real no comprobados; pruebas con oficina pública.

## Código y operación
- GitHub: https://github.com/David-Fde/donde-comemos, privado, David-Fde (ID 54890715), main. Login/HEAD comprobados antes de sincronizar.
- Carpeta local sin commits/remoto: no es un clon sincronizado; mantener copia/datos al pasar a clon nuevo.
- Datos, respaldos, secretos y dependencias excluidos de copia compartida. Sin invitaciones ni Actions.
- Autorización persistente: desplegar cambios comprobados en Worker existente salvo instrucción contraria; documentación sola sin redeploy. Regla en AGENTS.md.
- Sin recuperación de contraseña/verificación email, respaldo diario externo, monitor periódico ni pipeline. Más límites en RISKS.md.

Mapa: fichas emergentes con nombre/cocina/dirección/tiempo/precio/estado y enlaces a ruta, reseñas y listado. Origen azul con borde blanco, locales verdes/pendientes ámbar. QA local real: popup desde tarjeta y marcador, retorno a listado y origen sin mover al pulsar local. Doce tests/check/sintaxis/build OK; assets y salud online verificados. Respaldo data/backups/d1-20261005-094828.sql; sin mutaciones QA remotas.


Alta por nombre (ADR0020): búsqueda explícita en 2 km de la salida, selección de marcador completa datos disponibles y ficha permite añadir tras confirmar campos obligatorios/precio. No aplica filtros diarios al buscar para alta; recomendaciones conservan sus filtros. Respaldo previo data/backups/d1-20261006-095426.sql. Sin migraciones ni cambios de secretos.
