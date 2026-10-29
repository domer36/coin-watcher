import { ServiceUnavailableException } from '@nestjs/common';
import { CoinGeckoMarketDataProvider } from './coingecko-market-data.provider.js';

describe('CoinGeckoMarketDataProvider', () => {
  let provider: CoinGeckoMarketDataProvider;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    vi.stubEnv('COINGECKO_API_KEY', '');
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    provider = new CoinGeckoMarketDataProvider();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('requests 24-hour market data using the requested currency and page', async () => {
    fetchMock.mockResolvedValue(
      Response.json([
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'btc',
          image:
            'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          current_price: 65000,
          price_change_percentage_24h: 2.5,
          market_cap: 1_000_000,
          high_24h: 66_000,
          low_24h: 64_000,
          total_volume: 50_000,
        },
      ]),
    );

    await expect(
      provider.getMarkets({ currency: 'EUR', page: 2, perPage: 20 }),
    ).resolves.toEqual([
      {
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
      },
    ]);

    const requestedUrl = fetchMock.mock.calls[0]?.[0];
    if (!(requestedUrl instanceof URL)) {
      throw new Error('CoinGecko request did not use a URL');
    }
    const url = requestedUrl;
    expect(url.pathname).toBe('/api/v3/coins/markets');
    expect(url.searchParams.get('vs_currency')).toBe('eur');
    expect(url.searchParams.get('order')).toBe('market_cap_desc');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('per_page')).toBe('20');
    expect(url.searchParams.get('price_change_percentage')).toBe('24h');
  });

  it('requests subsequent pages separately', async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json([
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            image:
              'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            current_price: 65000,
            price_change_percentage_24h: 2.5,
            market_cap: 1_000_000,
          },
        ]),
      )
      .mockResolvedValueOnce(
        Response.json([
          {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'eth',
            image:
              'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            current_price: 3500,
            price_change_percentage_24h: 1.5,
            market_cap: 500_000,
          },
        ]),
      );

    const firstPage = await provider.getMarkets({
      currency: 'USD',
      page: 1,
      perPage: 20,
    });
    const secondPage = await provider.getMarkets({
      currency: 'USD',
      page: 2,
      perPage: 20,
    });

    expect(firstPage[0]?.name).toBe('Bitcoin');
    expect(secondPage[0]?.name).toBe('Ethereum');
    const pages = fetchMock.mock.calls.map(([requestedUrl]) => {
      if (!(requestedUrl instanceof URL)) {
        throw new Error('CoinGecko request did not use a URL');
      }
      return requestedUrl.searchParams.get('page');
    });
    expect(pages).toEqual(['1', '2']);
  });

  it.each([undefined, '', 'javascript:alert(1)'])(
    'rejects market data without a usable logo URL (%s)',
    async (image) => {
      fetchMock.mockResolvedValue(
        Response.json([
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            image,
            current_price: 65000,
            price_change_percentage_24h: 2.5,
            market_cap: 1_000_000,
          },
        ]),
      );

      await expect(
        provider.getMarkets({ currency: 'USD', page: 1, perPage: 20 }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    },
  );

  it('requests and caches the provider quote currencies', async () => {
    fetchMock.mockResolvedValue(Response.json(['usd', 'eur', 'jpy']));

    await expect(provider.getQuoteCurrencies()).resolves.toEqual([
      'USD',
      'EUR',
      'JPY',
    ]);
    await provider.getQuoteCurrencies();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps detail metrics and seven days of price history', async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json([
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            image:
              'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            current_price: 65000,
            price_change_percentage_24h: 2.5,
            market_cap: 1_000_000,
            high_24h: 66_000,
            low_24h: 64_000,
            total_volume: 50_000,
          },
        ]),
      )
      .mockResolvedValueOnce(
        Response.json({
          prices: [
            [1_761_600_000_000, 64_500],
            [1_762_200_000_000, 65_000],
          ],
        }),
      );

    await expect(provider.getMarketDetail('bitcoin', 'USD')).resolves.toEqual({
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
      priceHistory: [
        { timestamp: 1_761_600_000_000, price: 64_500 },
        { timestamp: 1_762_200_000_000, price: 65_000 },
      ],
    });

    const marketsUrl = fetchMock.mock.calls[0]?.[0];
    const historyUrl = fetchMock.mock.calls[1]?.[0];
    if (!(marketsUrl instanceof URL) || !(historyUrl instanceof URL)) {
      throw new Error('CoinGecko request did not use a URL');
    }
    expect(marketsUrl.pathname).toBe('/api/v3/coins/markets');
    expect(marketsUrl.searchParams.get('ids')).toBe('bitcoin');
    expect(historyUrl.pathname).toBe('/api/v3/coins/bitcoin/market_chart');
    expect(historyUrl.searchParams.get('vs_currency')).toBe('usd');
    expect(historyUrl.searchParams.get('days')).toBe('7');
  });

  it('keeps omitted optional metrics and history unavailable', async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json([
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            image:
              'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          },
        ]),
      )
      .mockResolvedValueOnce(Response.json({}));

    await expect(
      provider.getMarketDetail('bitcoin', 'USD'),
    ).resolves.toMatchObject({
      id: 'bitcoin',
      price: null,
      priceChangePercentage24h: null,
      marketCap: null,
      high24h: null,
      low24h: null,
      totalVolume24h: null,
      priceHistory: null,
    });
  });

  it('returns no detail when the provider does not return the requested asset', async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));

    await expect(
      provider.getMarketDetail('unknown-coin', 'USD'),
    ).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps an optional demo API key on backend requests', async () => {
    vi.stubEnv('COINGECKO_API_KEY', 'server-side-key');
    fetchMock.mockResolvedValue(Response.json([]));

    await provider.getMarkets({ currency: 'USD', page: 1, perPage: 20 });

    const [, options] = fetchMock.mock.calls[0] ?? [];
    expect(options).toMatchObject({
      headers: { 'x-cg-demo-api-key': 'server-side-key' },
    });
  });

  it('surfaces provider errors as service unavailable', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 429 }));

    await expect(
      provider.getMarkets({ currency: 'USD', page: 1, perPage: 20 }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
