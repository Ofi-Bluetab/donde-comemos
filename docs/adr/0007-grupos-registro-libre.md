# 0007 — Grupos privados y registro libre

Estado: aceptada. Fecha: 2026-10-02. Supersede el registro con invitación global del ADR 0005.

El registro requiere únicamente nombre, correo y contraseña. Se conserva PASSWORD_PEPPER y las sesiones existentes. REGISTRATION_CODE deja de intervenir; no se rotan ni borran secretos.

Una cuenta puede crear grupos y unirse por un código aleatorio propio de cada grupo. Ese código permite unirse después del registro; no es un requisito para crear cuenta. Los miembros pueden compartirlo. Los grupos no se enumeran públicamente y solo sus miembros acceden a su nombre, código, compañeros, restaurantes, notas y recomendaciones. No hay salida, borrado, roles ni administración de miembros en este primer alcance.

El grupo activo pertenece a la sesión. Las operaciones de catálogo, notas y recomendaciones exigen su ID y comprueban pertenencia en el servidor; un cambio desde otra pestaña devuelve conflicto antes de escribir. Las notas siguen siendo individuales, ligadas a restaurantes del grupo. Las referencias de puntuación solo incluyen datos del grupo. Los filtros diarios siguen siendo personales y se muestran únicamente entre compañeros del grupo activo.

La migración aditiva crea grupos y miembros, genera un código aleatorio para «Mi equipo», incluye solo las cuentas ya existentes y asigna todos los restaurantes actuales a ese grupo. Se mantienen IDs, contraseñas, sesiones y notas. La columna de grupo del restaurante admite NULL por compatibilidad de ALTER TABLE con claves foráneas en SQLite; la migración rellena todas las filas y los nuevos INSERT del servidor siempre incluyen grupo validado.

La creación y unión son transacciones D1. La unión está limitada a 20 intentos por IP/15 min, separada del contador de acceso. Los límites existentes y ALLOWED_EMAILS siguen disponibles; la configuración publicada vacía permite registro libre. Se conserva el plan Free.
