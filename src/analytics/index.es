import isEmpty from 'lodash/isEmpty';

import { getDoNotTrack, ensureCalled } from './utils';
import {
  removeExpiredUtm,
  generateClientId,
  generateSessionId,
  generateEnvironment,
  trackPageView,
} from './tracking';

import { ANALYTICS_DISABLED_KEY } from './actions';


let dataCollector = [];
let isBrowserTrackingDisabled = false;
let forceDisable = false;

const setDataCollector = (collector) => {
  dataCollector.forEach((item) => collector.push(item));
  dataCollector = collector;
};

const isDisabled = () => (
  forceDisable || isBrowserTrackingDisabled || getDoNotTrack(global)
);

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

export const createAnalytics = (store, history, collector) => {
  const state = store.getState();
  let currentPage = null;

  const handleChange = () => {
    const { session } = store.getState();
    isBrowserTrackingDisabled = Boolean(session[ANALYTICS_DISABLED_KEY]);
  };

  const handlePageview = (newPage) => {
    trackPageView(track, store, currentPage, newPage);
    currentPage = newPage;
  };

  const startTracking = () => {
    handleChange();

    const unsubscribeStore = store.subscribe(handleChange);
    const unsubscribeHistory = history.listen(handlePageview);
    handlePageview(history.getCurrentLocation());

    return (() => {
      unsubscribeStore();
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
