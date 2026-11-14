'use client';

import { useLayoutEffect, type MutableRefObject, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CameraKeyframe, RigState } from './rig';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_FRAMES: CameraKeyframe[] = [
  { px: 0, py: 0.8, pz: 15, lx: 0, ly: 0.1, lz: -0.5, fov: 42 },
  { px: 2.0, py: 0.2, pz: 8.6, lx: 2.0, ly: -0.15, lz: 0, fov: 44 },
  { px: 3.2, py: 1.1, pz: 7.6, lx: 5.2, ly: -1.35, lz: 1.1, fov: 40 },
  { px: -1.8, py: 2.8, pz: 7.8, lx: 0, ly: 0.8, lz: -0.6, fov: 46 },
  { px: -3.1, py: 1.2, pz: 7.6, lx: -5.6, ly: 1.4, lz: -1, fov: 38 },
];

const MOBILE_FRAMES: CameraKeyframe[] = [
  { px: 0, py: 0.7, pz: 16.5, lx: 0, ly: 0.1, lz: -0.5, fov: 55 },
  { px: 0, py: 0.1, pz: 11.4, lx: 0, ly: -0.35, lz: 0, fov: 56 },
  { px: 4.8, py: 1.2, pz: 9.6, lx: 5.2, ly: -1.3, lz: 1.1, fov: 52 },
  { px: -1.3, py: 2.6, pz: 10, lx: 0, ly: 0.8, lz: -0.6, fov: 56 },
  { px: -2.5, py: 1.3, pz: 9.7, lx: -5.6, ly: 1.4, lz: -1, fov: 52 },
];

const SEGMENT_DURATIONS = [3, 1.6, 1.5, 1.3];
// These match the chapter heights: 100vh, 300vh, 160vh, 150vh, 130vh.
const CHAPTER_BOUNDARIES = [0.119, 0.476, 0.667, 0.845];

interface ScrollDirectorProps {
  rootRef: RefObject<HTMLDivElement>;
  rig: MutableRefObject<RigState>;
  progressBarRef: RefObject<HTMLSpanElement>;
  onChapter: (index: number) => void;
}

export function ScrollDirector({ rootRef, rig, progressBarRef, onChapter }: ScrollDirectorProps) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = gsap.matchMedia();
    let lastChapter = -1;

    const buildTimeline = (frames: CameraKeyframe[]) => {
      Object.assign(rig.current, frames[0]);
      lastChapter = 0;
      onChapter(0);

      const context = gsap.context(() => {
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              rig.current.progress = progress;

              if (progressBarRef.current) {
                progressBarRef.current.style.transform = `scaleY(${progress})`;
              }

              const chapter =
                progress < CHAPTER_BOUNDARIES[0]
                  ? 0
                  : progress < CHAPTER_BOUNDARIES[1]
                    ? 1
                    : progress < CHAPTER_BOUNDARIES[2]
                      ? 2
                      : progress < CHAPTER_BOUNDARIES[3]
                        ? 3
                        : 4;

              if (chapter !== lastChapter) {
                lastChapter = chapter;
                onChapter(chapter);
              }
            },
          },
        });

        // Hold the opening shot before the first camera move.
        timeline.to({}, { duration: 1 }, 0);

        let position = 1;
        frames.slice(1).forEach((frame, index) => {
          const duration = SEGMENT_DURATIONS[index] ?? 1.4;
          timeline.to(rig.current, { ...frame, duration }, position);
          position += duration;
        });
      }, root);

      return () => context.revert();
    };

    media.add('(min-width: 768px)', () => buildTimeline(DESKTOP_FRAMES));
    media.add('(max-width: 767px)', () => buildTimeline(MOBILE_FRAMES));

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 240);
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.clearTimeout(refresh);
      media.revert();
    };
  }, [rootRef, rig, progressBarRef, onChapter]);

  return null;
}
