import { Location } from 'history';
import isEmpty from 'lodash/isEmpty';
import { getUID } from 'nebenan-helpers/lib/calculations';

import { getQuery, getUrlFromPage, getUtmKeys, isExpired } from './utils';

import { CLIENT_ID_KEY, deleteUtm, SESSION_ID_KEY, setClientId, setSessionId, setUtm, UTM_KEY } from './actions';
import { GetPayloadFunction, State, StoreObject, TrackFunction } from './types';


let environment: string;
let sessionLifetime: number;
let utmLifetime: number;

export const configureAnalytics = (options: {
  environment: string;
  sessionLifetime: number;
  utmLifetime: number;
}) => {
  environment = options.environment;
  sessionLifetime = options.sessionLifetime;
  utmLifetime = options.utmLifetime;
};

export const generateEnvironment = (
  track: TrackFunction,
) => track({ environment });

export const removeExpiredUtm = (
  store: StoreObject,
  { session }: State,
) => {
  const currentUTM = session[UTM_KEY];
  if (currentUTM && isExpired(currentUTM.timestamp, utmLifetime)) {
    store.dispatch(deleteUtm());
  }
};

const trackUtm = (track: TrackFunction, { session }: State): void => {
  const currentUTM = session[UTM_KEY];
  if (currentUTM) track(currentUTM.keys);
};

export const generateClientId = (
  track: TrackFunction,
  store: StoreObject,
) => {
  const { session } = store.getState();
  const clientInfo = session[CLIENT_ID_KEY];

  let clientId;
  if (clientInfo) {
    clientId = clientInfo.id;
  } else {
    clientId = getUID();
    store.dispatch(setClientId(clientId));
  }

  track({ client_id: clientId });
};

export const generateSessionId = (
  track: TrackFunction,
  store: StoreObject,
): void => {
  const { session } = store.getState();
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

export const touchSessionId = (store: StoreObject) => {
  const { session } = store.getState();
  const { id } = session[SESSION_ID_KEY];
  store.dispatch(setSessionId(id));
};

const NULL_REFERRER_URL = { origin: '', pathname: '', search: '' };

export const trackPageView = (
  track: TrackFunction,
  store: StoreObject,
  previousPage: Location,
  currentPage: Location,
  getPayload: GetPayloadFunction,
): void => {
  const query = getQuery(currentPage.search);

  const utm = getUtmKeys(query);
  if (!isEmpty(utm)) store.dispatch(setUtm(utm));

  // always read what's in the session, otherwise conversions are lost
  trackUtm(track, store.getState());
  // Don't let sessions expire whilst still browsing
  touchSessionId(store);

  const url = getUrlFromPage(currentPage, global.window);

  let referrer = NULL_REFERRER_URL;
  if (previousPage) {
    referrer = getUrlFromPage(previousPage, global.window);
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
