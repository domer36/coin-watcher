# Coinwatch — frontend

Interfaz React para consultar criptomonedas a través de la API NestJS.

## Desarrollo local

Instala las dependencias y ejecuta Vite:

```sh
npm install
npm run dev
```

El frontend solicita `/api/markets` y `/api/markets/currencies`. En desarrollo,
Vite redirige esas rutas al backend en `http://localhost:3000`. Para usar otro
destino, define `VITE_API_PROXY_TARGET`, por ejemplo:

```sh
VITE_API_PROXY_TARGET=http://localhost:3000 npm run dev
```

La vista carga 20 criptomonedas por página, permite buscar dentro de los
resultados de la página actual por nombre o símbolo, ordenar por capitalización,
precio o nombre y seleccionar las monedas de cotización que publica el backend.
