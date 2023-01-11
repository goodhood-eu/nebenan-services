import { parse, ParsedQs } from 'qs';
import { Location } from 'history';

type MsNavigator = Navigator & {
  msDoNotTrack: Navigator['doNotTrack'],
};

const isMsNavigator = (navigator: Navigator): navigator is MsNavigator => (
  typeof (navigator as MsNavigator).msDoNotTrack !== 'undefined'
);


const UTM_REGEX = /^utm_/;
const TRUTHY_DO_NOT_TRACK_VALUES = ['yes', '1', 1];

export const getQuery = (search: string): ParsedQs => parse(search.substr(1));

export const getDoNotTrack = (node: Window): boolean => {
  let value;
  if (typeof node.navigator.doNotTrack !== 'undefined') {
    value = node.navigator.doNotTrack;
  } else if (isMsNavigator(node.navigator)) {
    value = node.navigator.msDoNotTrack;
  }

  return TRUTHY_DO_NOT_TRACK_VALUES.includes(value as string);
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
  func: (data?: unknown) => void, timeout = 500,
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
