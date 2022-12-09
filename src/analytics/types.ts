import { CLIENT_ID_KEY, SESSION_ID_KEY, UTM_KEY } from './actions';

export type ConfigureAnalyticsOptions = {
  environment: string;
  sessionLifetime: number;
  utmLifetime: number;
};
export type TrackFunction = (payload: Record<string, unknown>, done?:() => unknown) => void;
export type SessionObject = {
  session: {
    [UTM_KEY]: {
      timestamp: number;
      keys: Record<string, unknown>;
    },
    [CLIENT_ID_KEY]: {
      id: string;
    },
    [SESSION_ID_KEY]: {
      id: string;
      timestamp: number;
    }
  }
};
export type StoreObject = Record<string, unknown> & {
  dispatch: (callback: unknown) => void;
  getState: () => SessionObject
};
export type GetPayloadFunction = (data: {
  store: StoreObject,
  previousPage: Location,
  currentPage: Location,
}) => Record<string, unknown>;
