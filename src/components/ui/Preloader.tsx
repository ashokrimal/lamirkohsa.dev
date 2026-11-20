"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface PreloaderProps {
  /** Optional: pass true once initial CMS / page data is ready */
  isReady?: boolean;
  /** Optional callback triggered right as the curtain finishes lifting */
  onComplete?: () => void;
  /** Brand wordmark displayed in the center */
  brandName?: string;
  /** Secondary studio/tagline displayed below the wordmark */
  studioLabel?: string;
}

export default function Preloader({
  isReady = true,
  onComplete,
  brandName = "lamirkohsa",
  studioLabel = "ashokrimal.com.np",
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Interactive cat & letter play state
  const [catOffsetPct, setCatOffsetPct] = useState(72); // Horizontal position along wordmark (0-90%)
  const [catFacing, setCatFacing] = useState<"left" | "right">("left");
  const [activeLetterIdx, setActiveLetterIdx] = useState<number | null>(null);
  const [swatting, setSwatting] = useState(false);
  const [purring, setPurring] = useState(false);
  const [meowBubble, setMeowBubble] = useState<string | null>(null);

  const wordmarkRef = useRef<HTMLDivElement>(null);
  const swatTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const meowTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Set once the curtain is leaving, so a click, Escape and the timer cannot run
  // the exit twice or restart the progress loop.
  const dismissedRef = useRef(false);

  // Store latest callback without restarting the animation effect
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finishExit = useCallback(() => {
    setHidden(true);
    onCompleteRef.current?.();
  }, []);

  /**
   * Leaves the screen immediately (or with the curtain) and remembers the visit
   * for the rest of the session. Safe to call from the timer, a click or Escape.
   */
  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    try {
      sessionStorage.setItem("ar_preloader_seen", "1");
    } catch {
      // Ignore storage errors
    }
    setExiting(true);
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    exitTimeoutRef.current = setTimeout(finishExit, 680);
  }, [finishExit]);

  // Returning visitors in the same session never see the curtain at all, and
  // visitors who ask for reduced motion skip it outright rather than sitting
  // through a shorter animation. Declared before the progress effect so both
  // cases short-circuit that run.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ar_preloader_seen") === "1";
    } catch {
      // Ignore storage errors
    }

    if (seen || prefersReducedMotion()) {
      dismissedRef.current = true;
      finishExit();
    }
  }, [finishExit]);

  // Escape skips the preloader at any point.
  useEffect(() => {
    if (hidden) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss, hidden]);

  // Lock body scroll while the preloader covers the viewport
  useEffect(() => {
    if (hidden) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [hidden]);

  // Cleanup interactive and exit timers on unmount
  useEffect(() => {
    return () => {
      if (swatTimeoutRef.current) clearTimeout(swatTimeoutRef.current);
      if (meowTimeoutRef.current) clearTimeout(meowTimeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (hidden || dismissedRef.current) return;

    // Give enough breathing room on first visit so users can play with the cat
    const targetDuration = 2400;
    const startTime = performance.now();

    let frameId = 0;
    let holdTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let isCancelled = false;

    const tick = (now: number) => {
      if (isCancelled || dismissedRef.current) return;

      const elapsed = now - startTime;
      const rawRatio = Math.min(elapsed / targetDuration, 1);
      // Smooth cubic ease-out curve
      const eased = 1 - Math.pow(1 - rawRatio, 3);

      // Hold at 92% if external CMS / 3D assets are still loading
      const maxCap = isReady ? 100 : 92;
      const nextValue = Math.min(Math.round(eased * 100), maxCap);

      setProgress(nextValue);

      if (nextValue < 100) {
        frameId = requestAnimationFrame(tick);
      } else {
        holdTimeoutId = setTimeout(() => {
          if (isCancelled) return;
          dismiss();
        }, 320);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(frameId);
      if (holdTimeoutId) clearTimeout(holdTimeoutId);
    };
  }, [dismiss, isReady, hidden]);

  const letters = brandName.split("");

  // Trigger a playful paw swat on a specific letter index
  const playWithLetter = useCallback(
    (index: number, showReaction = false) => {
      const targetPct = Math.min(
        Math.max((index / Math.max(letters.length - 1, 1)) * 84, 2),
        84
      );
      setCatFacing(targetPct >= catOffsetPct ? "right" : "left");
      setCatOffsetPct(targetPct);
      setActiveLetterIdx(index);
      setSwatting(true);

      if (showReaction) {
        const phrases = ["prrr~", "bap!", "meow!", "✦"];
        setMeowBubble(phrases[index % phrases.length]);
        if (meowTimeoutRef.current) clearTimeout(meowTimeoutRef.current);
        meowTimeoutRef.current = setTimeout(() => setMeowBubble(null), 700);
      }

      if (swatTimeoutRef.current) clearTimeout(swatTimeoutRef.current);
      swatTimeoutRef.current = setTimeout(() => {
        setSwatting(false);
        setActiveLetterIdx(null);
      }, 360);
    },
    [catOffsetPct, letters.length]
  );

  // Subtle eye/position tracking as cursor moves across the wordmark
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wordmarkRef.current) return;
    const rect = wordmarkRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const clampedPct = Math.min(Math.max(relX * 84, 2), 84);
    setCatFacing(clampedPct >= catOffsetPct ? "right" : "left");
    setCatOffsetPct(clampedPct);
  };

  // Petting the cat directly makes it purr and swat a random letter
  const handlePetCat = (event?: React.MouseEvent) => {
    // Playing with the cat must not dismiss the curtain.
    event?.stopPropagation();
    setPurring(true);
    setMeowBubble("purrr ♥");
    const randomIdx = Math.floor(Math.random() * letters.length);
    playWithLetter(randomIdx, false);

    if (meowTimeoutRef.current) clearTimeout(meowTimeoutRef.current);
    meowTimeoutRef.current = setTimeout(() => {
      setPurring(false);
      setMeowBubble(null);
    }, 850);
  };

  if (hidden) return null;

  const isAwake = progress >= 45 || swatting || purring;

  return (
    <div
      id="site-preloader"
      role="progressbar"
      aria-label={`Loading ${brandName}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      onClick={dismiss}
      className={`fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center bg-[#0C0C0E] text-white transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
        exiting ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      {/* Keyframes for tail sway, purr vibration, paw swat, and floating Zzzs */}
      <style>{`
        @keyframes catTailSway {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes catPurrWiggle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-1.5deg); }
          75% { transform: translateY(-2px) rotate(1.5deg); }
        }
        @keyframes pawSwat {
          0% { transform: translateY(0) rotate(0deg); }
          45% { transform: translateY(15px) rotate(-22deg) scale(1.12); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes zzzFloat {
          0% { opacity: 0; transform: translate(0, 4px) scale(0.75); }
          40% { opacity: 0.85; }
          100% { opacity: 0; transform: translate(6px, -12px) scale(1.05); }
        }
      `}</style>

      {/* Subtle architectural grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Soft ambient studio glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute flex items-center justify-center"
      >
        <div
          className="h-64 w-64 rounded-full bg-[#F43F5E]/15 blur-3xl transition-transform duration-500 ease-out sm:h-96 sm:w-96"
          style={{
            transform: `scale(${0.6 + (progress / 100) * 0.4})`,
          }}
        />
      </div>

      {/* Main Centered Interactive NeoLeaf-style Composition */}
      <div className="relative z-10 w-full max-w-4xl select-none px-6">
        <div
          ref={wordmarkRef}
          onPointerMove={handlePointerMove}
          className="relative mx-auto w-fit"
        >
          {/* Interactive Playful Cat perched along the top of "lamirkohsa" */}
          <div
            onClick={(event) => handlePetCat(event)}
            title="Pet me or hover the letters!"
            style={{
              left: `${catOffsetPct}%`,
              transform: `scaleX(${catFacing === "right" ? -1 : 1})`,
            }}
            className="relative z-20 -mb-3 h-14 w-28 cursor-pointer transition-[left] duration-300 ease-out sm:-mb-4 sm:h-16 sm:w-32"
          >
            {/* Un-flip speech bubble so text reads cleanly */}
            {meowBubble && (
              <div
                style={{
                  transform: `scaleX(${catFacing === "right" ? -1 : 1})`,
                }}
                className="pointer-events-none absolute -top-5 left-2 rounded-full border border-amber-400/30 bg-zinc-900/95 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300 shadow-md"
              >
                {meowBubble}
              </div>
            )}

            {/* Floating Zzzs when resting early */}
            {!isAwake && !meowBubble && (
              <div
                style={{
                  transform: `scaleX(${catFacing === "right" ? -1 : 1})`,
                }}
                className="pointer-events-none absolute left-2 top-1 font-mono text-[10px] font-bold text-amber-300/80"
              >
                <span
                  className="inline-block"
                  style={{ animation: "zzzFloat 2.2s ease-in-out infinite" }}
                >
                  z
                </span>
                <span
                  className="ml-1 inline-block text-xs"
                  style={{
                    animation: "zzzFloat 2.2s ease-in-out 0.7s infinite",
                  }}
                >
                  Z
                </span>
              </div>
            )}

            <svg
              viewBox="0 0 180 95"
              className="h-full w-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                animation: purring
                  ? "catPurrWiggle 0.25s ease-in-out infinite"
                  : undefined,
              }}
            >
              {/* Hanging swaying tail */}
              <g
                style={{
                  transformOrigin: "136px 56px",
                  animation: "catTailSway 1.9s ease-in-out infinite",
                }}
              >
                <path
                  d="M136 56 C141 68, 141 84, 130 88 C125 89.5, 122 86, 125 83 C131 80, 132 68, 130 56 Z"
                  fill="#EA8C15"
                />
              </g>

              {/* Curled/crouched playful body */}
              <path
                d="M52 58 C54 31, 82 22, 106 24 C128 26, 140 40, 140 58 Z"
                fill="#F59E0B"
              />
              {/* Tabby stripes */}
              <path
                d="M82 25 C84 32, 85 38, 84 44"
                stroke="#B45309"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M97 24 C99 31, 100 38, 99 45"
                stroke="#B45309"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M112 26 C113 33, 113 39, 111 45"
                stroke="#B45309"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Playful Front Paw that swats down onto the letters */}
              <g
                style={{
                  transformOrigin: "44px 56px",
                  animation: swatting
                    ? "pawSwat 0.34s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : undefined,
                }}
              >
                <rect
                  x="33"
                  y="52"
                  width="14"
                  height="16"
                  rx="7"
                  fill="#F59E0B"
                />
                {/* Cream paw tip */}
                <path
                  d="M33 62 C33 66, 47 66, 47 62 L47 64 C47 68, 33 68, 33 64 Z"
                  fill="#FEF3C7"
                />
              </g>

              {/* Cat Head */}
              <g
                className="transition-transform duration-200"
                style={{
                  transform: swatting
                    ? "translate(-3px, 3px) rotate(-6deg)"
                    : isAwake
                    ? "translateY(-2px)"
                    : "translateY(0px)",
                }}
              >
                {/* Left & Right Ears */}
                <path d="M27 42 L25 25 L40 34 Z" fill="#F59E0B" />
                <path d="M28.5 39 L27.5 29 L36.5 34.5 Z" fill="#FBCFE8" />
                <path d="M62 42 L65 25 L50 34 Z" fill="#F59E0B" />
                <path d="M60.5 39 L62.5 29 L53.5 34.5 Z" fill="#FBCFE8" />

                {/* Head base */}
                <ellipse cx="45" cy="47" rx="21" ry="14" fill="#F59E0B" />
                {/* Cream muzzle */}
                <ellipse cx="45" cy="53" rx="11" ry="6.5" fill="#FEF3C7" />

                {/* Eyes: happy squint when purring, wide playful pupils when swatting/awake */}
                {purring ? (
                  <>
                    <path
                      d="M31 47 Q36 41 41 47"
                      stroke="#18181B"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M49 47 Q54 41 59 47"
                      stroke="#18181B"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </>
                ) : isAwake ? (
                  <>
                    <circle cx="36" cy="46" r="3" fill="#18181B" />
                    <circle cx="35" cy="45" r="1.1" fill="#FFFFFF" />
                    <circle cx="54" cy="46" r="3" fill="#18181B" />
                    <circle cx="53" cy="45" r="1.1" fill="#FFFFFF" />
                  </>
                ) : (
                  <>
                    <path
                      d="M31 46 Q36 51 41 46"
                      stroke="#27272A"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M49 46 Q54 51 59 46"
                      stroke="#27272A"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Pink nose & smile */}
                <polygon points="43,50 47,50 45,52.5" fill="#F472B6" />
                <path
                  d="M41.5 53.5 Q43.5 55.5 45 53.5 Q46.5 55.5 48.5 53.5"
                  stroke="#27272A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Whiskers */}
                <line
                  x1="15"
                  y1="48"
                  x2="27"
                  y2="49"
                  stroke="#A1A1AA"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
                <line
                  x1="16"
                  y1="52"
                  x2="27"
                  y2="51.5"
                  stroke="#A1A1AA"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
                <line
                  x1="63"
                  y1="49"
                  x2="75"
                  y2="48"
                  stroke="#A1A1AA"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
                <line
                  x1="63"
                  y1="51.5"
                  x2="74"
                  y2="52"
                  stroke="#A1A1AA"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* Interactive Per-Letter NeoLeaf-style Wordmark */}
          <div className="relative">
            {/* Base dim slate interactive letters */}
            <h1
              aria-label={brandName}
              className="flex font-sans text-5xl font-black leading-none tracking-[-0.055em] text-[#27272A] sm:text-7xl md:text-8xl lg:text-9xl"
            >
              {letters.map((char, idx) => {
                const isBatted = activeLetterIdx === idx;
                return (
                  <span
                    key={`base-${idx}`}
                    onMouseEnter={() => playWithLetter(idx, false)}
                    onClick={(event) => {
                      event.stopPropagation();
                      playWithLetter(idx, true);
                    }}
                    style={{
                      transform: isBatted
                        ? `translateY(10px) rotate(${idx % 2 === 0 ? -7 : 7}deg) scale(0.94)`
                        : "translateY(0px) rotate(0deg) scale(1)",
                    }}
                    className="inline-block cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:text-zinc-600"
                  >
                    {char}
                  </span>
                );
              })}
            </h1>

            {/* Clipped illuminated white fill layer synced to the exact same letter bounces */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                clipPath: `inset(-20% ${100 - progress}% -20% 0)`,
              }}
            >
              <div className="flex font-sans text-5xl font-black leading-none tracking-[-0.055em] text-white sm:text-7xl md:text-8xl lg:text-9xl">
                {letters.map((char, idx) => {
                  const isBatted = activeLetterIdx === idx;
                  return (
                    <span
                      key={`fill-${idx}`}
                      style={{
                        transform: isBatted
                          ? `translateY(10px) rotate(${idx % 2 === 0 ? -7 : 7}deg) scale(0.94)`
                          : "translateY(0px) rotate(0deg) scale(1)",
                      }}
                      className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* NeoLeaf signature bottom-right tucked readout */}
          <div className="mt-2 flex items-center justify-between gap-4 font-mono text-[11px] tracking-wider text-zinc-500 sm:text-xs">
            <span className="lowercase">{studioLabel}</span>
            <span className="hidden text-zinc-500 sm:inline">click or esc to skip</span>
            <span className="tabular-nums text-zinc-200">
              loading... {progress} %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
