import type { MarketAsset, MarketQuery } from './market.types.js';

export const MARKET_DATA_PROVIDER = Symbol('MARKET_DATA_PROVIDER');

export interface MarketDataProvider {
  getMarkets(query: MarketQuery): Promise<MarketAsset[]>;
  getQuoteCurrencies(): Promise<string[]>;
}
