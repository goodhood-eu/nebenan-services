import { stringify } from 'querystring';

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

export const getContentfulRequest = (type, query) => {
  const { id, token, preview_token } = space;
  const access_token = preview ? preview_token : token;
  const content_type = space[`content_type_${type}`];

  const newQuery = {
    ...query,
    access_token,
    content_type,
    'fields.localization': language,
  };

  const url = `/spaces/${id}/entries?${stringify(newQuery)}`;

  return {
    url: proxyUrl,
    query: {
      preview,
      query_string: url,
    },
  };
};

export const formatImage = (image, assets) => {
  const ref = assets[image.sys.id];
  if (!ref) return null;
  return `https:${ref.fields.file.url}`;
};

export const formatImages = (list, assets) => (
  list.reduce((collection, item) => {
    const { id } = item.sys;
    const url = formatImage(item, assets);
    if (url) collection.push({ id, url });
    return collection;
  }, [])
);
