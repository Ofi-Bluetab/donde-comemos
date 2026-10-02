# Riesgos y límites

- Publicada y verificada en Free; cuota y condiciones pueden cambiar. No contratar upgrades. Autenticación remota funcionó, pero CPU y límites no se han medido bajo carga.
- PBKDF2 SHA-256 100000 iteraciones con pepper separado por compatibilidad del runtime. Conservar/proteger PASSWORD_PEPPER; rotarlo exige restablecer cuentas. Recuperación de contraseña pendiente.
- Registro libre sin verificación de email ni SSO. Lista de correos opcional. Por decisión del usuario, todos los registrados autorizados ven el listado común de nombres, filtros diarios y restaurantes; no hay grupos privados. Las notas siguen siendo individuales.
- Límite por IP puede afectar a compañeros de una misma red.
- D1 local de QA y la versión antigua del puerto 8000 no son D1 remoto.
- No hay respaldos diarios externos; exportación manual y Time Travel sujetos al plan. Exportaciones contienen datos de cuentas.
- QA local y remoto API correctos, con persistencia tras redeploy verificada. Pantalla de acceso en escritorio revisada; QA visual completa de móvil/formularios pendiente.
- Guardar secretos de data/deployment-secrets.json fuera de Git y en ubicación restringida. REGISTRATION_CODE/data/invitacion.txt y códigos de grupos anteriores están sin uso. ALLOWED_EMAILS vacía permite crear cuenta y consultar el catálogo/listado común.
- Catálogo previo con distancia/precio manuales; descubrimientos con ruta peatonal estimada y precio aportado por el equipo. Una nota actual por persona/sitio, sin historial.
- Filtros diarios usan el día de Europe/Madrid. Minutos de ida no garantizan duración total de comida. Cocinas incompatibles entre participantes pueden dar cero resultados; no se relajan límites automáticamente. Los filtros guardados son visibles para los compañeros del equipo.
- Las tablas/migraciones históricas de grupos se conservan para evitar borrar datos, pero ya no filtran el acceso. No reactivar una versión antigua sin revisar esa decisión y los restaurantes nuevos sin group_id.

- Overpass/FOSSGIS/teselas OSM gratuitos y comunitarios, sin SLA. Cache y límites para uso moderado. OSM puede tener sitios incompletos o cerrados; horarios/cierre no verificados. Distancias de ruta no aseguran tiempo real.
- Sin precio conocido, un límite de presupuesto impide recomendar; candidatos pendientes se distinguen. Catálogo anterior sin identificador/coordenadas no se asocia automáticamente a OSM.
- Portal inicial localizado mediante CartoCiudad; el acceso peatonal puede requerir ajuste manual. Direcciones consultadas se transmiten a CartoCiudad, y coordenadas a proveedores cartográficos al buscar. No se usa localización personal.

- Fallos externos distinguen restaurantes/rutas/dirección. Datos de respaldo pueden tener hasta siete días de antigüedad y se avisa; no se relajan filtros. Mapas públicos no garantizan disponibilidad permanente, la comprobación de teselas solo confirma la carga de esa vista.
- Google Places/Maps APIs no habilitadas: implican facturación y cuotas. Enlaces Google Maps sin API/clave son gratuitos; no se importan sus resultados automáticamente.
- OAuth renovado y corrección publicada. La caducidad de la autorización de Wrangler afecta a nuevas publicaciones, no a la aplicación ya desplegada.

- La renovación directa de Overpass desde Workers agotó el tiempo incluso con la alternativa Lambert. La búsqueda online de esta oficina pasó usando datos públicos recientes en caché y rutas reales. Otras direcciones sin caché pueden fallar; el respaldo caduca como máximo a los siete días, con aviso de antigüedad. No presentar la carga inicial como garantía de renovación futura.

- Geolocalización opcional solicitada por usuario: coordenadas guardadas como salida por cuenta y usadas por proveedores al buscar. Precisión depende del dispositivo; etiqueta Mi ubicación no es dirección postal.

- Administradores del repositorio/Cloudflare podrán modificar código, despliegues y datos. Acceso solo a colaboradores identificados; no a todos los comensales. No habilitar planes de pago ni compartir contraseñas. La comprobación de copia detecta patrones y secretos locales conocidos, no garantiza detectar cualquier secreto desconocido.
