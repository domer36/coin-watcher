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
          name: 'Bitcoin',
          symbol: 'btc',
          current_price: 65000,
          price_change_percentage_24h: 2.5,
          market_cap: 1_000_000,
        },
      ]),
    );

    await expect(
      provider.getMarkets({ currency: 'EUR', page: 2, perPage: 20 }),
    ).resolves.toEqual([
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        price: 65000,
        priceChangePercentage24h: 2.5,
        marketCap: 1_000_000,
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
            name: 'Bitcoin',
            symbol: 'btc',
            current_price: 65000,
            price_change_percentage_24h: 2.5,
            market_cap: 1_000_000,
          },
        ]),
      )
      .mockResolvedValueOnce(
        Response.json([
          {
            name: 'Ethereum',
            symbol: 'eth',
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
