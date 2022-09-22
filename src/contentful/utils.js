import { stringify } from 'qs';

let space;
let language;
let preview = false;
let proxyUrl;

export const configureContentful = (options) => {
  space = options.space;
  language = options.language;
  preview = options.preview;
  proxyUrl = options.url;
};

export const getContentfulRequest = (type, contentQuery) => {
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
  const query = { query_string };
  // BE is too lazy to check for value
  if (preview) query.preview = preview;

  return {
    query,
    url: proxyUrl,
    graceful: true,
  };
};

export const formatImage = (image, assets) => {
  const ref = assets[image.sys.id];
  // optional chaining saves page crash when contentful content in staging spaces is missing
  const url = ref?.fields?.file?.url;
  if (!url) return null;

  return `https:${url}`;
};

export const formatImages = (list, assets) => (
  list.reduce((collection, item) => {
    const { id } = item.sys;
    const url = formatImage(item, assets);
    if (url) collection.push({ id, url });
    return collection;
  }, [])
);
