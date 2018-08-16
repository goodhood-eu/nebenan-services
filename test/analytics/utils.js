const { assert } = require('chai');
const sinon = require('sinon');

const {
  getUtmKeys,
  isExpired,
  ensureCalled,
  uidSegment,
  getUID,
} = require('../../lib/analytics/utils');

const segmentRegex = /^[a-f0-9]+$/;

describe('analytics/utils', () => {
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

  it('uidSegment', () => {
    const segment1 = uidSegment();
    const segment2 = uidSegment();

    assert.isString(segment1, 'returns correct data format');
    assert.notEqual(segment1, segment2, 'returns different segments');
    assert.match(segment1, segmentRegex, 'correct pattern format');
  });

  it('getUID', () => {
    const uuid = getUID();
    const regStr = segmentRegex.toString().slice(2, -2);
    const uidRegexString = `^${regStr}${regStr}-${regStr}-${regStr}-${regStr}-${regStr}${regStr}${regStr}$`;

    assert.equal(uuid.split('-').length, 5, 'returns correct number of segments');
    assert.match(uuid, new RegExp(uidRegexString), 'correct pattern format');
  });
});
