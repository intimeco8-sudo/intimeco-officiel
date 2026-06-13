import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-reveal]';
const VISIBLE_CLASS = 'is-revealed';

export default function useScrollReveal() {
  useEffect(() => {
    let rafId = null;

    const isOnScreen = (node) => {
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const revealBuffer = Math.max(160, viewportHeight * 0.2);

      return rect.bottom >= 0
        && rect.right >= 0
        && rect.top <= viewportHeight + revealBuffer
        && rect.left <= viewportWidth;
    };

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((node) => {
        node.classList.add(VISIBLE_CLASS);
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px 20% 0px',
        threshold: 0.01,
      }
    );

    const refreshObservedNodes = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((node) => {
        if (node.classList.contains(VISIBLE_CLASS)) return;

        if (isOnScreen(node)) {
          node.classList.add(VISIBLE_CLASS);
          return;
        }

        observer.observe(node);
      });
    };

    const scheduleRefresh = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        refreshObservedNodes();
      });
    };

    const mutationObserver = new MutationObserver(scheduleRefresh);

    refreshObservedNodes();
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('resize', scheduleRefresh);
    window.addEventListener('orientationchange', scheduleRefresh);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', scheduleRefresh);
      window.removeEventListener('orientationchange', scheduleRefresh);
    };
  }, []);
}
