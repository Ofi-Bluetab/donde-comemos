# Publicación gratuita en Workers + D1

Arquitectura vigente: ADR 0005. Presupuesto cero. Publicada el 2026-10-02: https://donde-comemos.mesa-equipo-dfv.workers.dev. Cuenta Free autenticada, D1 real y secretos configurados. No se necesitan ordenador encendido, Render ni dominio comprado. Los pasos iniciales siguientes son referencia: no recrear recursos que ya existen.

Estado vigente: registro libre y listado común de compañeros, ADR 0008. No hay que crear grupos ni unirse mediante códigos. Las cuentas y datos anteriores se conservan. Secretos administrativos en data/deployment-secrets.json, excluidos de Git; data/invitacion.txt es histórico y ya no sirve para acceder. Copia previa al listado en data/backups/antes-listado-20261002.sql. No hay respaldo diario automático todavía.

## 1. Cuenta y acceso

Crear cuenta en https://dash.cloudflare.com/sign-up y aceptar personalmente sus condiciones; mantener Free. No pegar contraseñas ni tokens en el chat.

Desde la raíz, con Node.js 24 y pnpm 11+:

```powershell
pnpm install --frozen-lockfile
pnpm exec wrangler login
pnpm exec wrangler whoami
```

## 2. Base persistente

```powershell
pnpm exec wrangler d1 create comemos
```

Sustituir database_id provisional de wrangler.jsonc por el UUID real devuelto. Si ya existe ese nombre, inspeccionar primero; no borrar una base existente.

```powershell
pnpm db:remote
```

Base nueva vacía, sin seed ni importación. Migraciones posteriores deben añadirse, sin reescribir las aplicadas.

## 3. Cuentas y participantes de la comida

ALLOWED_EMAILS en wrangler.jsonc admite correos separados por comas. Vacío permite registro libre. La pantalla de acceso es pública; catálogo y operaciones necesitan sesión. Cada cuenta aparece inmediatamente en el listado de compañeros y puede consultar el catálogo común. En «¿Quién se apunta?» se marcan quienes van a comer ese día; «Encontrar nuestra mesa» combina sus preferencias y filtros actuales. Las notas son individuales y solo se editan bajo la cuenta propia. No hay grupos persistentes ni códigos.

En una instalación nueva, configurar PASSWORD_PEPPER aleatorio de 32 caracteres o más mediante entrada interactiva. En esta instalación ya existe: conservarlo.

```powershell
pnpm exec wrangler secret put PASSWORD_PEPPER
```

PASSWORD_PEPPER es exclusivo del servidor y debe conservarse en un gestor de secretos: cambiarlo invalida las contraseñas existentes. Nunca incluir secretos en Git, argumentos o logs. .dev.vars es solo desarrollo. REGISTRATION_CODE y tablas de grupos anteriores se conservan sin uso; sus rutas/códigos ya no funcionan.

## 4. Verificar y desplegar

```powershell
pnpm check
pnpm test
pnpm build
pnpm deploy
```

Deploy devuelve URL HTTPS workers.dev. No activar Workers Paid ni servicios de pago. scripts/cloudflare.ps1 facilita login, creación de D1, migración, secretos, deploy y exportación. Si Node no está en PATH puede pasarse -NodePath.

Antes de entregar: exportar copia, aplicar migraciones pendientes si existen, probar dos cuentas, registro sin código, listado común, notas individuales, filtros de los participantes y conservación sin reemplazar D1. tests/verify-hosted-roster.mjs crea exclusivamente cuentas QA, no modifica restaurantes/notas, y prepara data/cleanup-hosted-roster.sql con ID/correo exactos; ejecutar y verificar esa limpieza después. Comprobar móvil y CPU/cuotas reales; el empaquetado y QA local no verifican límites remotos.

## Recuperación

Datos permanentes en D1, independientes del navegador y del filesystem del Worker. Tokens de sesión almacenados como hashes; contraseñas PBKDF2 SHA-256 con sal y pepper.

```powershell
pnpm exec wrangler d1 export comemos --remote --output data/backups/comemos.sql
```

scripts/cloudflare.ps1 -Action export crea carpeta y nombre con fecha. Guardar SQL en drive corporativo restringido: contiene cuentas y hashes. No se ha implementado respaldo diario ni integración Drive.

Time Travel gratuito: siete días según https://developers.cloudflare.com/d1/platform/limits/. Antes de restaurar obtener autorización y exportar estado actual.

## Cuotas

Workers Free: 100000 solicitudes/día y 10 ms CPU por invocación. D1 Free: 500 MB por base y cuotas de filas. Al agotarse cuotas, las operaciones pueden fallar hasta restablecerse; no habilitar pago. El registro no verifica email ni sustituye SSO. Límite de acceso por IP compartido detrás de una misma red.

Fuentes: https://developers.cloudflare.com/workers/platform/pricing/ ; https://developers.cloudflare.com/d1/platform/pricing/ ; https://developers.cloudflare.com/d1/reference/faq/ .
