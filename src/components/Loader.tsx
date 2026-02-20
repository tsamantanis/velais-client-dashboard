import { useEffect, useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap.js";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo.js";

interface LoaderProps {
  dataReady: boolean;
  onComplete: () => void;
}

const MESSAGES = [
  "Initializing systems...",
  "Authenticating...",
  "Fetching sprint data...",
  "Loading dashboard...",
];

const MESSAGE_INTERVAL = 800;

export function Loader({ dataReady, onComplete }: LoaderProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const shimmerRectRef = useRef<SVGRectElement>(null);
  const fillStop1Ref = useRef<SVGStopElement>(null);
  const fillStop2Ref = useRef<SVGStopElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ value: 0 });
  const autoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hasCompletedRef = useRef(false);

  const shimmerGradId = `${id}-shimmer-grad`;
  const fillGradId = `${id}-fill-grad`;
  const fillMaskId = `${id}-fill-mask`;
  const shimmerMaskId = `${id}-shimmer-mask`;

  // Cycle status messages
  useEffect(() => {
    const status = statusRef.current;
    if (!status) return;
    let idx = 0;
    status.textContent = MESSAGES[0]!;
    const tick = setInterval(() => {
      idx = (idx + 1) % MESSAGES.length;
      status.textContent = MESSAGES[idx]!;
    }, MESSAGE_INTERVAL);
    return () => clearInterval(tick);
  }, []);

  // Simulated progress: auto-advance to 70%
  useEffect(() => {
    const stop1 = fillStop1Ref.current;
    const stop2 = fillStop2Ref.current;
    if (!stop1 || !stop2) return;

    // Kill any prior tween on this target (StrictMode double-mount)
    gsap.killTweensOf(progressRef.current);
    progressRef.current.value = 0;

    autoTweenRef.current = gsap.to(progressRef.current, {
      value: 0.7,
      duration: 2,
      ease: "power2.out",
      onUpdate() {
        const p = progressRef.current.value;
        gsap.set(stop1, { attr: { offset: p } });
        gsap.set(stop2, { attr: { offset: Math.min(p + 0.02, 1) } });
      },
    });

    return () => {
      autoTweenRef.current?.kill();
      autoTweenRef.current = null;
    };
  }, []);

  // When data is ready, complete the fill and fade out
  useEffect(() => {
    if (!dataReady || hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    // Kill ALL tweens on the progress target (covers StrictMode leaked tweens)
    gsap.killTweensOf(progressRef.current);

    const stop1 = fillStop1Ref.current;
    const stop2 = fillStop2Ref.current;
    if (!stop1 || !stop2) return;

    gsap.to(progressRef.current, {
      value: 1,
      duration: 0.6,
      ease: "power2.out",
      onUpdate() {
        const p = progressRef.current.value;
        gsap.set(stop1, { attr: { offset: p } });
        gsap.set(stop2, { attr: { offset: Math.min(p + 0.02, 1) } });
      },
      onComplete() {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.4,
          delay: 0.3,
          ease: "power2.inOut",
          onComplete,
        });
      },
    });
  }, [dataReady, onComplete]);

  // Shimmer loop animation
  useGSAP(
    () => {
      const rect = shimmerRectRef.current;
      if (!rect) return;

      gsap.fromTo(
        rect,
        { attr: { x: -2000, y: -300 } },
        {
          attr: { x: 0, y: -2000 },
          duration: 1.6,
          ease: "power1.inOut",
          repeat: -1,
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      className="loader fixed inset-0 flex items-center justify-center bg-bg-deep z-[1000]"
      ref={containerRef}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 100%, color-mix(in srgb, var(--color-energetic-blue) 40%, transparent) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <svg
          viewBox={LOGO_VIEWBOX}
          className="w-[280px] max-sm:w-[200px] h-auto"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Velais logo"
        >
          <defs>
            {/* Diagonal fill gradient — BL to TR, sharp cutoff driven by progress */}
            <linearGradient
              id={fillGradId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="719.5"
              x2="1024"
              y2="0"
            >
              <stop ref={fillStop1Ref} offset="0" stopColor="white" />
              <stop ref={fillStop2Ref} offset="0.02" stopColor="black" />
            </linearGradient>

            {/* Shimmer gradient — diagonal band */}
            <linearGradient
              id={shimmerGradId}
              gradientTransform="rotate(-45 0.5 0.5)"
            >
              <stop offset="0" stopColor="black" />
              <stop offset="0.4" stopColor="black" />
              <stop offset="0.5" stopColor="var(--color-cloudy-blue)" />
              <stop offset="0.6" stopColor="black" />
              <stop offset="1" stopColor="black" />
            </linearGradient>

            {/* Fill mask — progress-driven diagonal reveal */}
            <mask id={fillMaskId}>
              <rect
                x="0"
                y="0"
                width="1024"
                height="719.5"
                fill={`url(#${fillGradId})`}
              />
            </mask>

            {/* Shimmer mask — sweeping diagonal band */}
            <mask id={shimmerMaskId}>
              <rect
                ref={shimmerRectRef}
                x={-2000}
                y={-300}
                width={3000}
                height={3000}
                fill={`url(#${shimmerGradId})`}
              />
            </mask>
          </defs>

          {/* Ghost layer — faint full outline always visible */}
          <path d={LOGO_PATH} fill="var(--color-soft-sky)" opacity={0.1} />

          {/* Fill layer — revealed progressively by progress */}
          <path
            d={LOGO_PATH}
            fill="var(--color-soft-sky)"
            mask={`url(#${fillMaskId})`}
          />

          {/* Shimmer layer — looping diagonal band */}
          <path
            d={LOGO_PATH}
            fill="var(--color-soft-sky)"
            mask={`url(#${shimmerMaskId})`}
          />
        </svg>
        <div
          className="text-md text-text-secondary tracking-[0.05em] min-h-[1.2em] mt-6"
          ref={statusRef}
        >
          {MESSAGES[0]}
        </div>
      </div>
    </div>
  );
}
