import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    const elements = document.querySelectorAll('.reveal, .card, .roadmap-item');
    elements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);
}
