Type: task
ID: T001
Name: Integración de datos de mercado
Spec: 001-panel-criptomonedas
Status: pending
Date: 2026-10-22 19:51
Branch: task/001-t001-integracion-datos-mercado
Depends on: -
Covers: R1, R2, R3, R6, R7

## Description
Seleccionar un proveedor público que cumpla las necesidades de monedas de cotización y límites de solicitudes del MVP. Implementar en NestJS el acceso al proveedor y un endpoint que exponga la lista paginada con nombre, símbolo, precio, variación porcentual de 24 horas y capitalización de mercado, manteniendo cualquier credencial fuera del navegador.

## To do
- [ ] Evaluar y seleccionar un proveedor compatible con USD, EUR, otras monedas disponibles y las solicitudes periódicas previstas.
- [ ] Implementar el servicio NestJS para consultar y normalizar las métricas de mercado del proveedor.
- [ ] Exponer un endpoint paginado con USD como moneda inicial y las monedas de cotización disponibles.
- [ ] Mantener las credenciales del proveedor, si las requiere, exclusivamente en el backend.
- [ ] Mantener una arquitectura escalable por si en el futuro se decide cambiar de proveedor no afecte la integración de nuevos proveedores

## Test (acceptance criteria)
- [ ] Una consulta inicial devuelve como máximo 20 criptomonedas, ordenadas por capitalización descendente, con todos los campos de R3.
- [ ] Una solicitud de página posterior devuelve resultados distintos cuando el proveedor dispone de más datos.
- [ ] El endpoint permite solicitar USD y EUR, y expone las demás monedas de cotización que ofrezca el proveedor.
- [ ] Las credenciales requeridas por el proveedor no aparecen en la respuesta ni en los recursos enviados al navegador.
