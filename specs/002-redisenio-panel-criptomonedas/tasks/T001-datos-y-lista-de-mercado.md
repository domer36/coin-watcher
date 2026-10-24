Type: task
ID: T001
Name: Datos y lista de mercado
Spec: 002-redisenio-panel-criptomonedas
Status: Completed
Date: 2026-10-23 18:35
Branch: task/002-t001-datos-y-lista-de-mercado
Depends on: -
Covers: R1, R2, R5

## Description
Ampliar los datos que entrega el servicio de mercado para incluir logotipos de monedas y rediseñar la página principal como una lista oscura y adaptable. Las filas presentarán los datos de mercado requeridos y la página seguirá usando el servicio y la actualización automática existentes, sin los controles excluidos por la spec.

## To do
- [x] Ampliar la respuesta del servicio de mercado con el logotipo correspondiente a cada moneda.
- [x] Implementar el encabezado y la lista adaptable de monedas con los campos de mercado requeridos y retirar los controles fuera de alcance. utilizando como referencia las imagenes en la carpeta assets.
- [x] Conservar la carga inicial y las actualizaciones automáticas cada 10 segundos mediante el servicio existente.

## Test (acceptance criteria)
- [ ] La respuesta del servicio incluye un logotipo utilizable para cada moneda entregada y la interfaz lo muestra junto con nombre, símbolo, precio y variación de 24 horas.
- [ ] La página muestra la lista en los tamaños de pantalla contemplados y no presenta búsqueda, ordenamiento, selección de moneda ni paginación.
- [x] La carga inicial y las actualizaciones usan el servicio existente con un intervalo de 10 segundos.
