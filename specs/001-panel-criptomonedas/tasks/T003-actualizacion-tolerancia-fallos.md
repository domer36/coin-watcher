Type: task
ID: T003
Name: Actualización y tolerancia a fallos
Spec: 001-panel-criptomonedas
Status: pending
Date: 2026-10-22 19:51
Branch: task/001-t003-actualizacion-tolerancia-fallos
Depends on: T001, T002
Covers: R7, R8, R9

## Description
Actualizar automáticamente la lista cada 10 segundos usando el backend, sin ofrecer controles para cambiar el intervalo. La interfaz debe conservar los últimos datos válidos durante fallos de actualización e informar claramente del estado, además de presentar estados comprensibles antes de la primera respuesta, ante una lista vacía o cuando no haya datos previos disponibles.

## To do
- [ ] Programar la consulta periódica con un intervalo fijo de 10 segundos y limpiar el temporizador cuando la vista deje de estar activa.
- [ ] Conservar los últimos datos válidos si una actualización falla y mostrar un aviso de datos desactualizados.
- [ ] Mostrar estados de carga, lista vacía o sin coincidencias y error inicial según corresponda.
- [ ] Reintentar automáticamente en el siguiente intervalo después de un fallo.

## Test (acceptance criteria)
- [ ] Las solicitudes de actualización se realizan cada 10 segundos y la interfaz no incluye un control para configurar ese intervalo.
- [ ] Si falla una actualización tras una respuesta correcta, los datos anteriores permanecen visibles junto con un aviso de datos desactualizados.
- [ ] Si falla la carga inicial, se presenta un estado de error y se intenta nuevamente en el siguiente intervalo.
- [ ] Se distinguen los estados de carga, lista vacía y búsqueda sin coincidencias.
