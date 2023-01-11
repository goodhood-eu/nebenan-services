import type { Store } from 'redux';
import { Location } from 'history';
import { CLIENT_ID_KEY, SESSION_ID_KEY, UTM_KEY } from './actions';

export type TrackFunction = (payload: Record<string, unknown>, done?: () => void) => void;
export type State = {
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
export type StoreObject = Store<State>;
export type GetPayloadFunction = (data: {
  store: StoreObject,
  previousPage: Location,
  currentPage: Location,
}) => Record<string, unknown>;
