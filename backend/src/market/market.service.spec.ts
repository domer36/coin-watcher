import { BadRequestException } from '@nestjs/common';
import { MarketService } from './market.service.js';
import type { MarketDataProvider } from './market-data-provider.js';

describe('MarketService', () => {
  const getMarkets = vi.fn<MarketDataProvider['getMarkets']>();
  const getQuoteCurrencies = vi.fn<MarketDataProvider['getQuoteCurrencies']>();
  const provider: MarketDataProvider = {
    getMarkets,
    getQuoteCurrencies,
  };
  let service: MarketService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MarketService(provider);
  });

  it('returns a paginated market result from the selected provider', async () => {
    getQuoteCurrencies.mockResolvedValue(['USD', 'EUR']);
    getMarkets.mockResolvedValue([
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        imageUrl:
          'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        price: 100,
        priceChangePercentage24h: 1.5,
        marketCap: 2000,
      },
    ]);

    await expect(
      service.getMarkets({ currency: 'usd', page: 2, perPage: 20 }),
    ).resolves.toEqual({
      data: [
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          imageUrl:
            'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          price: 100,
          priceChangePercentage24h: 1.5,
          marketCap: 2000,
        },
      ],
      page: 2,
      perPage: 20,
      hasMore: false,
    });
    expect(getMarkets).toHaveBeenCalledWith({
      currency: 'USD',
      page: 2,
      perPage: 20,
    });
  });

  it('rejects currencies not supported by the provider', async () => {
    getQuoteCurrencies.mockResolvedValue(['USD', 'EUR']);

    await expect(
      service.getMarkets({ currency: 'GBP', page: 1, perPage: 20 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getMarkets).not.toHaveBeenCalled();
  });
});
