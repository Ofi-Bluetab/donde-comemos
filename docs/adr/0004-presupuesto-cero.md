# 0004 — SQLite con presupuesto cero

Fecha: 2026-10-02. Estado: aceptada para presupuesto; alojamiento pendiente.

El usuario exige que todo sea gratuito y confirma SQLite. Supersede la propuesta de contratación Render del ADR 0003; se conserva el archivo de configuración como referencia histórica, sin usarlo ni contratarlo.

SQLite y los respaldos locales se mantienen. Se propone reutilizar un ordenador disponible como servidor, sin coste adicional de alojamiento (consume electricidad y conexión existentes). Para acceso por Internet, una prueba puede utilizar un túnel gratuito temporal con acceso restringido, sujeto a autorización corporativa. No se activa ni instala ningún túnel en esta intervención.

Un enlace temporal no constituye alojamiento permanente: depende del ordenador encendido y de la conexión; cambia al reiniciar el túnel y no ofrece disponibilidad garantizada. Fuente: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/. Falta confirmar disponibilidad de un ordenador y si se necesita URL permanente. El soporte de origen HTTPS del servidor actual está limitado a Render: debe adaptarse y verificarse antes de exponerlo mediante otro proxy.
