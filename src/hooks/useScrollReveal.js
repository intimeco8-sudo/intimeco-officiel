import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-reveal]';
const VISIBLE_CLASS = 'is-revealed';

export default function useScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
    if (nodes.length === 0) return undefined;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add(VISIBLE_CLASS));
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
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
      }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  });
}
