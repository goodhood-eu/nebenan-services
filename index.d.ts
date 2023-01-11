declare module 'nebenan-redux-tools/lib/network/request' {
  // eslint-disable-next-line import/no-unresolved
  import { Method } from 'axios';

  type SuccessResponse<T> = T & Record<string, unknown>;

  export type NetworkError = {
    statusCode: number,
  };

  type RequestResponse<T> = NetworkError | SuccessResponse<T>;

  type RequestType =
    | 'query'
    | Method;

  type RequestQuery = Record<string, unknown>;
  type AbortCallback = (callback: () => void) => void;

  type HasLast = { last: unknown };
  type HasFirst = { first: unknown };

  type PaginationOptions = {
    per_page?: number,
  } & (
    | HasFirst
    | HasLast
    | (HasFirst & HasLast)
  );

  type RequestOptions<P> = {
    url: string,
    locale?: string,
    type?: RequestType,
    query?: RequestQuery,
    payload?: P,
    signal?: AbortSignal,
    getAbortCallback?: AbortCallback,
    pagination?: PaginationOptions,
    graceful?: boolean,
    token?: string,
    multipart?: boolean,
  };


  const request: <T extends Record<string, unknown>, P>(
    options: RequestOptions<P>
  ) => Promise<RequestResponse<T>>;

  export default request;
}


declare module 'nebenan-helpers/lib/dom' {
  interface Scroller {
    get(): number,
    to(position: number): void,
    lock(): void,
    unlock(): void,
  }

  export const scroll: (node: Window) => Scroller;
}

declare module 'nebenan-eventproxy' {
  const eventproxy: (
    eventType: string,
    callback: (args: unknown) => unknown) => () => void;
  export default eventproxy;
}

declare module 'nebenan-redux-tools/lib/session' {
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { Action, Reducer } from 'redux';

  export const reducer: Reducer;
  export const actions: {
    setSession: (payload: Record<string, unknown>) => Action;
  };
}

declare module 'nebenan-helpers/lib/calculations' {
  export const getUID: () => string;
}
