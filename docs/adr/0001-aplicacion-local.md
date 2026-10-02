# 0001 — Aplicación compartida en servidor local

Estado: aceptada. Fecha: 2026-10-02.

Repositorio vacío y publicación externa no autorizada. Se implementa una aplicación local con Python estándar, SQLite y HTML/CSS/JavaScript, sin dependencias externas. Se adapta la guía Sites al alcance local; no se inicializa un proyecto alojado. Un único servidor comparte usuarios y valoraciones entre navegadores. Las cuentas usan contraseñas con scrypt y sesiones opacas en cookies HttpOnly. Los cambios requieren sesión y comprobación de origen.

Cada usuario mantiene una valoración actual por restaurante en cuatro categorías (1–5, siempre mayor es mejor). Precio significa relación calidad/precio; distancia significa comodidad. Minutos y coste son datos objetivos del restaurante. La recomendación combina preferencias del grupo con medias suavizadas y muestra cobertura; los sitios nuevos se comparan por cocina, coste y distancia. No se inventan restaurantes ni se consulta un proveedor externo. Los ejemplos se identifican explícitamente.

El servidor escucha en localhost por defecto. Antes de uso real fuera del equipo debe configurarse acceso privado y HTTPS; este cambio no incluye despliegue. No se implementan funcionalidades adicionales.
