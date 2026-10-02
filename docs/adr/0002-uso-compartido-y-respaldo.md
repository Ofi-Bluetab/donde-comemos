# 0002 — Preparación para uso compartido y persistencia operativa

Estado: aceptada. Fecha: 2026-10-02. Amplía ADR 0001.

La solicitud requiere acceso desde varios equipos y memoria persistente. Se mantiene SQLite como fuente compartida; la base reside en el disco local del único servidor, nunca en una carpeta de red sincronizada. La ruta se configura para poder actualizar el código sin mover los datos.

Antes de escuchar fuera de localhost, se exige TLS con certificado y clave, además de una lista explícita de correos permitidos. Esa lista se aplica tanto al registro como al acceso. Se añaden límites persistentes de intentos de autenticación por dirección IP. El modo local sigue funcionando sin configuración adicional.

Se usa la API de respaldo de SQLite para copiar una base consistente incluso con el servidor activo. Se genera una copia al arrancar cuando ya existe la base y se proporciona comando manual reutilizable por el programador corporativo. Los respaldos no se eliminan automáticamente. No se añade un planificador ni se modifica el firewall o la red del usuario.

La ubicación final necesita concretarse con el usuario. No se publica ni se activa escucha de red en esta intervención. La memoria conserva usuarios, restaurantes, sesiones y notas; las recomendaciones se calculan de nuevo con las notas actuales, sin historial de salidas adicional.
