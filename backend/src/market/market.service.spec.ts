import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MarketService } from './market.service.js';
import type { MarketDataProvider } from './market-data-provider.js';

describe('MarketService', () => {
  const getMarkets = vi.fn<MarketDataProvider['getMarkets']>();
  const getMarketDetail = vi.fn<MarketDataProvider['getMarketDetail']>();
  const getQuoteCurrencies = vi.fn<MarketDataProvider['getQuoteCurrencies']>();
  const provider: MarketDataProvider = {
    getMarkets,
    getMarketDetail,
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

  it('returns detail data from the selected provider and normalized currency', async () => {
    getQuoteCurrencies.mockResolvedValue(['USD', 'EUR']);
    getMarketDetail.mockResolvedValue({
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      price: 65000,
      priceChangePercentage24h: 2.5,
      marketCap: 1_000_000,
      high24h: 66_000,
      low24h: 64_000,
      totalVolume24h: 50_000,
      priceHistory: [{ timestamp: 1_761_600_000_000, price: 64_500 }],
    });

    await expect(
      service.getMarketDetail('bitcoin', 'eur'),
    ).resolves.toMatchObject({
      id: 'bitcoin',
      price: 65000,
      priceHistory: [{ timestamp: 1_761_600_000_000, price: 64_500 }],
    });
    expect(getMarketDetail).toHaveBeenCalledWith('bitcoin', 'EUR');
  });

  it('rejects unsupported detail currencies without querying the asset', async () => {
    getQuoteCurrencies.mockResolvedValue(['USD', 'EUR']);

    await expect(
      service.getMarketDetail('bitcoin', 'GBP'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getMarketDetail).not.toHaveBeenCalled();
  });

  it('reports an asset missing from the provider', async () => {
    getQuoteCurrencies.mockResolvedValue(['USD']);
    getMarketDetail.mockResolvedValue(null);

    await expect(
      service.getMarketDetail('unknown-coin', 'USD'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
