import { z } from 'zod';
import { Body, fetch } from '@tauri-apps/api/http';
import { getnerateRandomTransactionLog } from '@/helper/typia/generated/mock.ts';
import { TradingSearchParamsSchema } from '@/schemas/searchParamsSchema.ts';
import { BinanceStateStore, ExchangeStateStore } from '@/store/strategyStore.ts';
import { Upbit } from '@/types/exchangeTypes.ts';
import {
  DESKTOP_BACKEND_BASE_URL,
  LoginSchema,
  SignupSchema,
  TradingDataResponseSchema,
  UserExistSchema,
} from '@/schemas/backendSchema.ts';
import {
  FetchPositionsRequest,
  PositionsResponse,
  ResponseDto,
  SellAllCoinsRequest,
  SellCoin,
  SellCoinsRequest,
  StartFeatureRequest,
  StopFeatureRequest,
  TestFeatureRequest,
  UpbitPositionsResponse,
  User,
} from '@/types/backendTypes.ts';

/**
 * @description 로컬 백엔드 health check.
 * 데스크탑 앱과 함께 패키징된 백엔드 서버가 정상적으로 동작하는지 확인.
 * 백엔드 서버가 정상적으로 동작하면 true를 반환.
 */
export async function healthCheck(): Promise<boolean> {
  const endpoint = new URL('/health/ping', DESKTOP_BACKEND_BASE_URL);
  try {
    const response = await fetch<'pong'>(endpoint.href, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`[HEALTH CHECK]`, response);

    return response.data === 'pong';
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * @description 로컬 백엔드에 사용자가 존재하는지 확인.
 * 사용자가 존재하면 로그인페이지로 이동.
 * 존재하지 않으면 회원가입 페이지로 이동.
 */
export async function checkUserExist(): Promise<z.infer<typeof UserExistSchema>> {
  const endpoint = new URL('/user/exist', DESKTOP_BACKEND_BASE_URL);
  try {
    const response = await fetch<ResponseDto<z.infer<typeof UserExistSchema>>>(endpoint.href, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const responseDto = response.data;

    if (responseDto.success) {
      return responseDto.data;
    } else {
      throw new Error(responseDto.message);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * @description 로컬 백엔드 회원가입.
 */
export async function signup(args: z.infer<typeof SignupSchema>): Promise<User> {
  const endpoint = new URL('/auth/signup', DESKTOP_BACKEND_BASE_URL);

  try {
    const response = await fetch<ResponseDto<User>>(endpoint.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: Body.json(args),
    });

    const responseDto = response.data;

    if (responseDto.success) {
      return responseDto.data;
    } else {
      throw new Error(responseDto.message);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * @description 로컬 백엔드 로그인.
 */
export async function login(args: z.infer<typeof LoginSchema>) {
  const endpoint = new URL('/auth/login', DESKTOP_BACKEND_BASE_URL);

  try {
    const response = await fetch<ResponseDto<User>>(endpoint.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: Body.json(args),
    });

    const responseDto = response.data;

    if (responseDto.success) {
      return responseDto.data;
    } else {
      throw new Error(responseDto.message);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * @description 로컬 백엔드에 사용자 거래 내역 요청.
 */
export async function getTransactionLog(exchange: z.infer<typeof TradingSearchParamsSchema>['exchange']) {
  // Todo: fetch data from server
  console.log(exchange);
  return getnerateRandomTransactionLog();
}

export async function startAiSearch({ exchange, store }: Pick<ExchangeStateStore, 'exchange' | 'store'>) {
  console.log(`[startAiSearch] exchange, enterStrategy`, exchange, store.enterStrategy);
  return true;
}

/**
 * @description Fetch trading data from Upbit
 * @param exchange - 'upbit'
 * @param symbols - e.g. ['KRW-BTC', 'KRW-ETH', 'KRW-DOGE']
 */
export async function fetchUpbitTradingData(
  exchange: Upbit,
  symbols: UpbitPositionsResponse['currency'][],
): Promise<z.infer<typeof TradingDataResponseSchema>[]> {
  // Todo: 상장폐지 심볼 처리
  const endpoint = new URL(`/trading/${exchange}`, DESKTOP_BACKEND_BASE_URL);
  const queryParams = JSON.stringify(symbols);
  endpoint.searchParams.set('symbols', queryParams);

  const response = await fetch<ResponseDto<z.infer<typeof TradingDataResponseSchema>[]>>(endpoint.href, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const backendResponse = response.data;

  console.log(`[UPBIT TRADING DATA FROM BACKEND]`, backendResponse);

  if (backendResponse.success) {
    return backendResponse.data;
  } else {
    // Todo: handle error
    // throw new Error(backendResponse.message);
    return [];
  }
}

/**
 * @description 로컬 백엔드에 사용자 포지션 요청. 거래소 api 요청은 백엔드에서 진행.
 */
export async function fetchPositions(args: FetchPositionsRequest): Promise<PositionsResponse[]> {
  const endpoint = new URL(`/exchange`, DESKTOP_BACKEND_BASE_URL);
  const response = await fetch<ResponseDto<PositionsResponse[]>>(endpoint.href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: Body.json(args),
  });

  const dto: ResponseDto<PositionsResponse[]> = response.data;
  console.log(`[${args.exchange} POSITION DTO]`, dto);

  if (!dto.success) {
    return [];
  }

  const positions = dto.data;
  return positions;
}

/**
 * @description 백엔드에 사용자가 설정한 전략 시작 요청. 백엔드는 거래소 api를 통해 사용자의 전략을 실행.
 */
export async function startCustomStrategy(exchangeStore: Pick<ExchangeStateStore, 'exchange' | 'store'>) {
  const endpoint = new URL(`/feature/start`, DESKTOP_BACKEND_BASE_URL);
  const dto: StartFeatureRequest = {
    exchange_name: exchangeStore.exchange,
    custom_strategy: exchangeStore.store.customStrategy,
    enter_strategy: exchangeStore.store.enterStrategy,
    enter_symbol_amount: exchangeStore.store.enterSymbolAmount,
    enter_symbol_count: exchangeStore.store.enterSymbolCount,
    leverage:
      exchangeStore.exchange === 'binance' ? (exchangeStore.store as BinanceStateStore['store']).leverage : undefined,
  };

  console.log(`[START CUSTOM STARKEY DTO]`, dto);

  try {
    const response = await fetch<ResponseDto<unknown>>(endpoint.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Body.json(dto),
    });

    const responseDto = response.data;
    console.log('[START CUSTOM REPOSITORY]', responseDto);

    return responseDto;
  } catch (e) {
    console.error(`[START CUSTOM STRATEGY ERROR]`, e);
    console.error(e);
    throw e;
  }
}

/**
 * @description 백엔드에 사용자가 설정한 전략을 중지 요청. 백엔드는 거래소 api를 통해 사용자의 전략을 중지.
 */
export async function stopCustomStrategy(exchangeStore: Pick<ExchangeStateStore, 'exchange' | 'store'>) {
  const endpoint = new URL(`/feature/stop`, DESKTOP_BACKEND_BASE_URL);
  const dto: StopFeatureRequest = {
    exchange_name: exchangeStore.exchange,
    custom_strategy: exchangeStore.store.customStrategy,
    enter_strategy: exchangeStore.store.enterStrategy,
  };

  console.log(`[STOP CUSTOM STARKEY DTO]`, dto);

  try {
    const response = await fetch<ResponseDto<unknown>>(endpoint.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Body.json(dto),
    });

    const responseDto = response.data;
    console.log('[STOP CUSTOM REPOSITORY]', responseDto);

    return responseDto;
  } catch (e) {
    console.error(`[STOP CUSTOM STRATEGY ERROR]`, e);
    console.error(e);
    throw e;
  }
}

/**
 * @description 'Test' feature. 'Test' 버튼이 눌렸을때 백엔드에 요청.
 */
export async function testFeature({
  exchange,
  leverage,
}: Pick<ExchangeStateStore, 'exchange'> & Partial<Pick<BinanceStateStore['store'], 'leverage'>>) {
  const endpoint = new URL(`/feature/test`, DESKTOP_BACKEND_BASE_URL);
  const dto: TestFeatureRequest = {
    exchange_name: exchange,
    leverage,
  };

  try {
    const response = await fetch<ResponseDto<unknown>>(endpoint.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: Body.json(dto),
    });

    const responseDto = response.data;

    if (responseDto.success) {
      return responseDto.data;
    } else {
      throw new Error(responseDto.message);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * @description 'Sell' feature. 'Sell' 버튼이 눌렸을때 백엔드에 요청.
 */
export async function sellCoins({ exchange, coins }: Pick<ExchangeStateStore, 'exchange'> & { coins: SellCoin[] }) {
  const endpoint = new URL(`/feature/sell`, DESKTOP_BACKEND_BASE_URL);
  const dto: SellCoinsRequest = {
    exchange_name: exchange,
    coins,
  };

  try {
    const response = await fetch<ResponseDto<unknown>>(endpoint.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: Body.json(dto),
    });

    const responseDto = response.data;

    if (responseDto.success) {
      return responseDto;
    } else {
      throw new Error(responseDto.message);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * @description 'Sell all' feature. 'Sell all' 버튼이 눌렸을때 백엔드에 요청.
 */
export async function sellAllCoins({ exchange }: Pick<ExchangeStateStore, 'exchange'>) {
  const endpoint = new URL(`/feature/sell/all`, DESKTOP_BACKEND_BASE_URL);
  const dto: SellAllCoinsRequest = {
    exchange_name: exchange,
  };

  try {
    const response = await fetch<ResponseDto<unknown>>(endpoint.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: Body.json(dto),
    });

    const responseDto = response.data;

    if (responseDto.success) {
      return responseDto;
    } else {
      throw new Error(responseDto.message);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
