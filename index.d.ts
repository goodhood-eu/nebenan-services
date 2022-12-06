declare module 'nebenan-redux-tools/lib/network' {
  import { GetQueryRequestReturnValue } from './src/contentful/types';

  export const createRequest: (data: GetQueryRequestReturnValue) => Record<string, unknown>;
  export default { createRequest };
}
