# 0003 — Opción de alojamiento para piloto privado

Estado: propuesta de despliegue, implementación de compatibilidad aceptada. Fecha: 2026-10-02. Amplía ADR 0002.

El usuario elige Internet con acceso privado y confirma que no tiene alojamiento. Se prepara Render como opción concreta para un piloto pequeño, mediante `render.yaml`: servicio Python, un disco persistente de 1 GB, región Frankfurt y despliegues automáticos desactivados. Requiere un plan de pago; no se contrata ni se crea el servicio sin aprobación de coste y cuenta.

Render termina HTTPS en su entrada y reenvía HTTP a un puerto interno sin exposición directa a Internet, según https://render.com/docs/web-services. Se permite esta configuración solo con `RENDER=true`, origen HTTPS explícito o dominio suministrado por la plataforma, cookies Secure y lista de correos. No se confía en cabeceras de proxy proporcionadas por el visitante.

El registro requiere además un código de invitación largo generado en el alojamiento, entregado por el responsable al equipo. Esta invitación es compartida: no verifica correo ni reemplaza SSO. La pantalla de entrada es pública; el catálogo, notas y operaciones requieren sesión autorizada. La base no se incluye en el repositorio ni se envía al proveedor en esta intervención.

SQLite exige instancia única. Los respaldos al iniciar no sustituyen copia diaria externa. Persistencia oficial: https://render.com/docs/disks; configuración: https://render.com/docs/blueprint-spec. El servidor estándar permanece para un piloto detrás de la entrada gestionada; servicio de producción sostenido necesita sustituirlo por un servidor de aplicación de producción y completar QA de carga/operación.
