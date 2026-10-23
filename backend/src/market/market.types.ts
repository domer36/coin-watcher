export interface MarketAsset {
  name: string;
  symbol: string;
  price: number | null;
  priceChangePercentage24h: number | null;
  marketCap: number | null;
}

export interface MarketQuery {
  currency: string;
  page: number;
  perPage: number;
}

export interface MarketPage {
  data: MarketAsset[];
  page: number;
  perPage: number;
  hasMore: boolean;
}
