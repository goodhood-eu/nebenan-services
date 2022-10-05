import { stringify } from 'qs';
import { createRequest } from 'nebenan-redux-tools/lib/network';

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

export const getContentfulRequestPromise = (type, contentQuery) => {
  const promise = new Promise((resolve, reject) => {
    const request = getContentfulRequest(type, contentQuery);
    console.log('getContentfulRequest created: ');
    console.log(request);

    return createRequest(request).then(
      (payload) => {
        console.log('createRequest resolves with payload: ');
        console.log(payload);

        if (payload.errors) {
          // Really rejecting would lead to Error Modal on FE....
          console.log('would reject due to error....');
        }

        return resolve(payload);
      });
  });

  return {
    requestPromise: promise,
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
