import { Module } from '@nestjs/common';
import { CoinGeckoMarketDataProvider } from './coingecko-market-data.provider.js';
import { MARKET_DATA_PROVIDER } from './market-data-provider.js';
import { MarketController } from './market.controller.js';
import { MarketService } from './market.service.js';

@Module({
  controllers: [MarketController],
  providers: [
    MarketService,
    CoinGeckoMarketDataProvider,
    {
      provide: MARKET_DATA_PROVIDER,
      useExisting: CoinGeckoMarketDataProvider,
    },
  ],
})
export class MarketModule {}
