# Coinwatch

Aplicación React y NestJS para consultar datos de mercado de criptomonedas.

## Iniciar con Docker Compose

Desde la raíz del proyecto, copia `.env.example` a `.env` y, si tienes una
clave Demo de CoinGecko, asígnala a `COINGECKO_API_KEY` en ese archivo. La clave
es opcional y solo se proporciona al contenedor del backend.

```sh
cp .env.example .env
# Edita .env si vas a configurar COINGECKO_API_KEY.
docker compose up --build
```

Abre <http://localhost:8080>. El frontend solicita los datos a través de
Nginx, que reenvía `/api/markets` y `/api/markets/currencies` al servicio
NestJS en la red interna de Compose. El backend consulta CoinGecko y mantiene
cualquier clave fuera del navegador. La interfaz actualiza los datos cada
10 segundos.

Para detener los servicios, ejecuta `docker compose down`.
