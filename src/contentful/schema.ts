import { schema } from 'normalizr';
import { TContentfulEntity } from './types';

export const getSchemaOptions = (overrides?: Record<string, unknown>) => ({
  idAttribute: (entity: TContentfulEntity) => (entity.sys.id),
  ...overrides,
});

export const assetSchema = new schema.Entity('assets', {}, getSchemaOptions());

export const getSchema = (overrides: Record<string, unknown>) => ({
  includes: { Asset: [assetSchema] }, ...overrides,
});
