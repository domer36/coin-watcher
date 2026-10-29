export interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  price: number | null;
  priceChangePercentage24h: number | null;
  marketCap: number | null;
  high24h: number | null;
  low24h: number | null;
  totalVolume24h: number | null;
}

export interface MarketPricePoint {
  timestamp: number;
  price: number;
}

export interface MarketDetail extends MarketAsset {
  priceHistory: MarketPricePoint[] | null;
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
