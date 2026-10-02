# 0006 — Filtros personales para la comida de hoy

Estado: aceptada. Fecha: 2026-10-02.

Cada cuenta guarda en D1 una sola selección diaria: máximo de minutos a pie (solo ida), presupuesto máximo por persona y tipo de cocina. Campos vacíos significan sin límite. El día se calcula en Europe/Madrid; una selección anterior no se aplica al día siguiente. Las valoraciones no cambian.

La lista aplica los filtros del usuario conectado. Las recomendaciones conservan la puntuación existente y solo incluyen restaurantes compatibles con los filtros actuales de todos los participantes seleccionados. Los límites son inclusivos; dos cocinas diferentes pueden dejar el grupo sin coincidencias. Se muestran los criterios de los participantes y un mensaje sin resultados, sin relajar restricciones en silencio.

Se añade una tabla por usuario mediante migración aditiva. No se modifican restaurantes, cuentas, sesiones ni notas existentes. No se calcula la duración total de la comida ni se buscan restaurantes externos.
