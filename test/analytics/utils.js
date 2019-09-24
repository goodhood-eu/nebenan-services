const { assert } = require('chai');
const sinon = require('sinon');

const {
  getQuery,
  getUtmKeys,
  isExpired,
  ensureCalled,
} = require('../../lib/analytics/utils');

describe('analytics/utils', () => {
  it('getQuery', () => {
    assert.deepEqual(getQuery(''), {}, 'empty');
    assert.deepEqual(getQuery('?'), {}, 'empty 2');
    assert.deepEqual(getQuery('?test=test'), { test: 'test' }, '1 param');
    assert.deepEqual(getQuery('?test=test&number=2'), { test: 'test', number: '2' }, '2 params');
  });

  it('getUtmKeys', () => {
    const query = {
      utm_hello: 'world',
      utm_gods: 'among us',
      george: 'carlin',
      spider: 'man',
    };

    const utmParams = {
      utm_hello: 'world',
      utm_gods: 'among us',
    };

    assert.deepEqual(getUtmKeys(query), utmParams, 'pull only utm keys');
  });

  it('isExpired', () => {
    const fresh = Date.now();
    const limit = 1000;

    let expired = new Date();
    expired.setHours(expired.getHours() - 1);
    expired -= limit;

    assert.isTrue(isExpired(expired, limit), 'expire when lifetime is over');
    assert.isFalse(isExpired(fresh, limit), 'just created');
  });

  it('ensureCalled', (done) => {
    const spy = sinon.spy();
    const timeoutSpy = sinon.spy();

    const ensuredFunc = ensureCalled(spy, 5);
    assert(spy.notCalled, 'not called yet');

    ensuredFunc();
    assert(spy.calledOnce, 'called once');

    ensuredFunc();
    ensuredFunc();
    ensuredFunc();
    assert(spy.calledOnce, 'still only called once');

    const delayedTest = () => {
      assert(timeoutSpy.calledOnce, 'timeout called once');
      done();
    };

    ensureCalled(timeoutSpy, 5);
    assert(timeoutSpy.notCalled, 'timeout not called yet');
    setTimeout(delayedTest, 20);
  });
});
