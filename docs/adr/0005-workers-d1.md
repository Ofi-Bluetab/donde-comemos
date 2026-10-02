# 0005 — Cloudflare Workers y D1 gratuitos

Estado: aceptada. Fecha: 2026-10-02. Supersede las propuestas de alojamiento de ADR 0003 y 0004.

El usuario autoriza adaptar y publicar en Workers con D1, exige presupuesto cero y no puede mantener un ordenador encendido. Autoriza omitir los datos de prueba actuales. Se reutiliza la interfaz y el contrato HTTP existente. El nuevo servidor es un módulo JavaScript Worker con D1 (SQL compatible con SQLite), migraciones explícitas e índices. La nueva base comienza vacía, sin restaurantes ficticios ni importación de cuentas. Se conserva el servidor Python como referencia local antigua, sin borrado de archivos de usuario.

Acceso individual mediante contraseña, registro protegido por secreto de invitación y lista opcional de correos. Sesiones aleatorias: solo su SHA-256 en D1, cookie HttpOnly y Secure en HTTPS. Contraseñas PBKDF2 SHA-256 con sal aleatoria, 100000 iteraciones y HMAC con secreto separado (pepper); límite compatible con Web Crypto del Worker. No se trasladan hashes scrypt anteriores. Autenticación limitada mediante contador D1 atómico por IP, sin confiar en cabeceras locales salvo la IP suministrada por Cloudflare. Origen y contenido JSON comprobados en cada mutación.

La publicación necesita una cuenta Cloudflare Free autenticada y secretos configurados. No se habilitan planes de pago, dominios de pago ni servicios adicionales. Inicio cerrado si faltan configuración, base o secretos. Dirección workers.dev incluida en el servicio; cuotas gratuitas y recuperación Time Travel según documentación actual. No se promete gratuidad futura ni disponibilidad ilimitada. Un Worker nuevo comienza sin datos; las migraciones posteriores nunca destruyen notas automáticamente.

Referencias oficiales: https://developers.cloudflare.com/d1/ ; https://developers.cloudflare.com/workers/platform/pricing/ ; https://developers.cloudflare.com/workers/static-assets/binding/ ; https://developers.cloudflare.com/d1/worker-api/prepared-statements/ .
