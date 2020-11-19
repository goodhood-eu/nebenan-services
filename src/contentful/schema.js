import { schema } from 'normalizr';


export const getSchemaOptions = (overrides) => ({
  idAttribute: (entity) => (entity.sys.id),
  ...overrides,
});

export const assetSchema = new schema.Entity('assets', {}, getSchemaOptions());

export const getSchema = (overrides) => ({ includes: { Asset: [assetSchema] }, ...overrides });
