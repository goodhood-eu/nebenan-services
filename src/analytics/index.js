import isEmpty from 'lodash/isEmpty';

import { getDoNotTrack, ensureCalled } from './utils';
import {
  removeExpiredUtm,
  generateClientId,
  generateSessionId,
  generateEnvironment,
  trackPageView,
} from './tracking';


let dataCollector = [];
let forceDisable = false;
let gtmLoaded = false;

const setDataCollector = (collector) => {
  dataCollector.forEach((item) => collector.push(item));
  dataCollector = collector;
};

const isDisabled = () => (
  !gtmLoaded || forceDisable || getDoNotTrack(global)
);

export const setGTMLoaded = (value) => { gtmLoaded = value; };
export const setDisabled = (value) => { forceDisable = value; };

export const track = (payload, done) => {
  if (isEmpty(payload)) throw new Error('Tracking payload required');
  if (isDisabled()) {
    if (done) done();
    return;
  }

  let payloadOverride;
  if (done) payloadOverride = { ...payload, eventCallback: ensureCalled(done) };
  dataCollector.push(payloadOverride || payload);
};

const DEFAULT_GET_PAGEVIEW_PAYLOAD = () => {};

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
  store,
  history,
  collector,
  {
    getPageviewPayload = DEFAULT_GET_PAGEVIEW_PAYLOAD,
  } = {},
) => {
  const state = store.getState();
  let currentPage = null;

  const handlePageview = (newPage) => {
    trackPageView(track, store, currentPage, newPage, getPageviewPayload);
    currentPage = newPage;
  };

  const startTracking = () => {
    const unsubscribeHistory = history.listen(handlePageview);
    handlePageview(history.location);

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
