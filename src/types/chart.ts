// src/types/chart.ts
export interface CryptoMapping {
  [key: string]: string;
}

export interface TimeMapping {
  [key: string]: string;
}

export interface CryptoDataPoint {
  timestamp: string;
  lifepath_number: string;
  current_price: number;
  high_24h: number;
  low_24h: number;
  ma_10: number;
  ma_50: number;
  rsi: number;
}

export interface ApiResponseItem {
  timestamp: string;
  lifepath_number: string;
  current_price: string;
  high_24h: string;
  low_24h: string;
  ma_10: string;
  ma_50: string;
  rsi: string;
}

export interface FetchCryptoDataParams {
  crypto: CryptoType;
  time: TimeType;
  pageLoad: boolean;
}

export interface TooltipData {
  isVisible: boolean;
  formattedDate: string;
  data: CryptoDataPoint | null;
}

export const CRYPTO_MAPPING = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  XMR: 'monero',
  PAXG: 'paxg',
} as const;

export const TIME_MAPPING = {
  '24h': '24h',
  '7d': '7d',
  '30d': '30d',
  'Max': 'max',
} as const;

export type CryptoType = typeof CRYPTO_MAPPING[keyof typeof CRYPTO_MAPPING]
export type TimeType = typeof TIME_MAPPING[keyof typeof TIME_MAPPING]
