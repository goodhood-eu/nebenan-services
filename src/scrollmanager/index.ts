import { createPath, History, Listener, Location } from 'history';
import { scroll } from 'nebenan-helpers/lib/dom';
import eventproxy from 'nebenan-eventproxy';


export type TID = NodeJS.Timeout | null;
export type Key = string | null;

const ATTEMPTS_RATE = 300;
const PROXIMITY = 100;
const MAX_ATTEMPTS = 10;

export default (history: History, node: Window) => {
  const stateHistory: Record<string, (number | string | undefined)> = {};
  const nodeScroll = scroll(node);

  let key: Key = null;
  let tid: TID = null;

  const stopAutoScroll = (): void => {
    if (tid) clearTimeout(tid);
    node.document.removeEventListener('touchmove', stopAutoScroll, { passive: true } as EventListenerOptions);
    node.document.removeEventListener('mousewheel', stopAutoScroll, { passive: true } as EventListenerOptions);
    node.document.removeEventListener('wheel', stopAutoScroll, { passive: true } as EventListenerOptions);
  };

  const ensurePosition = (targetPosition = 0): void => {
    let iterations = 0;
    node.document.addEventListener('touchmove', stopAutoScroll, { passive: true });
    node.document.addEventListener('mousewheel', stopAutoScroll, { passive: true });
    node.document.addEventListener('wheel', stopAutoScroll, { passive: true });

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

  const save = (): void => {
    stateHistory[(key as string)] = nodeScroll.get();
  };

  const restore = (location: Location): void => {
    // update key for the next transition
    key = createPath(location);

    // try and restore scroll position for this route, or reset to top
    ensurePosition(stateHistory[key] as number | undefined);
  };

  const startProcessing = () => {
    // Attempts to store current scroll position
    const unsubscribeScroll = eventproxy('scroll', save);
    const unsubscribeHook = history.listen(restore as unknown as Listener);
    restore(history.location);

    return () => {
      unsubscribeScroll();
      unsubscribeHook();
    };
  };

  return { startProcessing, stateHistory };
};
