import { BadRequestException } from '@nestjs/common';
import type { MarketDataProvider } from './market-data-provider.js';
import { MarketController } from './market.controller.js';
import { MarketService } from './market.service.js';

describe('MarketController', () => {
  const provider: MarketDataProvider = {
    getMarkets: vi.fn().mockResolvedValue([]),
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
});
