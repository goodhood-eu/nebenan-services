const UTM_REGEX = /^utm_/;
const DNT_POSITIVES = ['yes', '1', 1];

export const getDoNotTrack = (node) => {
  let value;
  if (typeof node.navigator.doNotTrack !== 'undefined') {
    value = node.navigator.doNotTrack;
  } else if (typeof node.navigator.msDoNotTrack !== 'undefined') {
    value = node.navigator.msDoNotTrack;
  } else {
    value = node.doNotTrack;
  }

  return DNT_POSITIVES.includes(value);
};

export const isExpired = (timestamp, limit) => (Date.now() - timestamp > limit);

export const getUtmKeys = (query) => (
  Object.keys(query).reduce((result, key) => {
    if (UTM_REGEX.test(key)) result[key] = query[key];
    return result;
  }, {})
);

export const ensureCalled = (func, timeout = 500) => {
  let isCalled = false;
  let timerId = null;

  const proxy = () => {
    if (isCalled) return;
    clearTimeout(timerId);
    func();
    isCalled = true;
  };

  timerId = setTimeout(proxy, timeout);
  return proxy;
};
