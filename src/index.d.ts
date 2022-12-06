import { GetQueryRequestReturnValue } from './contentful/types';

declare module 'nebenan-redux-tools/lib/network' {
  export const createRequest: (data: GetQueryRequestReturnValue) => void;

  export default { createRequest };
}
