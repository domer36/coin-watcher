Type: task
ID: T003
Name: Actualización, favoritos y estados
Spec: 003-detalle-de-moneda
Status: Completed
Date: 2026-10-29 12:20
Branch: task/003-t003-actualizacion-favoritos-y-estados
Depends on: T001, T002
Covers: R5, R6, R7

## Description
Completar la integración operativa del detalle: actualizar métricas e historial cada 10 segundos, usar la persistencia existente para cambiar favoritos y comunicar los estados de carga y error. Un error posterior a una carga correcta debe conservar los últimos datos e indicar que no se pudieron actualizar.

## To do
- [x] Conectar el refresco del detalle al intervalo existente de 10 segundos para métricas e historial, evitando dejar actualizaciones activas al salir de la pantalla.
- [x] Conectar la estrella a la persistencia existente de favoritos y reflejar el cambio al regresar a la lista.
- [x] Implementar estados comprensibles de carga y error inicial con reintento, y conservar datos e indicar desactualización ante errores de actualización.
- [x] Añadir o actualizar pruebas para el refresco, favoritos y transiciones de estado.

## Test (acceptance criteria)
- [x] Con el detalle abierto, los datos se vuelven a solicitar en el intervalo de 10 segundos y dejan de actualizarse al salir de la pantalla.
- [x] Marcar y desmarcar la estrella persiste el favorito y el estado actualizado aparece en la lista al regresar.
- [x] Un fallo inicial muestra un error comprensible y permite reintentar; un fallo posterior conserva los últimos datos e informa que no se pudieron actualizar.
