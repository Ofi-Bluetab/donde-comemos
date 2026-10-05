# Dónde comemos

Aplicación del equipo para valorar restaurantes y elegir dónde comer. Versión vigente: Cloudflare Workers + D1 (SQL compatible con SQLite), publicada en el plan gratuito y disponible sin ordenador encendido.

URL: https://donde-comemos.mesa-equipo-dfv.workers.dev

Para empezar: pulsa «¿Primera vez? Crea tu cuenta» e introduce nombre, correo y contraseña, sin código. Entrarás directamente al listado común. Marca en «¿Quién se apunta?» a los compañeros que van a comer hoy y pulsa «Encontrar nuestra mesa». PASSWORD_PEPPER nunca se comparte.

Funciones: cuentas individuales, registro libre, listado común de compañeros y restaurantes, cuatro notas por persona y recomendaciones según los participantes seleccionados para esa comida. No hay grupos persistentes ni códigos. Se conservan todos los restaurantes y notas anteriores, incluidos los añadidos durante la versión con grupos.

Filtros de hoy: minutos máximos a pie (solo ida), presupuesto máximo por persona y cocina. Pulsa «Guardar filtros de hoy» para aplicarlos o «Quitar filtros» para dejar de limitar resultados. La lista usa tus filtros; las recomendaciones combinan los de los participantes seleccionados, visibles bajo sus nombres. Se guardan en D1 por cuenta y caducan al cambiar el día en Europe/Madrid. No cambian las notas. La cocina se elige entre categorías habituales y las registradas en el catálogo.

## Restaurantes cercanos

Marca comensales, guarda tus filtros y abre «Cerca de la oficina». Pulsa «Localizar mi ubicación» y acepta el permiso del navegador. El campo de solo lectura muestra la dirección aproximada del portal más cercano obtenida de CartoCiudad (IGN/CNIG), conservando tu punto GPS para las rutas. Si el servicio falla, el punto sigue disponible sin mostrar coordenadas. Puedes ajustar el acceso pulsando el mapa y «Guardar acceso ajustado». Se conserva por cuenta; no hay búsqueda de dirección escrita. Las salidas anteriores se conservan. Elige 500 m, 1 km o 2 km y busca. Analiza hasta 30 destinos con cocina compatible, ordenados por tiempo de ruta peatonal estimado; no es exhaustivo ni incluye comer/vuelta.

Mapa Leaflet local y datos OpenStreetMap/Overpass; rutas FOSSGIS OSRM foot. No hace falta GPS, clave ni suscripción. El servidor aplica filtros vigentes de todos los seleccionados, nunca relaja límites. Precios por persona confirmados por el equipo, sin inferirlos de OSM. Si falta precio y hay presupuesto, aparece solo en «Pendientes de comprobar el presupuesto»; «Completar y guardar» exige precio/cocina antes de reutilizarlo en búsqueda y valoraciones. Cocina/tiempo desconocidos no cumplen sus límites.

Caché D1 fresca seis horas, respaldo de hasta siete días ante fallos externos con aviso de antigüedad y una petición por segundo a cada proveedor globalmente. Fuentes públicas sin disponibilidad garantizada; si fallan, el catálogo sigue funcionando. OVERPASS_URL y FOOT_URL opcionales en vars permiten cambiar el backend; las teselas se configuran en public/nearby-ui.js y su origen autorizado en CSP. Datos y teselas se atribuyen a OSM; solicitudes externas incluyen coordenadas de oficina/restaurantes, nunca nombres de miembros, notas ni correos. Sin autocomplete/Nominatim ni descargas offline. Licencia Leaflet incluida en public/vendor/leaflet/LICENSE.

## Desarrollo local

Requiere Node.js 24 y pnpm 11+:

```powershell
pnpm install --frozen-lockfile
node scripts/prepare-local.mjs
pnpm db:local
pnpm dev
```

Abre http://127.0.0.1:8787. PASSWORD_PEPPER está en .dev.vars, excluido de Git; no compartirlo. Datos locales en .wrangler/state. No son D1 remoto. REGISTRATION_CODE y data/invitacion.txt de versiones anteriores ya no intervienen en el registro ni son códigos de grupo.

## Verificación

```powershell
pnpm check
pnpm test
pnpm build
node tests/smoke-worker.mjs
```

Ocho pruebas SQL/SQLite pasan; smoke real de Wrangler/workerd/D1 local pasa. Cubren registro libre, listado común, notas individuales, filtros de los seleccionados y conservación de datos/sesiones de la versión con grupos. Smoke requiere servidor activo y crea solo datos locales de QA. Build usa dry-run y no publica. QA remoto del listado/filtros completado y pruebas temporales retiradas. Interfaz sin creación/unión de grupos y selección de dos comensales comprobada en escritorio y móvil local.

## Publicación

Sigue [Uso compartido](docs/USO_COMPARTIDO.md) para operación y actualizaciones. Cuenta Free, D1 real, migración y secretos ya configurados. No usar planes de pago ni Render. No recrear D1 ni rotar PASSWORD_PEPPER al actualizar. La memoria guarda usuarios, restaurantes y notas; no cada listado recomendado.

La versión Python anterior (server.py, render.yaml, tests Python y data/) se conserva sin migración ni borrado. Puerto 8000 corresponde a esa versión antigua. Puerto 8787 corresponde al Worker nuevo.

El plan Free tiene cuotas; alcanzar sus límites puede interrumpir solicitudes. No habilitar upgrades. Fuentes: https://developers.cloudflare.com/workers/platform/pricing/ y https://developers.cloudflare.com/d1/platform/pricing/.

Verificación de cercanos: `node tests/smoke-nearby.mjs` contra local, o URL publicada como argumento para QA remoto explícito. Crea una cuenta temporal; SQL de limpieza exacta en data/cleanup-nearby.sql (ejecutar en el mismo destino). No modifica catálogo/notas. Local y remoto completados con proveedores reales; QA remota retirada. UI de mapa, precios pendientes, formulario y ancho móvil verificados.

Direcciones de España: CartoCiudad (IGN/CNIG), búsqueda explícita sin autocompletado, sin clave ni facturación. La dirección consultada se transmite solo al geocodificador; no se envían nombres/correos/notas. Overpass se consulta desde el navegador por POST, con alternativa GET ante rechazo de transporte; si falla, la API intenta sus proveedores/caché existentes. El servidor valida los elementos y aplica precios del catálogo, filtros y rutas. Los elementos recibidos del navegador no se incorporan a la caché compartida; un radio máximo compartido de 2 km se filtra geográficamente para reutilizar la fuente entre radios. No se cachean errores o respuestas parciales. El mapa espera teselas visibles sin fallos antes de mostrarse, detecta errores y permite reintento; la lista y rutas siguen utilizables. «Ruta en Google Maps» abre un enlace sin clave; no extrae datos ni usa APIs Google. No se garantiza disponibilidad futura de proveedores comunitarios.

### Preparar una caché pública de la oficina

`node scripts/prepare-office-cache.mjs` consulta la fuente pública y prepara `data/public-office-cache.sql`. `--from-local-cache` reutiliza únicamente una respuesta local todavía fresca, conservando su caducidad original. El script no escribe en D1 remoto ni copia cuentas, precios o notas. Tras revisar la fuente y autorizar la operación, `wrangler d1 execute comemos --remote --file data/public-office-cache.sql` incorpora esa respuesta a la caché existente. No hay tarea periódica.

La comprobación online del 2 de octubre pasó con esa caché y rutas peatonales reales. Las consultas de renovación a Overpass desde Workers agotaron el tiempo; la disponibilidad futura depende del proveedor. Se mantiene frescura de seis horas y respaldo máximo de siete días con aviso.

Resultados cercanos en tarjetas con tiempo/precio destacados y estado de compatibilidad. Mapa abierto junto al listado en escritorio y debajo en móvil; «Ver en el mapa» abre el sitio. «Consultar reseñas en Google Maps» busca por nombre y dirección; puede requerir seleccionar el local correcto. Por decisión del usuario se mantiene coste cero: no se importan puntuaciones Google ni se habilita facturación.

«Localizar mi ubicación» solicita ubicación al navegador y la guarda como salida personal «Mi ubicación». El campo muestra una dirección aproximada del portal más cercano (hasta 350 m), sin seguimiento. Las coordenadas se transmiten a CartoCiudad para obtenerla; no se sustituyen por las del portal. Permiso denegado, posición no disponible o espera agotada conservan la salida anterior; puedes reintentar o ajustar el mapa.

## Colaboración y administración

El equipo podrá administrar código y despliegues mediante cuentas individuales. Guía: [COLABORACION](docs/COLABORACION.md). `node scripts/prepare-sharing.mjs` genera una copia revisada sin datos/secretos en data/share, sin publicarla. GitHub requiere una organización para varios administradores del repositorio. Invitaciones externas pendientes de identificar cuentas; no se han concedido permisos todavía.



Eliminar restaurantes: pulsa Eliminar en la tarjeta y confirma. Se retira del catálogo compartido y se borran las valoraciones de todos los usuarios. Cualquier cuenta conectada autorizada puede hacerlo. Un sitio público puede reaparecer en cercanos y añadirse otra vez sin sus notas anteriores.
