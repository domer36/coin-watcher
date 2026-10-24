# Coinwatch — frontend

Interfaz React para consultar criptomonedas a través de la API NestJS.

## Desarrollo local

Instala las dependencias y ejecuta Vite:

```sh
npm install
npm run dev
```

El frontend solicita `/api/markets`. En desarrollo, Vite redirige esa ruta al
backend en `http://localhost:3000`. Para usar otro destino, define
`VITE_API_PROXY_TARGET`, por ejemplo:

```sh
VITE_API_PROXY_TARGET=http://localhost:3000 npm run dev
```

La vista carga las primeras 20 criptomonedas del mercado y las actualiza
automáticamente cada 10 segundos.
