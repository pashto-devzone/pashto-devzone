"use client";

import { useEffect } from "react";

/**
 * ScrollReveal Component
 * Observes when elements with the .scroll-reveal-animation class
 * enter the viewport and adds the .visible class to trigger animations.
 */
export default function ScrollReveal() {
  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: immediately show all elements
      document.querySelectorAll(".scroll-reveal-animation").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    // Create IntersectionObserver with threshold
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only trigger once when element enters viewport
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px", // Start animation slightly before fully visible
      }
    );

    // Observe all scroll reveal animation elements
    const observeElement = (element) => {
      if (!element.classList.contains("visible")) observer.observe(element);
    };
    document.querySelectorAll(".scroll-reveal-animation").forEach(observeElement);

    // Route transitions can add elements after the root layout has mounted.
    // Watching the document prevents those elements from remaining transparent.
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(".scroll-reveal-animation")) observeElement(node);
        node.querySelectorAll?.(".scroll-reveal-animation").forEach(observeElement);
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
