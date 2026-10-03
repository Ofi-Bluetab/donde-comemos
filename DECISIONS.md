# Decisiones

| ADR | Decisión | Estado |
| --- | --- | --- |
| [0001](docs/adr/0001-aplicacion-local.md) | Servidor local compartido, SQLite y cuentas individuales | Aceptada |
| [0002](docs/adr/0002-uso-compartido-y-respaldo.md) | Acceso compartido con TLS, correos autorizados y copias consistentes | Aceptada |
| [0003](docs/adr/0003-alojamiento-render.md) | Compatibilidad con Render y propuesta de piloto privado con disco | Despliegue pendiente |
| [0004](docs/adr/0004-presupuesto-cero.md) | Presupuesto cero y SQLite; sustituye propuesta de contratación del ADR 0003 | Aceptada; alojamiento pendiente |
| [0005](docs/adr/0005-workers-d1.md) | Workers + D1 gratuitos; base nueva sin migrar pruebas, sustituye alojamiento 0003/0004 | Aceptada |
| [0006](docs/adr/0006-filtros-diarios.md) | Filtros diarios por cuenta; recomendaciones compatibles con todos los participantes | Aceptada e implementada |
| [0007](docs/adr/0007-grupos-registro-libre.md) | Registro sin invitación global; varios grupos privados por cuenta y datos separados | Aceptada e implementada |
| [0008](docs/adr/0008-participantes-del-dia.md) | Sin grupos persistentes; listado común y selección diaria de comensales | Aceptada e implementada; supersede 0007 |

| [0009](docs/adr/0009-restaurantes-cercanos.md) | Descubrimiento OSM, rutas peatonales, mapa y filtros estrictos sin precios inventados | Implementada y publicada |

| [0010](docs/adr/0010-direccion-y-busqueda-resiliente.md) | Dirección CartoCiudad, GET Overpass, caché de respaldo y mapa verificado; enlaces Google sin API | Implementada y publicada |

| [0011](docs/adr/0011-fuente-respaldo-cercanos.md) | Respaldo público de la oficina con edad original y filtros estrictos; renovación externa sin garantía | Implementada; smoke remoto verificado con caché |

| [0012](docs/adr/0012-listado-visual-cercanos.md) | Tarjetas prioritarias, mapa secundario y reseñas Google mediante enlace gratuito | Implementada; coste cero confirmado |

| [0013](docs/adr/0013-ubicacion-solicitada.md) | Geolocalización explícita y salida personal; alternativa manual | Implementada y publicada |

| [0014](docs/adr/0014-administracion-compartida.md) | Organización GitHub privada con Admin para colaboradores identificados, Cloudflare Administrator individual | Preparación local; altas pendientes de cuentas |
| [0015](docs/adr/0015-github-personal.md) | Cuenta personal verificada David-Fde; repositorio privado previsto | Aceptada; supersede destino GitHub de 0014; creación pendiente |
| [0016](docs/adr/0016-salida-ubicacion.md) | Salida visible de solo lectura y geolocalización; sin búsqueda escrita en UI | Aceptada; supersede alternativa manual de 0013 y entrada de 0010 |
| [0017](docs/adr/0017-direccion-mapa-lateral.md) | Dirección aproximada CartoCiudad y mapa abierto junto al listado | Aceptada; supersede presentación de 0016/0012 |
