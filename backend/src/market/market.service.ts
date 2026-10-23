import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  MARKET_DATA_PROVIDER,
  type MarketDataProvider,
} from './market-data-provider.js';
import type { MarketPage, MarketQuery } from './market.types.js';

@Injectable()
export class MarketService {
  constructor(
    @Inject(MARKET_DATA_PROVIDER)
    private readonly marketDataProvider: MarketDataProvider,
  ) {}

  async getMarkets(query: MarketQuery): Promise<MarketPage> {
    const currency = query.currency.toUpperCase();
    const currencies = await this.marketDataProvider.getQuoteCurrencies();
    if (!currencies.includes(currency)) {
      throw new BadRequestException(`Unsupported quote currency: ${currency}`);
    }

    const data = await this.marketDataProvider.getMarkets({
      ...query,
      currency,
    });

    return {
      data,
      page: query.page,
      perPage: query.perPage,
      hasMore: data.length === query.perPage,
    };
  }

  getQuoteCurrencies(): Promise<string[]> {
    return this.marketDataProvider.getQuoteCurrencies();
  }
}
