Type: task
ID: T001
Name: Datos de detalle e historial
Spec: 003-detalle-de-moneda
Status: Completed
Date: 2026-10-29 12:20
Branch: task/003-t001-datos-detalle-e-historial
Depends on: -
Covers: R2, R3, R4

## Description
Extender el acceso y mapeo de los datos del proveedor existente para entregar la identidad y las métricas de mercado necesarias para el detalle, junto con el historial real de siete días cuando esté disponible. Los campos opcionales deben seguir siendo identificables como no disponibles para que la interfaz pueda ocultar métricas o mostrar el fallback del gráfico sin cambiar de proveedor.

## To do
- [x] Revisar el servicio y los tipos actuales de datos de mercado; extenderlos para exponer los campos de detalle y el historial de siete días disponibles.
- [x] Mantener opcionales los datos que el proveedor pueda omitir y adaptar los consumidores existentes sin cambiar su comportamiento.
- [x] Añadir o actualizar pruebas del mapeo de métricas e historial, incluidos datos ausentes.

## Test (acceptance criteria)
- [x] Una respuesta de mercado con datos completos produce identidad, precio, variación, métricas de 24 horas e historial con tipos y valores correctos.
- [x] Respuestas sin una métrica opcional o sin historial mantienen esos datos ausentes y no provocan errores de mapeo; las pruebas existentes del servicio pasan.
