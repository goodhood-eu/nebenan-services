import isEmpty from 'lodash/isEmpty';

import { History, Location } from 'history';
import { ensureCalled, getDoNotTrack } from './utils';
import { generateClientId, generateEnvironment, generateSessionId, removeExpiredUtm, trackPageView } from './tracking';
import { GetPayloadFunction, StoreObject, TrackFunction } from './types';


let dataCollector: unknown[] = [];
let forceDisable = false;
let gtmLoaded = false;

const setDataCollector = (collector: unknown[]) => {
  dataCollector.forEach((item) => collector.push(item));
  dataCollector = collector;
};

const isDisabled = (): boolean => (
  !gtmLoaded || forceDisable || getDoNotTrack(global.window)
);

export const setGTMLoaded = (value: boolean) => { gtmLoaded = value; };
export const setEnabled = (isEnabled: boolean) => { forceDisable = !isEnabled; };

export const track: TrackFunction = (payload, done) => {
  if (isEmpty(payload)) throw new Error('Tracking payload required');
  if (isDisabled()) {
    done?.();
    return;
  }

  let payloadOverride;
  if (done) payloadOverride = { ...payload, eventCallback: ensureCalled(done) };
  dataCollector.push(payloadOverride || payload);
};

const DEFAULT_GET_PAGEVIEW_PAYLOAD: GetPayloadFunction = () => ({});

export const createAnalytics = (
  store: StoreObject,
  history: History,
  collector: unknown[],
  {
    getPageviewPayload = DEFAULT_GET_PAGEVIEW_PAYLOAD,
  } = {},
) => {
  const state = store.getState();
  let currentPage: Location | undefined;

  const handlePageview = ({ location: newPage }: { location: Location }): void => {
    if (currentPage) {
      trackPageView(track, store, currentPage, newPage, getPageviewPayload);
    }

    currentPage = newPage;
  };

  const startTracking = () => {
    const unsubscribeHistory = history.listen(handlePageview);
    handlePageview({ location: history.location });

    return (() => {
      unsubscribeHistory();
    });
  };

  removeExpiredUtm(store, state);
  generateClientId(track, store);
  generateSessionId(track, store);
  generateEnvironment(track);

  // Set real data collector
  setDataCollector(collector);

  return { startTracking };
};

export { configureAnalytics, getUTMKeysFromSession } from './tracking';
