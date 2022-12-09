import { parse, ParsedQs } from 'qs';

export type DoNotTrackProps = Window & {
  doNotTrack?: boolean,
  navigator?: {
    msDoNotTrack?: boolean,
  }
};

const UTM_REGEX = /^utm_/;
const DNT_POSITIVES = ['yes', '1', 1];

export const getQuery = (search: string): ParsedQs => parse(search.substr(1));

export const getDoNotTrack = (node: DoNotTrackProps): boolean => {
  let value;
  if (typeof node.navigator.doNotTrack !== 'undefined') {
    value = node.navigator.doNotTrack;
  } else if (typeof node.navigator.msDoNotTrack !== 'undefined') {
    value = node.navigator.msDoNotTrack;
  } else {
    value = node.doNotTrack;
  }

  return DNT_POSITIVES.includes(value as string);
};

export const isExpired = (timestamp: number, limit: number): boolean => (
  Date.now() - timestamp > limit
);

export const getUtmKeys = (
  query: Record<string, unknown>,
): Record<string, unknown> => (
  Object.keys(query).reduce((result, key) => {
    if (UTM_REGEX.test(key)) result[key] = query[key];
    return result;
  }, {} as Record<string, unknown>)
);

export const ensureCalled = (
  func: (data?: unknown) => unknown, timeout = 500,
): (() => void) => {
  let isCalled = false;
  let timerId: NodeJS.Timeout | null = null;

  const proxy = (): undefined | void => {
    if (isCalled) return;
    clearTimeout(timerId as NodeJS.Timeout);
    func();
    isCalled = true;
  };

  timerId = setTimeout(proxy, timeout);
  return proxy;
};

export const getUrlFromPage = ({ pathname, search }: Location, window: Window) => (
  new URL(pathname + search, window.location.origin)
);
