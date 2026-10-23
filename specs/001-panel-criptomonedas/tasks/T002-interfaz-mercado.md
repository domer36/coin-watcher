Type: task
ID: T002
Name: Interfaz de mercado
Spec: 001-panel-criptomonedas
Status: Completed
Date: 2026-10-22 19:51
Branch: task/001-t002-interfaz-mercado
Depends on: T001
Covers: R1, R2, R3, R4, R5, R6

## Description
Crear en React la vista de mercado conectada al endpoint NestJS. La interfaz presentará la lista y sus métricas, y permitirá explorarla mediante paginación, búsqueda insensible a mayúsculas, ordenamiento y selección de moneda de cotización.

## To do
- [x] Mostrar hasta 20 criptomonedas por página con nombre, símbolo, precio, variación de 24 horas y capitalización.
- [x] Añadir navegación entre páginas de resultados.
- [x] Añadir búsqueda por nombre o símbolo sin distinguir mayúsculas de minúsculas.
- [x] Permitir ordenar por precio, nombre o capitalización de mercado.
- [x] Permitir seleccionar USD, EUR y las demás monedas disponibles, con USD como valor inicial.

## Test (acceptance criteria)
- [ ] La vista inicial muestra hasta 20 resultados ordenados por capitalización descendente y todas las métricas requeridas.
- [ ] La navegación permite consultar otra página y regresar a la página anterior.
- [ ] La búsqueda encuentra criptomonedas por nombre o símbolo ignorando diferencias de mayúsculas y minúsculas.
- [ ] Cada opción de ordenamiento cambia el orden visible según precio, nombre o capitalización.
- [ ] Cambiar la moneda de cotización actualiza los precios y la selección inicial es USD.
