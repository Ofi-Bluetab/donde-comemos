# Administración entre compañeros

## Accesos

1. Elegir o crear una organización GitHub gratuita y un repositorio privado `donde-comemos` dentro de ella.
2. Invitar las cuentas GitHub identificadas al repositorio con rol **Admin**. No es necesario darles propiedad de toda la organización.
3. En Cloudflare, un Super Administrator con correo verificado abre **Manage account → Members** e invita los correos identificados con rol **Administrator**. Este rol permite operar la infraestructura; gestionar miembros/facturación requiere un rol distinto.
4. Cada persona acepta sus invitaciones y usa su propia sesión. La cuenta de la aplicación para comer no concede estos permisos.

Los administradores podrán modificar código, despliegues y datos de producción. Mantener Free y conservar PASSWORD_PEPPER y D1. No compartir contraseñas ni subir exportaciones de la base.

Fuentes: [roles GitHub](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization), [miembros Cloudflare](https://developers.cloudflare.com/fundamentals/manage-members/manage/), [roles Cloudflare](https://developers.cloudflare.com/fundamentals/manage-members/roles/).

## Preparar el código

```powershell
node scripts/prepare-sharing.mjs
```

Genera una carpeta nueva bajo `data/share/` y un listado de archivos. No publica, crea repositorios ni concede permisos. Excluye datos, secretos, dependencias, estado local y metadatos Git. Bloquea la exportación si encuentra secretos locales conocidos o patrones de credenciales. Es una comprobación adicional, no una garantía de detectar cualquier secreto desconocido: revisar el listado antes de subirlo.

La copia conserva archivos de continuidad y la versión Python histórica para no perder contexto. Los identificadores de recursos de `wrangler.jsonc` permiten apuntar al despliegue existente, pero no conceden acceso por sí solos.

## Trabajar en una mejora

Tras clonar el repositorio, usar Node 24 y pnpm 11:

```powershell
pnpm install --frozen-lockfile
node scripts/prepare-local.mjs
pnpm db:local
pnpm dev
```

Cada equipo tendrá `.dev.vars` y datos de prueba propios. Nunca copiar el pepper de producción al entorno de desarrollo. Leer README, STATUS, NEXT_ACTIONS, DECISIONS, RISKS y AGENT_LOG antes de tocar código.

Crear una rama `codex/nombre-de-la-mejora`, comprobar `pnpm check`, `pnpm test` y `pnpm build`, y abrir una pull request. Revisar cambios de otra persona antes de incorporarlos, aunque todos sean administradores. La revisión es una convención; no se promete protección obligatoria de ramas en el plan gratuito privado.

## Publicar una mejora aprobada

Coordinar quién publica para no desplegar dos versiones a la vez. Con sesión Cloudflare propia, desde la versión revisada:

```powershell
pnpm exec wrangler login
powershell -File scripts/cloudflare.ps1 -Action export
```

Si hay una nueva migración, revisar su SQL y ejecutar `pnpm db:remote`; después ejecutar `pnpm deploy`. Si no hay migración, publicar directamente tras el respaldo. Verificar la URL HTTPS, registrar la versión en STATUS y actualizar NEXT_ACTIONS, CHANGELOG y AGENT_LOG.

No ejecutar `create-db`, `secrets` ni `prepare-production.mjs` como parte de una actualización: son pasos de creación inicial y podrían llevar a cambiar recursos o secretos que ya existen. No habilitar despliegues automáticos todavía.

## Destino vigente: cuenta personal (ADR 0015)

Usar David-Fde (ID 54890715), verificada por perfil y login del conector el 2026-10-02. Preparar repositorio privado donde-comemos. La organización descrita arriba queda pendiente si se retoma el requisito de varios Admin. Crear repositorio vacío sin README/licencia/gitignore remotos y cargar solo la copia revisada. gh no instalado; conector sin creación de repositorios. No hay altas externas realizadas en esta intervención.
