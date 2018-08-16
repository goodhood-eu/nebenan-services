import { scroll } from 'nebenan-helpers/lib/dom';

const ATTEMPTS_RATE = 300;
const PROXIMITY = 100;
const MAX_ATTEMPTS = 10;

const getLocationPath = (location) => {
  if (!location) return null;
  const { pathname, search, hash } = location;
  return [pathname, search, hash].join('');
};

export default (history, node) => {
  const stateHistory = {};
  const nodeScroll = scroll(node);

  let key = null;
  let tid = null;

  const stopAutoScroll = () => {
    if (tid) clearTimeout(tid);
    node.document.removeEventListener('touchmove', stopAutoScroll);
    node.document.removeEventListener('mousewheel', stopAutoScroll);
    node.document.removeEventListener('wheel', stopAutoScroll);
  };

  const ensurePosition = (targetPosition = 0) => {
    let iterations = 0;
    node.document.addEventListener('touchmove', stopAutoScroll);
    node.document.addEventListener('mousewheel', stopAutoScroll);
    node.document.addEventListener('wheel', stopAutoScroll);

    const scroller = () => {
      iterations += 1;
      const currentPosition = nodeScroll.get();

      // allow for small deviations
      if (Math.abs(currentPosition - targetPosition) < PROXIMITY) return stopAutoScroll();

      // prevent from scrolling endlessly
      if (iterations > MAX_ATTEMPTS) return stopAutoScroll();

      nodeScroll.to(targetPosition);
      tid = setTimeout(scroller, ATTEMPTS_RATE);
    };

    if (tid) clearTimeout(tid);
    scroller();
  };

  const save = () => {
    stateHistory[key] = nodeScroll.get();
  };

  const restore = (location) => {
    // update key for the next transition
    key = getLocationPath(location);

    // try and restore scroll position for this route, or reset to top
    ensurePosition(stateHistory[key]);
  };

  const startProcessing = () => {
    // need to use `listenBefore` because if modal is shown, it messes up the scroll position
    const unsubscribeBeforeHook = history.listenBefore(save);
    const unsubscribeHook = history.listen(restore);
    restore(history.getCurrentLocation());

    return () => {
      unsubscribeBeforeHook();
      unsubscribeHook();
    };
  };

  return { startProcessing, stateHistory };
};
