# Instrucciones para Codex — Dónde comemos

## Forma de trabajar
- Responde en español y empieza cada petición con un plan numerado breve y tareas ejecutables.
- Ante una petición de implementación, ejecuta y verifica el trabajo autorizado hasta completarlo.
- Resuelve decisiones reversibles con criterio y documenta las relevantes; pregunta ante bloqueos reales.
- Para consultas informativas, responde sin modificar archivos.

## Continuidad y diseño
- Antes de modificar, lee en orden README.md, STATUS.md, NEXT_ACTIONS.md, DECISIONS.md, RISKS.md y las últimas entradas de AGENT_LOG.md. Consulta entradas antiguas solo cuando sean relevantes.
- Estos documentos, CHANGELOG.md e IDEAS.md son la continuidad compartida en la raíz; crea los ausentes cuando intervengas. No crees carpetas de control paralelas.
- Contrasta documentación con código y estado real de Git. STATUS.md contiene solo el estado actual; conserva el historial en AGENT_LOG.md y CHANGELOG.md.
- Define un diseño breve antes de implementar. Para decisiones de arquitectura, escribe un ADR en docs/adr/ y su fila en DECISIONS.md. Para sustituir una decisión, crea otro ADR que indique cuál supersede.
- Reutiliza código existente y limita cambios al objetivo. IDEAS.md no autoriza implementar funciones.
- Si colaboran varios agentes, evita ediciones solapadas: architect diseña/ADRs; backend implementa diseño aprobado; reviewer hace QA sin editar; documentation modifica solo documentación.

## Proyecto y entorno
- Aplicación vigente: Cloudflare Workers + D1, con presupuesto cero. Conserva la versión Python histórica sin reactivarla por defecto.
- Usa Node.js 24 y pnpm 11 según README.md. Entorno local del Worker: puerto 8787; Python histórico: puerto 8000.
- No confundas D1 local con producción. Consulta STATUS.md para versiones, identidades verificadas y situación de Git; no deduzcas autenticación Git local de la conexión del plugin.
- Registro libre y catálogo común; comensales elegidos para cada comida, notas y filtros diarios personales. No reintroduzcas grupos persistentes sin una decisión nueva.

## Datos y operación
- No subas secretos, bases, respaldos, dependencias ni estado local a Git; respeta .gitignore y revisa archivos con scripts/prepare-sharing.mjs antes de compartirlos.
- Conserva los binarios como binarios al cargar archivos; verifica sus hashes si usas APIs.
- No recrees D1 ni cambies PASSWORD_PEPPER durante una actualización. No contrates servicios ni habilites planes de pago, APIs de pago o despliegues automáticos.
- Verifica cuenta, repositorio, visibilidad y destino antes de escribir en servicios externos.
- Publica o modifica producción solo con autorización explícita. Respeta la autorización ya concedida para la tarea y su alcance; no la extiendas a otros destinos o acciones.
- No inventes precios ni datos de proveedores. Mantén filtros estrictos y documenta fallos/antigüedad de caché.

## Verificación y cierre
- Para cambios de código, ejecuta las comprobaciones pertinentes: pnpm check, pnpm test y pnpm build (dry-run). Usa smoke local para flujos afectados; requiere servidor activo y datos QA propios.
- Los smoke remotos escriben cuentas de prueba: ejecútalos solo con autorización y limpieza exacta posterior.
- Para cambios exclusivamente documentales, revisa coherencia, enlaces y exportación; no repitas tests de aplicación sin motivo.
- Informa de fallos y verificaciones pendientes con precisión. Distingue pruebas previas, simuladas y ejecutadas en la tarea actual.
- Para cambios relevantes, actualiza en orden: código/diseño → STATUS.md → NEXT_ACTIONS.md → CHANGELOG.md → AGENT_LOG.md.
- Resume qué cambió, cómo se comprobó y qué queda pendiente. Usa commits claros, sin florituras.
