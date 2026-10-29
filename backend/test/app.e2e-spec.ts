import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/markets (GET) returns normalized market data', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(['usd', 'eur']))
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
      );
    vi.stubGlobal('fetch', fetchMock);

    await request(app.getHttpServer())
      .get('/markets?currency=EUR&page=2')
      .expect(200)
      .expect({
        data: [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            imageUrl:
              'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            price: 65000,
            priceChangePercentage24h: 2.5,
            marketCap: 1_000_000,
            high24h: null,
            low24h: null,
            totalVolume24h: null,
          },
        ],
        page: 2,
        perPage: 20,
        hasMore: false,
      });
  });

  it('/markets/currencies (GET) returns supported quote currencies', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(['usd', 'eur', 'jpy']));
    vi.stubGlobal('fetch', fetchMock);

    await request(app.getHttpServer())
      .get('/markets/currencies')
      .expect(200)
      .expect(['USD', 'EUR', 'JPY']);
  });

  it('/markets/:id (GET) returns market details and seven-day history', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(['usd', 'eur']))
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
        Response.json({ prices: [[1_761_600_000_000, 64_500]] }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await request(app.getHttpServer())
      .get('/markets/bitcoin?currency=EUR')
      .expect(200)
      .expect({
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
        priceHistory: [{ timestamp: 1_761_600_000_000, price: 64_500 }],
      });
  });

  afterEach(async () => {
    await app.close();
    vi.unstubAllGlobals();
  });
});
