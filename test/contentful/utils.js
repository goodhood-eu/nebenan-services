const { assert } = require('chai');

const {
  configureContentful,
  formatImages,
  getContentfulRequest,
  formatImage, createContentfulRequest,
} = require('../../lib/contentful/utils');

const data = require('./scaffolding');

const SPACE = {
  id: 1,
  token: 'token',
  content_type_test: 'secret',
};
const LANGUAGE = 'klingon';


describe('modules/contentful/utils', () => {
  beforeEach(() => {
    configureContentful({
      space: SPACE,
      language: LANGUAGE,
      url: '/v2/contentfull_proxy.json',
    });
  });

  it('getContentfulRequest', () => {
    const testResult = getContentfulRequest('test');

    assert.isObject(testResult, 'returns correct data format');
    assert.isString(testResult.url, 'sets default url');

    const spaceUrl = getContentfulRequest('test').query.query_string;

    assert.isTrue(/^\/spaces\/1\/entries/.test(spaceUrl), 'generate space entries route');
    assert.include(spaceUrl, 'access_token=token', 'token is included');
    assert.include(spaceUrl, 'content_type=secret', 'content type is included');
    assert.include(spaceUrl, `localization=${LANGUAGE}`, 'locale is included');

    const spaceUrlWithQuery = getContentfulRequest('test', { a: 5, b: 'bulbul' }).query.query_string;

    assert.include(spaceUrlWithQuery, 'a=5', 'include query params');
    assert.include(spaceUrlWithQuery, 'b=bulbul', 'include query params');
  });

  describe('createContentfulRequest', () => {
    context('valid contentful response', () => {
      it('resolves returned promise', async() => {
        configureContentful({
          space: SPACE,
          language: LANGUAGE,
          url: '/v2/contentfull_proxy.json',
          createRequest: () => Promise.resolve(data.validResponse),
        });

        const payload = await createContentfulRequest('test');
        assert.deepEqual(payload, data.validResponse);
      });
    });

    context('network error', () => {
      it('rejects returned promise', async() => {
        configureContentful({
          space: SPACE,
          language: LANGUAGE,
          url: '/v2/contentfull_proxy.json',
          createRequest: () => Promise.reject({ statusCode: 500 }),
        });

        try {
          await createContentfulRequest('test');
        } catch (error) {
          assert.equal(error.statusCode, 500);
        }
      });
    });

    context('contentful response with validation errors', () => {
      it('rejects returned promise', async() => {
        configureContentful({
          space: SPACE,
          language: LANGUAGE,
          url: '/v2/contentfull_proxy.json',
          createRequest: () => Promise.resolve(data.responseWithErrors),
        });

        try {
          await createContentfulRequest('test');
        } catch (error) {
          assert.equal(error.message, 'Contentful request contains validation errors');
        }
      });
    });
  });

  it('formatImages', () => {
    const result = formatImages(data.images_list, data.assets);

    assert.isArray(result, 'correct data type');
    assert.equal(result.length, data.images_list.length, 'correct number of images');
    assert.isString(result[0].url, 'correct data format');
  });

  it('formatImage', () => {
    const image = data.images_list[0];

    assert.isNull(formatImage(image, {}), 'doesn\'t crash when contentful fucks up images');
    assert.include(formatImage(image, data.assets), 'https://', 'correct image url');
  });
});
