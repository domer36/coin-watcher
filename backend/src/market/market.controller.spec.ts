import { BadRequestException } from '@nestjs/common';
import type { MarketDataProvider } from './market-data-provider.js';
import { MarketController } from './market.controller.js';
import { MarketService } from './market.service.js';

describe('MarketController', () => {
  const provider: MarketDataProvider = {
    getMarkets: vi.fn().mockResolvedValue([]),
    getMarketDetail: vi.fn().mockResolvedValue(null),
    getQuoteCurrencies: vi.fn().mockResolvedValue(['USD', 'EUR']),
  };
  const marketService = new MarketService(provider);
  const getMarkets = vi.spyOn(marketService, 'getMarkets');
  let controller: MarketController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MarketController(marketService);
  });

  it('uses USD and the first page of 20 results by default', async () => {
    await controller.getMarkets();

    expect(getMarkets).toHaveBeenCalledWith({
      currency: 'USD',
      page: 1,
      perPage: 20,
    });
  });

  it('parses pagination and currency query parameters', async () => {
    await controller.getMarkets('EUR', '3', '10');

    expect(getMarkets).toHaveBeenCalledWith({
      currency: 'EUR',
      page: 3,
      perPage: 10,
    });
  });

  it.each([
    ['0', undefined],
    ['not-a-number', undefined],
    [undefined, '21'],
  ])('rejects invalid pagination values', (page, perPage) => {
    expect(() => controller.getMarkets('USD', page, perPage)).toThrow(
      BadRequestException,
    );
  });

  it('normalizes and requests the selected market detail', async () => {
    const getMarketDetail = vi.spyOn(marketService, 'getMarketDetail');
    getMarketDetail.mockResolvedValue({
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      imageUrl:
        'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      price: 65000,
      priceChangePercentage24h: 2.5,
      marketCap: 1_000_000,
      high24h: 66_000,
      low24h: 64_000,
      totalVolume24h: 50_000,
      priceHistory: null,
    });

    await controller.getMarketDetail('Bitcoin', 'eur');

    expect(getMarketDetail).toHaveBeenCalledWith('bitcoin', 'eur');
  });

  it('rejects invalid market IDs', () => {
    expect(() => controller.getMarketDetail('bitcoin/../../other')).toThrow(
      BadRequestException,
    );
  });
});
