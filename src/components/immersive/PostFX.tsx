'use client';

import { useThree } from '@react-three/fiber';
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';

export function PostFX() {
  const { size } = useThree();
  const compact = size.width < 768;

  if (compact) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          mipmapBlur
          intensity={0.55}
          luminanceThreshold={0.48}
          luminanceSmoothing={0.28}
          levels={5}
        />
        <Vignette offset={0.18} darkness={0.82} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        intensity={0.72}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.28}
        levels={5}
      />
      <DepthOfField worldFocusDistance={8.8} worldFocusRange={6.5} bokehScale={1.35} height={480} />
      <Vignette offset={0.18} darkness={0.82} />
    </EffectComposer>
  );
}
