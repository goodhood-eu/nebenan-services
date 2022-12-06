import { stringify } from 'qs';
import { createRequest as _createRequest } from 'nebenan-redux-tools/lib/network';
import {
  ContentfulRequestQuery,
  GetQueryRequestReturnValue,
  ContentfulAssetObject,
  ContentfulEntity,
  ContentfulSpace,
} from './types';

export type TContentfulOptions = {
  space: ContentfulSpace;
  language: string;
  preview: boolean;
  url: string;
  createRequest: typeof _createRequest;
};

let space: ContentfulSpace | undefined;
let language: string | undefined;
let preview = false;
let proxyUrl: string | undefined;
let createRequest: typeof _createRequest;

export const configureContentful = (options: TContentfulOptions): void => {
  space = options.space;
  language = options.language;
  preview = options.preview;
  proxyUrl = options.url;
  createRequest = options.createRequest || _createRequest;
};

/**
 * @deprecated use #createContentfulRequest instead
 */
export const getContentfulRequest = (
  type: string,
  contentQuery: Record<string, unknown>,
): GetQueryRequestReturnValue => {
  if (!space) return;
  const { id, token, preview_token } = space;
  const access_token = preview ? preview_token : token;
  const content_type = (space as ContentfulSpace<typeof type>)[`content_type_${type}`];

  const proxyQuery = {
    ...contentQuery,
    access_token,
    content_type,
    'fields.localization': language,
  };

  const query_string = `/spaces/${id}/entries?${stringify(proxyQuery, { indices: false })}`;
  const query: ContentfulRequestQuery = { query_string };
  // BE is too lazy to check for value
  if (preview) query.preview = preview;

  return {
    query,
    url: proxyUrl,
    graceful: true,
  };
};

const hasValidationErrors = (payload?: Record<string, unknown>) => payload?.errors;

export const createContentfulRequest = async (
  type: string,
  contentQuery: Record<string, unknown>,
) => {
  const payload = await createRequest(getContentfulRequest(type, contentQuery));
  if (hasValidationErrors(payload)) throw new Error(`Contentful request '${type}' contains validation errors`);

  return payload;
};

export const formatImage = (
  image: ContentfulEntity,
  assets: Record<string, ContentfulAssetObject>,
): string | null => {
  const ref = assets[image.sys.id];
  // optional chaining saves page crash when contentful content in staging spaces is missing
  const url = ref?.fields?.file?.url;
  if (!url) return null;

  return `https:${url}`;
};

export const formatImages = (
  list: ContentfulEntity[],
  assets: Record<string, ContentfulAssetObject>,
): { id: string, url: string }[] => (
  list.reduce((collection, item) => {
    const { id } = item.sys;
    const url = formatImage(item, assets);
    if (url) collection.push({ id, url });
    return collection;
  }, [] as { id: string, url: string }[])
);
