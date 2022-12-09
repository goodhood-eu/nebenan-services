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
import {
  ConfigureAnalyticsOptions, GetPayloadFunction,
  SessionObject,
  StoreObject,
  TrackFunction,
} from './types';


let environment: string;
let sessionLifetime: number;
let utmLifetime: number;

export const configureAnalytics = (options: ConfigureAnalyticsOptions): void => {
  environment = options.environment;
  sessionLifetime = options.sessionLifetime;
  utmLifetime = options.utmLifetime;
};

export const generateEnvironment = (
  track: TrackFunction,
): void => track({ environment });

export const removeExpiredUtm = (
  store: StoreObject,
  { session }: SessionObject,
): void => {
  const currentUTM = session[UTM_KEY];
  if (currentUTM && isExpired(currentUTM.timestamp, utmLifetime)) {
    store.dispatch(deleteUtm());
  }
};

export const trackUtm = (track: TrackFunction, { session }: SessionObject): void => {
  const currentUTM = session[UTM_KEY];
  if (currentUTM) track(currentUTM.keys);
};

export const generateClientId = (
  track: TrackFunction,
  store: StoreObject,
  { session }: SessionObject,
): void => {
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

export const generateSessionId = (
  track: TrackFunction,
  store: StoreObject,
  { session }: SessionObject,
): void => {
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

export const touchSessionId = (store: StoreObject, { session }: SessionObject): void => {
  const { id } = session[SESSION_ID_KEY];
  store.dispatch(setSessionId(id));
};

const NULL_REFERRER_URL = { origin: '', pathname: '', search: '' };

export const trackPageView = (
  track: TrackFunction,
  store: StoreObject,
  previousPage: Location,
  currentPage: Location,
  getPayload: GetPayloadFunction | (() => void),
): void => {
  const query = getQuery(currentPage.search);

  const utm = getUtmKeys(query);
  if (!isEmpty(utm)) store.dispatch(setUtm(utm));

  const state = store.getState();
  // always read what's in the session, otherwise conversions are lost
  trackUtm(track, state);
  // Don't let sessions expire whilst still browsing
  touchSessionId(store, state);

  const url = getUrlFromPage(currentPage, (global as unknown as Window));

  let referrer = NULL_REFERRER_URL;
  if (previousPage) {
    referrer = getUrlFromPage(previousPage, (global as unknown as Window));
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
