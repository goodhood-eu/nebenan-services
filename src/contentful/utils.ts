import _createRequest from 'nebenan-redux-tools/lib/network/request';
import { stringify } from 'qs';
import { isNetworkError } from 'nebenan-redux-tools/lib/network/utils';
import {
  ContentfulAssetObject,
  ContentfulEntity,
  ContentfulRequestQuery,
  ContentfulResponseObject,
  ContentfulSpace,
  FormattedImage,
} from './types';

type ContentfulOptions = {
  space: ContentfulSpace;
  language: string;
  preview: boolean;
  url: string;
  createRequest?: typeof _createRequest<ContentfulResponseObject> | undefined;
};

let space: ContentfulSpace | undefined;
let language: string | undefined;
let preview = false;
let proxyUrl: string | undefined;
let createRequest: typeof _createRequest<ContentfulResponseObject> | undefined;

export const configureContentful = (options: ContentfulOptions): void => {
  space = options.space;
  language = options.language;
  preview = options.preview;
  proxyUrl = options.url;
  createRequest = options.createRequest || _createRequest;
};

type RequestOptions = Parameters<
NonNullable<typeof createRequest>
>[0];


/**
 * @deprecated use #createContentfulRequest instead
 */
export const getContentfulRequest = (
  type: string,
  contentQuery?: Record<string, unknown>,
): RequestOptions => {
  if (!space || !proxyUrl) throw new Error('not initialized');

  const { id, token, preview_token } = space;
  const access_token = preview ? preview_token : token;
  const content_type = space[`content_type_${type}`];

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
  } satisfies RequestOptions;
};

const hasValidationErrors = (
  payload?: ContentfulResponseObject,
) => Boolean(payload?.errors);

export const createContentfulRequest = async (
  type: string,
  contentQuery?: Record<string, unknown>,
) => {
  if (!createRequest) throw new Error('not initialized');

  const contentfulRequest = getContentfulRequest(type, contentQuery);
  const payload = await createRequest(contentfulRequest);

  if (!isNetworkError(payload) && hasValidationErrors(payload)) throw new Error(`Contentful request '${type}' contains validation errors`);

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
) => (
  list.reduce((collection, item) => {
    const { id } = item.sys;
    const url = formatImage(item, assets);
    if (url) collection.push({ id, url });
    return collection;
  }, [] as FormattedImage[])
);
