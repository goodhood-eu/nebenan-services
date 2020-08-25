import { actions as sessionActions } from 'nebenan-redux-tools/lib/session';

const { setSession } = sessionActions;

export const UTM_KEY = 'utm';
export const CLIENT_ID_KEY = 'analyticsClientId';
export const SESSION_ID_KEY = 'analyticsSessionId';

export const setUtm = (keys) => setSession({ [UTM_KEY]: { keys, timestamp: Date.now() } });
export const deleteUtm = () => setSession({ [UTM_KEY]: undefined });

export const setClientId = (id) => setSession({ [CLIENT_ID_KEY]: { id, timestamp: Date.now() } });
export const setSessionId = (id) => setSession({ [SESSION_ID_KEY]: { id, timestamp: Date.now() } });
