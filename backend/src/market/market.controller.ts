import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { MarketService } from './market.service.js';
import type { MarketPage } from './market.types.js';

@Controller('markets')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get()
  getMarkets(
    @Query('currency') currency = 'USD',
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ): Promise<MarketPage> {
    return this.marketService.getMarkets({
      currency,
      page: parsePositiveInteger(page, 'page', 1),
      perPage: parsePositiveInteger(perPage, 'perPage', 20, 20),
    });
  }

  @Get('currencies')
  getQuoteCurrencies(): Promise<string[]> {
    return this.marketService.getQuoteCurrencies();
  }
}

function parsePositiveInteger(
  value: string | undefined,
  name: string,
  defaultValue: number,
  maximum?: number,
): number {
  if (value === undefined) {
    return defaultValue;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    throw new BadRequestException(`${name} must be a positive integer`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || (maximum && parsed > maximum)) {
    const limit = maximum ? ` no greater than ${maximum}` : '';
    throw new BadRequestException(`${name} must be a positive integer${limit}`);
  }
  return parsed;
}
