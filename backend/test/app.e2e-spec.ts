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
            name: 'Bitcoin',
            symbol: 'btc',
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
            name: 'Bitcoin',
            symbol: 'BTC',
            price: 65000,
            priceChangePercentage24h: 2.5,
            marketCap: 1_000_000,
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

  afterEach(async () => {
    await app.close();
    vi.unstubAllGlobals();
  });
});
