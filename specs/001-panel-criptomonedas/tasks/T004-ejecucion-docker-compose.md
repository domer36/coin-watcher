Type: task
ID: T004
Name: Ejecución integrada con Docker Compose
Spec: 001-panel-criptomonedas
Status: in review
Date: 2026-10-22 19:51
Branch: task/001-t004-ejecucion-docker-compose
Depends on: T001, T002, T003
Covers: R7

## Description
Configurar la ejecución del frontend React y el backend NestJS como servicios separados mediante docker-compose. Verificar que el frontend puede comunicarse con el backend en el entorno compuesto y que las funciones del MVP operan juntas.

## To do
- [x] Añadir la configuración docker-compose para los servicios separados de frontend y backend.
- [x] Configurar la comunicación del frontend con el backend y el paso seguro de configuración requerida por el proveedor.
- [x] Documentar o dejar claro el comando necesario para iniciar la aplicación completa.

## Test (acceptance criteria)
- [x] El comando documentado de docker-compose inicia correctamente los servicios de frontend y backend.
- [x] Desde el frontend iniciado en el entorno compuesto se obtienen datos de mercado a través del backend.
- [x] La aplicación compuesta conserva la actualización cada 10 segundos sin exponer credenciales del proveedor al navegador.
