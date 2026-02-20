import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap.js";

export function useCascadeAnimation(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!enabled || !containerRef.current) return;

      const q = (attr: string) =>
        containerRef.current!.querySelectorAll(`[data-gsap="${attr}"]`);

      const tl = gsap.timeline();

      tl.from(q("header"), {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.out",
      });

      tl.from(
        q("title"),
        { y: 20, opacity: 0, duration: 0.9, ease: "expo.out" },
        "-=0.5",
      );

      tl.from(
        q("subtitle"),
        { y: 20, opacity: 0, duration: 0.9, ease: "expo.out" },
        "-=0.6",
      );

      tl.from(
        q("stat-cell"),
        { y: 15, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 },
        "-=0.6",
      );

      tl.from(
        q("section-label"),
        { opacity: 0, duration: 0.5, ease: "power2.out" },
        "-=0.4",
      );

      tl.from(
        q("card"),
        { y: 25, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 },
        "-=0.3",
      );
    },
    { scope: containerRef, dependencies: [enabled] },
  );

  return containerRef;
}
