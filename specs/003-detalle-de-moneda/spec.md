Name: 003 Detalle de moneda
Status: Approved
Date: 2026-10-29 12:11

## Description
Al seleccionar una moneda de la lista, la aplicación mostrará una pantalla independiente de detalle inspirada en la referencia visual `pagina_detalle.png`. La pantalla presentará las métricas de mercado de la moneda y su evolución histórica de siete días cuando el proveedor disponga de esos datos. También permitirá gestionar el favorito de la moneda y regresar a la lista.

## Goals
- Consultar las métricas actuales y, cuando estén disponibles, el historial de siete días de la moneda seleccionada.
- Mantener los datos del detalle actualizados con el intervalo existente de 10 segundos.
- Permitir marcar o desmarcar la moneda como favorita desde el detalle usando la persistencia existente.

## Out of scope
- Compra, venta, transferencia de criptomonedas o gestión de una cartera.
- Alertas de precios.
- Incorporar otros períodos de historial o controles para configurar el gráfico.
- Rediseñar la lista de monedas o cambiar sus controles y comportamiento actuales.
- Cambiar de proveedor de mercado para obtener datos históricos.

## Requirements
- R1: Al tocar una fila de moneda, excepto su control de favorito, la aplicación abrirá una pantalla de detalle para esa moneda.
- R2: El detalle mostrará el logotipo, nombre y símbolo de la moneda seleccionada, su precio actual y su variación porcentual de 24 horas.
- R3: El detalle mostrará el máximo y mínimo de 24 horas, la capitalización de mercado y el volumen de 24 horas cuando esos datos estén disponibles. Ocultará individualmente las métricas que no estén disponibles.
- R4: El detalle mostrará un gráfico del precio histórico de los últimos siete días cuando el proveedor ofrezca datos históricos. Si no hay datos para el gráfico, mostrará el texto “No disponible”.
- R5: La estrella del detalle mostrará el estado actual de favorito y permitirá marcar o desmarcar la moneda usando la persistencia de favoritos ya existente; el cambio se reflejará en la lista al regresar.
- R6: El detalle actualizará las métricas y el historial cada 10 segundos, siguiendo el intervalo existente de actualización del mercado.
- R7: Si falla la carga inicial del detalle, se mostrará un estado de carga o error comprensible y una acción para reintentar. Si falla una actualización después de cargar datos, se conservarán los últimos datos y se indicará que no se pudieron actualizar.
- R8: La pantalla incluirá una acción para regresar a la lista. Al regresar, la lista se mostrará desde el inicio, sin conservar la posición o el estado de desplazamiento previo.

## Acceptance criteria
- [ ] Al tocar una fila se abre el detalle de la moneda correspondiente; tocar su estrella no abre el detalle.
- [ ] El detalle presenta identidad, precio y variación 24h, además de las métricas de 24h disponibles; las métricas ausentes no se muestran.
- [ ] Cuando existen datos históricos, se presenta el gráfico de siete días; cuando no existen, aparece “No disponible”.
- [ ] El detalle actualiza sus datos cada 10 segundos; un error inicial ofrece reintento y un error posterior conserva los últimos datos e informa que están desactualizados.
- [ ] Marcar o desmarcar el favorito en el detalle actualiza el estado persistido que utiliza la lista.
- [ ] La acción de regreso muestra nuevamente la lista desde el inicio.

## Technical notes
- Frontend: React. Backend: NestJS.
- Reutilizar el servicio de mercado, la persistencia de favoritos y los patrones de estados de carga y error existentes.
- La pantalla debe seguir el estilo oscuro y mobile-first de la referencia visual.
- El gráfico usará datos históricos reales del proveedor existente cuando estén disponibles. No se cambiará de proveedor como parte de esta especificación.

## Open questions
- ¿El proveedor de mercado existente ofrece datos históricos suficientes para construir el gráfico de siete días? Si no están disponibles, se mostrará “No disponible” sin cambiar de proveedor.

## Tasks
- [ ] [T001 - Datos de detalle e historial](tasks/T001-datos-detalle-e-historial.md)
- [ ] [T002 - Pantalla de detalle y navegación](tasks/T002-pantalla-detalle-y-navegacion.md)
- [ ] [T003 - Actualización, favoritos y estados](tasks/T003-actualizacion-favoritos-y-estados.md)
