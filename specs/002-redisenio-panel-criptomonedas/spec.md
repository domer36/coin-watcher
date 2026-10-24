Name: 002 Rediseño del panel de criptomonedas
Status: Approved
Date: 2026-10-23 18:26

## Description
Rediseñar la página principal de Coinwatch con el estilo oscuro y mobile-first de las imágenes de referencia. La página mostrará las monedas del servicio actual y permitirá marcarlas como favoritas, que aparecerán al inicio de la lista. El menú lateral y sus datos de perfil serán únicamente una maqueta visual.

## Goals
- Presentar los datos de mercado en una lista legible y adaptable a distintos tamaños de pantalla, siguiendo la referencia visual.
- Permitir marcar y desmarcar monedas como favoritas, mantener la selección entre recargas y priorizar las favoritas en la lista.
- Representar visualmente el menú lateral y los estados de error de carga.

## Out of scope
- Crear una página o ruta independiente que filtre y muestre solamente las monedas favoritas.
- Implementar navegación desde las opciones del menú, ni funcionalidades de perfil o configuración.
- Mantener los controles actuales de búsqueda, ordenamiento, moneda de cotización y paginación en la página rediseñada.
- Implementar autenticación, gestión de cartera, operaciones de compra/venta o cambiar el proveedor de datos de mercado.

## Requirements
- R1: La página principal tendrá un encabezado y una lista de monedas con el tema oscuro y la disposición adaptable inspirados en las referencias.
- R2: Cada fila mostrará el logotipo de la moneda, su nombre, símbolo, precio, variación porcentual de 24 horas y un control de estrella para marcarla o desmarcarla como favorita.
- R3: Las monedas favoritas aparecerán antes que las no favoritas. Dentro de cada grupo, las monedas conservarán el orden recibido del servicio de mercado.
- R4: La selección de favoritos se persistirá en el navegador y se restaurará al recargar la página.
- R5: La página mostrará las monedas devueltas por el servicio de mercado y continuará actualizándolas automáticamente cada 10 segundos, sin controles de búsqueda, orden, moneda o paginación.
- R6: El menú lateral podrá mostrarse desde el encabezado y presentará una imagen, nombre y correo mockeados. Sus opciones serán visuales y no navegarán ni ejecutarán acciones.
- R7: Si la carga inicial falla por un error inesperado, se mostrará un estado de error basado en la referencia, con una acción para reintentar la carga.
- R8: Si el servicio responde con límite de solicitudes (HTTP 429), se conservarán las monedas ya cargadas, se mostrará una alerta y se continuará reintentando automáticamente cada 10 segundos. La alerta no se duplicará durante reintentos consecutivos por el mismo límite y se retirará cuando la carga vuelva a tener éxito.
- R9: Si falla una actualización después de haber recibido datos por un motivo distinto al límite de solicitudes, se conservarán los datos y se indicará que no se pudieron actualizar, siguiendo el comportamiento existente del panel.

## Acceptance criteria
- [ ] La página principal presenta filas adaptables con logotipos, nombre, símbolo, precio, variación de 24 horas y estrella de favorito.
- [ ] Al marcar o desmarcar una moneda, la lista actualiza el orden inmediatamente; las favoritas aparecen primero y las monedas mantienen su orden relativo dentro de cada grupo.
- [ ] Después de recargar la página, las monedas favoritas previamente seleccionadas siguen marcadas y aparecen primero.
- [ ] El menú lateral muestra sus datos mockeados y sus opciones no navegan ni realizan acciones.
- [ ] No se muestran controles de búsqueda, ordenamiento, selección de moneda ni paginación; la carga inicial y las actualizaciones automáticas usan el servicio existente cada 10 segundos.
- [ ] Un error inesperado durante la carga inicial muestra el estado de error con reintento; un HTTP 429 durante actualizaciones conserva la lista, muestra una sola alerta y vuelve a intentar cada 10 segundos.
- [ ] Un error de actualización distinto a HTTP 429 conserva los datos previamente cargados e informa que la actualización falló.

## Technical notes
- Frontend: React.
- Backend: NestJS; ampliar los datos del servicio de mercado para que el frontend pueda mostrar logotipos reales por moneda.
- La persistencia de favoritos se realizará en el navegador.
- La página utilizará el servicio de mercado existente y conservará su intervalo de actualización de 10 segundos.

## Open questions
- None

## Tasks
- [ ] [T001 - Datos y lista de mercado](tasks/T001-datos-y-lista-de-mercado.md)
- [ ] [T002 - Favoritos y menú lateral](tasks/T002-favoritos-y-menu-lateral.md)
- [ ] [T003 - Estados de error y reintentos](tasks/T003-estados-de-error-y-reintentos.md)
