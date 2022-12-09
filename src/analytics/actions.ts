import { actions as sessionActions } from 'nebenan-redux-tools/lib/session';

const { setSession } = sessionActions;

export const UTM_KEY = 'utm';
export const CLIENT_ID_KEY = 'analyticsClientId';
export const SESSION_ID_KEY = 'analyticsSessionId';

export const setUtm = (
  keys: Record<string, unknown>,
): unknown => setSession({ [UTM_KEY]: { keys, timestamp: Date.now() } });
export const deleteUtm = (): unknown => setSession({ [UTM_KEY]: undefined });

export const setClientId = (
  id: string,
): unknown => setSession({ [CLIENT_ID_KEY]: { id, timestamp: Date.now() } });
export const setSessionId = (
  id: string,
): unknown => setSession({ [SESSION_ID_KEY]: { id, timestamp: Date.now() } });
