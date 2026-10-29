import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { MarketDataProvider } from './market-data-provider.js';
import type {
  MarketAsset,
  MarketDetail,
  MarketPricePoint,
  MarketQuery,
} from './market.types.js';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const CURRENCIES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class CoinGeckoMarketDataProvider implements MarketDataProvider {
  private quoteCurrencies: string[] | undefined;
  private quoteCurrenciesExpiresAt = 0;
  private quoteCurrenciesRequest: Promise<string[]> | undefined;

  async getMarkets(query: MarketQuery): Promise<MarketAsset[]> {
    return this.fetchMarketAssets(query);
  }

  async getMarketDetail(
    id: string,
    currency: string,
  ): Promise<MarketDetail | null> {
    const assets = await this.fetchMarketAssets(
      { currency, page: 1, perPage: 1 },
      id,
    );
    const asset = assets.find((candidate) => candidate.id === id);
    if (!asset) {
      return null;
    }

    return {
      ...asset,
      priceHistory: await this.fetchPriceHistory(id, currency),
    };
  }

  async getQuoteCurrencies(): Promise<string[]> {
    if (this.quoteCurrencies && Date.now() < this.quoteCurrenciesExpiresAt) {
      return this.quoteCurrencies;
    }

    if (this.quoteCurrenciesRequest) {
      return this.quoteCurrenciesRequest;
    }

    const request = this.fetchQuoteCurrencies();
    this.quoteCurrenciesRequest = request;

    try {
      return await request;
    } finally {
      if (this.quoteCurrenciesRequest === request) {
        this.quoteCurrenciesRequest = undefined;
      }
    }
  }

  private async fetchQuoteCurrencies(): Promise<string[]> {
    const url = new URL(`${COINGECKO_API_URL}/simple/supported_vs_currencies`);
    const response = await this.fetchJson(url);

    if (
      !Array.isArray(response) ||
      !response.every(
        (currency): currency is string =>
          typeof currency === 'string' && /^[a-z0-9]{2,10}$/i.test(currency),
      )
    ) {
      throw new ServiceUnavailableException(
        'CoinGecko returned an invalid quote currencies response',
      );
    }

    this.quoteCurrencies = response.map((currency) => currency.toUpperCase());
    this.quoteCurrenciesExpiresAt = Date.now() + CURRENCIES_CACHE_TTL_MS;
    return this.quoteCurrencies;
  }

  private async fetchMarketAssets(
    query: MarketQuery,
    id?: string,
  ): Promise<MarketAsset[]> {
    const url = new URL(`${COINGECKO_API_URL}/coins/markets`);
    url.searchParams.set('vs_currency', query.currency.toLowerCase());
    url.searchParams.set('order', 'market_cap_desc');
    url.searchParams.set('per_page', String(query.perPage));
    url.searchParams.set('page', String(query.page));
    url.searchParams.set('price_change_percentage', '24h');
    if (id) {
      url.searchParams.set('ids', id);
    }

    const response = await this.fetchJson(url);
    if (!Array.isArray(response)) {
      throw new ServiceUnavailableException(
        'CoinGecko returned an invalid market data response',
      );
    }

    return response.map(toMarketAsset);
  }

  private async fetchPriceHistory(
    id: string,
    currency: string,
  ): Promise<MarketPricePoint[] | null> {
    const url = new URL(
      `${COINGECKO_API_URL}/coins/${encodeURIComponent(id)}/market_chart`,
    );
    url.searchParams.set('vs_currency', currency.toLowerCase());
    url.searchParams.set('days', '7');

    const response = await this.fetchJson(url);
    if (!isRecord(response)) {
      throw new ServiceUnavailableException(
        'CoinGecko returned an invalid market history response',
      );
    }

    const prices = response.prices;
    if (
      prices === undefined ||
      prices === null ||
      (Array.isArray(prices) && prices.length === 0)
    ) {
      return null;
    }
    if (!Array.isArray(prices)) {
      throw new ServiceUnavailableException(
        'CoinGecko returned an invalid market history response',
      );
    }

    return prices.map(toMarketPricePoint);
  }

  private async fetchJson(url: URL): Promise<unknown> {
    const apiKey = process.env.COINGECKO_API_KEY;
    let response: Response;

    try {
      response = await fetch(url, {
        headers: apiKey ? { 'x-cg-demo-api-key': apiKey } : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        'Unable to reach the CoinGecko API',
        { cause: error },
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `CoinGecko API returned HTTP ${response.status}`,
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ServiceUnavailableException(
        'CoinGecko returned an invalid JSON response',
        { cause: error },
      );
    }
  }
}

function toMarketAsset(value: unknown): MarketAsset {
  if (!isRecord(value)) {
    throw new ServiceUnavailableException(
      'CoinGecko returned an invalid market data item',
    );
  }

  const { name, symbol, image } = value;
  if (
    typeof name !== 'string' ||
    typeof symbol !== 'string' ||
    typeof image !== 'string' ||
    name.length === 0 ||
    symbol.length === 0 ||
    !isHttpUrl(image)
  ) {
    throw new ServiceUnavailableException(
      'CoinGecko returned an invalid market data item',
    );
  }

  return {
    id: toNonEmptyString(value.id, 'id'),
    name,
    symbol: symbol.toUpperCase(),
    imageUrl: image,
    price: toNullableNumber(value.current_price, 'current_price'),
    priceChangePercentage24h: toNullableNumber(
      value.price_change_percentage_24h,
      'price_change_percentage_24h',
    ),
    marketCap: toNullableNumber(value.market_cap, 'market_cap'),
    high24h: toNullableNumber(value.high_24h, 'high_24h'),
    low24h: toNullableNumber(value.low_24h, 'low_24h'),
    totalVolume24h: toNullableNumber(value.total_volume, 'total_volume'),
  };
}

function toMarketPricePoint(value: unknown): MarketPricePoint {
  if (
    !Array.isArray(value) ||
    value.length < 2 ||
    typeof value[0] !== 'number' ||
    !Number.isFinite(value[0]) ||
    typeof value[1] !== 'number' ||
    !Number.isFinite(value[1])
  ) {
    throw new ServiceUnavailableException(
      'CoinGecko returned an invalid market history point',
    );
  }

  return { timestamp: value[0], price: value[1] };
}

function toNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ServiceUnavailableException(
      `CoinGecko returned an invalid ${field} value`,
    );
  }
  return value;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function toNullableNumber(value: unknown, field: string): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  throw new ServiceUnavailableException(
    `CoinGecko returned an invalid ${field} value`,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
