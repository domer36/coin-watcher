Name: 001 Panel de criptomonedas
Status: Completed
Date: 2026-10-21 18:14

## Description
Aplicación web para inversores y traders que permite consultar y explorar precios y métricas de mercado de criptomonedas. La aplicación obtiene datos de un proveedor público y actualiza la información automáticamente cada 10 segundos para facilitar el seguimiento del mercado.

## Goals
- Consultar las principales criptomonedas y sus precios en una lista navegable.
- Facilitar la comparación del mercado mediante búsqueda, ordenamiento y selección de moneda de cotización.
- Mantener la información actualizada e indicar claramente cuándo los datos no se han podido actualizar.

## Out of scope
- Registro, autenticación y gestión de cuentas de usuario.
- Compra, venta o transferencia de criptomonedas.
- Gestión de una cartera personal, alertas de precio y gráficos históricos.
- Configuración del intervalo de actualización desde la interfaz.

## Requirements
- R1: La aplicación mostrará por defecto las 20 criptomonedas con mayor capitalización de mercado, ordenadas de mayor a menor capitalización.
- R2: La lista permitirá paginar para consultar criptomonedas adicionales disponibles en el proveedor.
- R3: Cada fila mostrará el nombre, símbolo, precio actual, variación porcentual de las últimas 24 horas y capitalización de mercado de la criptomoneda.
- R4: El usuario podrá buscar criptomonedas por nombre o símbolo; la búsqueda no distinguirá mayúsculas de minúsculas.
- R5: El usuario podrá ordenar los resultados por precio, nombre o capitalización de mercado.
- R6: La moneda de cotización inicial será USD. El usuario podrá seleccionar USD, EUR y las demás monedas de cotización que ofrezca el proveedor.
- R7: El backend solicitará los datos al proveedor público y la aplicación actualizará la lista automáticamente cada 10 segundos. El intervalo será fijo y no configurable por el usuario en este MVP.
- R8: Si falla una actualización después de haber recibido datos, la aplicación conservará los últimos datos recibidos, indicará que están desactualizados y volverá a intentarlo en el siguiente intervalo.
- R9: La aplicación mostrará estados comprensibles de carga, lista vacía/sin coincidencias y error cuando no existan datos previos que se puedan mostrar.

## Acceptance criteria
- [ ] Al abrir la aplicación, se muestran hasta 20 criptomonedas por página, inicialmente ordenadas por capitalización de mercado descendente, con los campos definidos en R3.
- [ ] El usuario puede navegar entre páginas y buscar criptomonedas por nombre o símbolo sin distinguir mayúsculas de minúsculas.
- [ ] El usuario puede cambiar el orden por precio, nombre o capitalización, y seleccionar USD, EUR u otra moneda de cotización disponible.
- [ ] Los datos se solicitan nuevamente cada 10 segundos sin un control de configuración del intervalo en la interfaz.
- [ ] Cuando falla una actualización, se conservan los datos previamente recibidos y se presenta un aviso de datos desactualizados; si aún no hay datos, se muestra un estado de error.
- [ ] La aplicación funciona con una API pública de mercado integrada a través del backend NestJS, sin exponer credenciales del proveedor al navegador si este requiere credenciales.

## Technical notes
- Frontend: React.
- Backend: NestJS.
- Fuente de precios: API pública de datos de mercado de criptomonedas. El proveedor concreto se seleccionará durante la implementación, teniendo en cuenta disponibilidad de USD y EUR, monedas adicionales y límites de solicitudes compatibles con la actualización cada 10 segundos.
- El backend será responsable de comunicarse con el proveedor y servir los datos al frontend.
- El proyecto se deberá ejecutar con docker-compose
- El backend y el frontend estarán en carpetas separadas

## Open questions
- ¿Qué proveedor público se utilizará y qué monedas adicionales a USD y EUR estarán disponibles? La elección queda para la implementación, condicionada a los límites y capacidades del proveedor.

## Tasks
- [ ] [T001 - Integración de datos de mercado](tasks/T001-integracion-datos-mercado.md)
- [ ] [T002 - Interfaz de mercado](tasks/T002-interfaz-mercado.md)
- [ ] [T003 - Actualización y tolerancia a fallos](tasks/T003-actualizacion-tolerancia-fallos.md)
- [ ] [T004 - Ejecución integrada con Docker Compose](tasks/T004-ejecucion-docker-compose.md)
