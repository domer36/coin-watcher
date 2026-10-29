Type: task
ID: T002
Name: Pantalla de detalle y navegación
Spec: 003-detalle-de-moneda
Status: pending
Date: 2026-10-29 12:20
Branch: task/003-t002-pantalla-detalle-y-navegacion
Depends on: T001
Covers: R1, R2, R3, R4, R8

## Description
Crear la pantalla responsive de detalle usando los datos de mercado proporcionados por T001 y el estilo oscuro mobile-first de la aplicación. Conectar la selección de una moneda con su detalle, mostrar las métricas disponibles y el gráfico histórico o el texto “No disponible”, y permitir regresar a la lista desde el inicio.

## To do
- [ ] Implementar la pantalla de detalle para la moneda seleccionada, incluyendo identidad, precio, variación, métricas opcionales y gráfico o fallback.
- [ ] Conectar la apertura del detalle desde una fila sin interferir con el control de favorito.
- [ ] Implementar la acción de regreso para mostrar la lista desde el inicio y añadir pruebas de navegación y presentación.

## Test (acceptance criteria)
- [ ] Seleccionar una fila abre el detalle de la moneda correcta, mientras que activar el control de favorito no abre el detalle.
- [ ] El detalle muestra las métricas disponibles y el historial cuando existe; oculta individualmente las métricas ausentes y presenta “No disponible” si falta el historial.
- [ ] La acción de regreso devuelve a la lista con la posición de desplazamiento al inicio.
