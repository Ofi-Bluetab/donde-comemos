# Estado actual

Actualizado: 2026-10-05. Historial en AGENT_LOG.md y CHANGELOG.md.

## Aplicación
- Cloudflare Workers + D1, plan Free, presupuesto cero.
- URL: https://donde-comemos.mesa-equipo-dfv.workers.dev
- Última versión publicada: 06977dbc-da45-4490-b447-8cc6af038dcf (ADR 0019).
- Registro libre, catálogo común y participantes de cada comida; notas personales y filtros diarios Europe/Madrid. Sin grupos persistentes activos.
- Eliminar en tarjetas con confirmación retira restaurante y notas de todos los usuarios (ADR 0018).
- Cercanos: consulta OSM/Overpass desde navegador; API valida elementos, filtros estrictos, precios del catálogo y rutas FOSSGIS. Fuente cliente no crea restaurantes ni entra en caché compartida.
- Dirección aproximada CartoCiudad con origen GPS conservado, sin búsqueda escrita; mapa abierto lateral y apilado en móvil (ADR 0017).
- D1 y PASSWORD_PEPPER existentes conservados; sin migraciones nuevas.

## Verificación y datos
- Doce tests SQL/SQLite, pnpm check, sintaxis de módulos y build dry-run pasan en esta intervención.
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
