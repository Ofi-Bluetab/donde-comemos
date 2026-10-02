# 0008 — Listado común y participantes de cada comida

Estado: aceptada. Fecha: 2026-10-02. Supersede el modelo de grupos del ADR 0007.

El usuario aclara que no necesita crear ni unirse a grupos: quiere seleccionar quién come ese día desde el listado de compañeros registrados. Se mantiene el registro libre, las cuentas individuales y los filtros diarios.

Todos los usuarios autorizados y conectados ven el listado común de nombres, filtros del día y restaurantes. Sus notas siguen siendo individuales. Las recomendaciones validan los participantes elegidos y combinan únicamente sus filtros diarios. No se crean grupos persistentes ni códigos, y se retiran sus rutas y controles de interfaz.

Se conservan las migraciones aplicadas y las tablas históricas de grupos sin utilizarlas. No se borra ni reasigna ninguna cuenta, restaurante, nota o sesión. Los restaurantes de cualquier grupo anterior pasan a mostrarse en el catálogo común mediante la lectura global; los nuevos restaurantes no necesitan grupo. No se devuelve metadata ni códigos de grupos en la API.

Una cuenta nueva aparece directamente en el listado y puede usar el catálogo tras registrarse. Con ALLOWED_EMAILS vacía esto incluye todas las cuentas registradas. La autenticación, protección de origen, límites de acceso, PASSWORD_PEPPER y plan gratuito permanecen vigentes.
