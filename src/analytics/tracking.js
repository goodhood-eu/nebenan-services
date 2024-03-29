import isEmpty from 'lodash/isEmpty';
import { getUID } from 'nebenan-helpers/lib/calculations';

import { isExpired, getQuery, getUtmKeys, getUrlFromPage } from './utils';

import {
  UTM_KEY,
  CLIENT_ID_KEY,
  SESSION_ID_KEY,
  setUtm,
  deleteUtm,
  setClientId,
  setSessionId,
} from './actions';

let environment;
let sessionLifetime;
let utmLifetime;

export const configureAnalytics = (options) => {
  environment = options.environment;
  sessionLifetime = options.sessionLifetime;
  utmLifetime = options.utmLifetime;
};

export const generateEnvironment = (track) => track({ environment });

export const removeExpiredUtm = (store, { session }) => {
  const currentUTM = session[UTM_KEY];
  if (currentUTM && isExpired(currentUTM.timestamp, utmLifetime)) {
    store.dispatch(deleteUtm());
  }
};

export const trackUtm = (track, { session }) => {
  const currentUTM = session[UTM_KEY];
  if (currentUTM) track(currentUTM.keys);
};

export const generateClientId = (track, store, { session }) => {
  const clientInfo = session[CLIENT_ID_KEY];

  let clientId;
  if (!clientInfo) {
    clientId = getUID();
    store.dispatch(setClientId(clientId));
  } else {
    clientId = clientInfo.id;
  }

  track({ client_id: clientId });
};

export const generateSessionId = (track, store, { session }) => {
  const sessionInfo = session[SESSION_ID_KEY];

  let sessionId;
  if (!sessionInfo || isExpired(sessionInfo.timestamp, sessionLifetime)) {
    sessionId = getUID();
    store.dispatch(setSessionId(sessionId));
  } else {
    sessionId = sessionInfo.id;
  }

  track({ session_id: sessionId });
};

export const touchSessionId = (store, { session }) => {
  const { id } = session[SESSION_ID_KEY];
  store.dispatch(setSessionId(id));
};

const NULL_REFERRER_URL = { origin: '', pathname: '', search: '' };

export const trackPageView = (track, store, previousPage, currentPage, getPayload) => {
  const query = getQuery(currentPage.search);

  const utm = getUtmKeys(query);
  if (!isEmpty(utm)) store.dispatch(setUtm(utm));

  const state = store.getState();
  // always read what's in the session, otherwise conversions are lost
  trackUtm(track, state);
  // Don't let sessions expire whilst still browsing
  touchSessionId(store, state);

  const url = getUrlFromPage(currentPage, global);

  let referrer = NULL_REFERRER_URL;
  if (previousPage) {
    referrer = getUrlFromPage(previousPage, global);
  } else if (document?.referrer) {
    referrer = new URL(document.referrer);
  }

  const payload = {
    ...getPayload({ store, previousPage, currentPage }),
    event: 'virtual_page_view',
    virtual_page_url: url.origin + url.pathname,
    virtual_page_query: url.search.substr(1),
    referrer_url: referrer.origin + referrer.pathname,
    referrer_query: referrer.search.substr(1),
  };

  track(payload);
};
