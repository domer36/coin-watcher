Type: task
ID: T002
Name: Favoritos y menú lateral
Spec: 002-redisenio-panel-criptomonedas
Status: pending
Date: 2026-10-23 18:35
Branch: task/002-t002-favoritos-y-menu-lateral
Depends on: T001
Covers: R2, R3, R4, R6

## Description
Incorporar un control de estrella a las filas para marcar y desmarcar monedas como favoritas, guardar la selección en el navegador y anteponer las favoritas sin alterar el orden de mercado dentro de cada grupo. Añadir el menú lateral visual con datos mockeados y opciones que no naveguen ni ejecuten acciones. Tomar en cuenta las imagenes en el directorio assets.

## To do
- [ ] Añadir el control para marcar y desmarcar cada moneda y persistir la selección en el navegador.
- [ ] Ordenar la lista con favoritas primero, conservando el orden recibido dentro de ambos grupos.
- [ ] Añadir la apertura del menú lateral desde el encabezado, con imagen, nombre, correo y opciones visuales sin acciones.

## Test (acceptance criteria)
- [ ] Al alternar una estrella, el estado cambia inmediatamente y la lista reordena las favoritas primero, conservando el orden relativo de cada grupo.
- [ ] Tras recargar la página, las monedas previamente marcadas siguen favoritas y aparecen antes que las demás.
- [ ] El menú se puede abrir desde el encabezado, muestra los datos mockeados y sus opciones no cambian de ruta ni ejecutan acciones.
