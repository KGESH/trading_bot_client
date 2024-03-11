import { createEnumParam, useQueryParam, withDefault } from 'use-query-params';
import { Exchange } from '@/types/exchangeTypes.ts';

const ExchangeParam = withDefault(createEnumParam<Exchange>(['binance', 'upbit', 'bithumb']), 'upbit' as const, false);

/**
 * @description - Get or set the exchange query param
 * @example - http://localhost:1420/?exchange=upbit
 */
export const useExchangeStore = () => {
  const [exchange, setExchange] = useQueryParam('exchange', ExchangeParam);
  if (!exchange) {
    throw new Error('Exchange is not set');
  }
  return { exchange, setExchange };
};
