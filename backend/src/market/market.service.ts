import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MARKET_DATA_PROVIDER,
  type MarketDataProvider,
} from './market-data-provider.js';
import type { MarketDetail, MarketPage, MarketQuery } from './market.types.js';

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

  async getMarketDetail(id: string, currency: string): Promise<MarketDetail> {
    const normalizedCurrency = currency.toUpperCase();
    const currencies = await this.marketDataProvider.getQuoteCurrencies();
    if (!currencies.includes(normalizedCurrency)) {
      throw new BadRequestException(
        `Unsupported quote currency: ${normalizedCurrency}`,
      );
    }

    const detail = await this.marketDataProvider.getMarketDetail(
      id,
      normalizedCurrency,
    );
    if (!detail) {
      throw new NotFoundException(`Market asset not found: ${id}`);
    }
    return detail;
  }

  getQuoteCurrencies(): Promise<string[]> {
    return this.marketDataProvider.getQuoteCurrencies();
  }
}
