declare module 'nebenan-redux-tools/lib/network' {
  import { GetQueryRequestReturnValue } from './src/contentful/types';

  export const createRequest: (data: GetQueryRequestReturnValue) => Record<string, unknown>;
  export default { createRequest };
}

declare module 'nebenan-helpers/lib/dom' {
  export const scroll: (node: Window) => {
    get: () => Window['pageYOffset'] | Window['scrollTop'] | 0;
    to: (pos: number) => void;
    lock: () => EventTarget['addEventListener'];
    unlock: () => EventTarget['removeEventListener'];
  };
}

declare module 'nebenan-eventproxy' {
  const eventproxy: (
    eventType: string,
    callback: (args: unknown) => unknown) => () => void;
  export default eventproxy;
}

declare module 'nebenan-redux-tools/lib/session' {
  export const actions: {
    setSession: (data: Record<string, unknown>) => void;
  };
}

declare module 'nebenan-helpers/lib/calculations' {
  export const getUID: () => string;
}
