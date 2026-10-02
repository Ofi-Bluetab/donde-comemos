# ADR 0014: administración compartida del proyecto

2026-10-02. Aceptado; altas externas pendientes de identificar destinatarios.

El usuario solicita que todos los colaboradores puedan administrar el código y la aplicación desplegada. No implica convertir automáticamente a todas las cuentas de comensales en administradores de infraestructura.

Repositorio privado en una organización GitHub con rol Admin para cada colaborador identificado. Un repositorio personal no permite varios administradores equivalentes. Cloudflare usa cuentas individuales con rol Administrator para operar Workers y D1; gestionar miembros o facturación requiere Super Administrator y no forma parte de esta alta por defecto. Conservar Free y la base/secretos existentes.

Preparar copia de código mediante selección explícita de archivos, respeto a gitignore y comprobación de secretos conocidos/patrones antes de exportar. Excluir datos y estado local. Cada colaborador crea su pepper y D1 locales. Publicación manual desde cambios revisados; sin despliegue automático ni credenciales compartidas. No habilitar Actions con consumo potencial mientras siga el presupuesto cero.

Verificación actual: Git sin commits ni remoto; GitHub conectado como DavidBluetab, sin organizaciones disponibles. Faltan organización destino, usuarios GitHub y correos Cloudflare. No crear recursos bajo identidad empresarial por inferencia.
