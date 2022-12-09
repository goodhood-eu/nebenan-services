import isEmpty from 'lodash/isEmpty';

import { History, Listener } from 'history';
import { getDoNotTrack, ensureCalled } from './utils';
import {
  removeExpiredUtm,
  generateClientId,
  generateSessionId,
  generateEnvironment,
  trackPageView,
} from './tracking';
import { StoreObject, TrackFunction } from './types';


let dataCollector: unknown[] = [];
let forceDisable = false;
let gtmLoaded = false;

const setDataCollector = (collector: unknown[]) => {
  dataCollector.forEach((item) => collector.push(item));
  dataCollector = collector;
};

const isDisabled = (): boolean => (
  !gtmLoaded || forceDisable || getDoNotTrack(global as unknown as Window)
);

export const setGTMLoaded = (value: boolean): void => { gtmLoaded = value; };
export const setDisabled = (value: boolean): void => { forceDisable = value; };

export const track: TrackFunction = (payload, done) => {
  if (isEmpty(payload)) throw new Error('Tracking payload required');
  if (isDisabled()) {
    if (done) done();
    return;
  }

  let payloadOverride;
  if (done) payloadOverride = { ...payload, eventCallback: ensureCalled(done) };
  dataCollector.push(payloadOverride || payload);
};

const DEFAULT_GET_PAGEVIEW_PAYLOAD = (): void => {};

/**
 * Callback for providing additional data to the page-view event.
 *
 * @callback getPageviewPayloadCallback
 * @param {Object} options
 * @param options.store store
 * @param options.previousPage previous page
 * @param options.currentPage current page
 */

/**
 *
 * @param store
 * @param history
 * @param collector
 * @param {getPageviewPayloadCallback} getPageviewPayload
 * @returns {{startTracking: (function(): function(): void)}}
 */
export const createAnalytics = (
  store: StoreObject,
  history: History,
  collector: unknown[],
  {
    getPageviewPayload = DEFAULT_GET_PAGEVIEW_PAYLOAD,
  } = {},
) => {
  const state = store.getState();
  let currentPage: Location | null = null;

  const handlePageview = (newPage: Location): void => {
    trackPageView(track, store, (currentPage as Location), newPage, getPageviewPayload);
    currentPage = newPage;
  };

  const startTracking = () => {
    const unsubscribeHistory = history.listen(handlePageview as unknown as Listener);
    handlePageview(history.location as unknown as Location);

    return (() => {
      unsubscribeHistory();
    });
  };

  removeExpiredUtm(store, state);
  generateClientId(track, store, state);
  generateSessionId(track, store, state);
  generateEnvironment(track);

  // Set real data collector
  setDataCollector(collector);

  return { startTracking };
};
