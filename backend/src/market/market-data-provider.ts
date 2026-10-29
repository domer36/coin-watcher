import type { MarketAsset, MarketDetail, MarketQuery } from './market.types.js';

export const MARKET_DATA_PROVIDER = Symbol('MARKET_DATA_PROVIDER');

export interface MarketDataProvider {
  getMarkets(query: MarketQuery): Promise<MarketAsset[]>;
  getMarketDetail(id: string, currency: string): Promise<MarketDetail | null>;
  getQuoteCurrencies(): Promise<string[]>;
}
