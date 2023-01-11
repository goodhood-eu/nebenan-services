import { createPath, History, Update } from 'history';
import { scroll } from 'nebenan-helpers/lib/dom';
import eventproxy from 'nebenan-eventproxy';

export type UnsubscribeCallback = () => void;

const ATTEMPTS_RATE = 300;
const PROXIMITY = 100;
const MAX_ATTEMPTS = 10;

const createScrollManager = (history: History, node: Window) => {
  const positionDict: Record<string, number> = {};
  const nodeScroll = scroll(node);

  let locationKey: (keyof typeof positionDict) | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const stopAutoScroll = () => {
    if (timer) clearTimeout(timer);
    node.document.removeEventListener('touchmove', stopAutoScroll);
    node.document.removeEventListener('mousewheel', stopAutoScroll);
    node.document.removeEventListener('wheel', stopAutoScroll);
  };

  const ensurePosition = (targetPosition = 0) => {
    let attempts = 0;
    node.document.addEventListener('touchmove', stopAutoScroll, { passive: true });
    node.document.addEventListener('mousewheel', stopAutoScroll, { passive: true });
    node.document.addEventListener('wheel', stopAutoScroll, { passive: true });

    const scroller = () => {
      attempts += 1;
      const currentPosition = nodeScroll.get();

      // allow for small deviations
      if (Math.abs(currentPosition - targetPosition) < PROXIMITY) return stopAutoScroll();

      // prevent from scrolling endlessly
      if (attempts > MAX_ATTEMPTS) return stopAutoScroll();

      nodeScroll.to(targetPosition);
      timer = setTimeout(scroller, ATTEMPTS_RATE);
    };

    if (timer) clearTimeout(timer);
    scroller();
  };

  const save = (): void => {
    if (!locationKey) return;

    positionDict[locationKey] = nodeScroll.get();
  };

  const restore = ({ location }: Update): void => {
    // update key for the next transition
    locationKey = createPath(location);

    // try and restore scroll position for this route, or reset to top
    ensurePosition(positionDict[locationKey]);
  };

  const startProcessing = (): UnsubscribeCallback => {
    // Attempts to store current scroll position
    const unsubscribeScroll = eventproxy('scroll', save);
    const unsubscribeHook = history.listen(restore);
    restore(history);

    return () => {
      unsubscribeScroll();
      unsubscribeHook();
    };
  };

  return { startProcessing };
};
export default createScrollManager;
