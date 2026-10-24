Type: task
ID: T003
Name: Estados de error y reintentos
Spec: 002-redisenio-panel-criptomonedas
Status: Completed
Date: 2026-10-23 18:35
Branch: task/002-t003-estados-de-error-y-reintentos
Depends on: T001
Covers: R7, R8, R9

## Description
Implementar los estados de error de la página rediseñada diferenciando los fallos de carga inicial de los fallos de actualización. El tratamiento de HTTP 429 conservará los datos existentes, evitará alertas duplicadas durante reintentos consecutivos y retirará la alerta después de una carga exitosa. Tomar en cuenta las imagenes en el directorio assets.

## To do
- [x] Mostrar el estado de error de carga inicial con una acción que vuelva a intentar la carga.
- [x] Tratar HTTP 429 durante actualizaciones con una alerta no duplicada, conservando los datos y reintentando automáticamente cada 10 segundos.
- [x] Informar de otros fallos de actualización sin descartar los datos ya recibidos y retirar la alerta de límite cuando una carga tenga éxito.

## Test (acceptance criteria)
- [ ] Un error inesperado durante la carga inicial muestra el estado de error y al activar reintento se intenta cargar de nuevo.
- [ ] Una respuesta HTTP 429 durante una actualización conserva las monedas existentes, muestra una sola alerta a través de reintentos consecutivos cada 10 segundos y la alerta desaparece cuando la carga tiene éxito.
- [ ] Un error de actualización distinto de HTTP 429 conserva los datos previamente cargados e informa que no se pudieron actualizar.
