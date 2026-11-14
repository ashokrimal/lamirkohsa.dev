'use client';

import { useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2, Vector3, type PerspectiveCamera } from 'three';
import type { RigState } from './rig';

interface CameraRigProps {
  rig: MutableRefObject<RigState>;
}

/**
 * Layers a weighted pointer parallax over the GSAP scroll target.
 * GSAP owns the destination; this loop owns the feel.
 */
export function CameraRig({ rig }: CameraRigProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const pointer = useRef(new Vector2());
  const positionTarget = useRef(new Vector3());
  const lookTarget = useRef(new Vector3(0, 0.1, -0.5));

  useFrame((state, delta) => {
    const frameDelta = Math.min(delta, 0.05);
    const stateRig = rig.current;

    pointer.current.lerp(state.pointer, 1 - Math.exp(-4.2 * frameDelta));

    const time = state.clock.getElapsedTime();
    const driftX = Math.sin(time * 0.18) * 0.07;
    const driftY = Math.cos(time * 0.22) * 0.05;

    positionTarget.current.set(
      stateRig.px + pointer.current.x * 1.05 + driftX,
      stateRig.py + pointer.current.y * 0.55 + driftY,
      stateRig.pz,
    );

    lookTarget.current.set(
      stateRig.lx + pointer.current.x * 0.28,
      stateRig.ly + pointer.current.y * 0.16,
      stateRig.lz,
    );

    const ease = 1 - Math.exp(-2.6 * frameDelta);
    camera.position.lerp(positionTarget.current, ease);
    camera.lookAt(lookTarget.current);
    camera.rotation.z = pointer.current.x * 0.012;

    const nextFov = camera.fov + (stateRig.fov - camera.fov) * ease;
    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
