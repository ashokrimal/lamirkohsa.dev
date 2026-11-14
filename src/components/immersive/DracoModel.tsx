'use client';

import { useGLTF } from '@react-three/drei';
import type { GroupProps } from '@react-three/fiber';

useGLTF.setDecoderPath('/draco/');

interface DracoModelProps extends GroupProps {
  url?: string;
}

/**
 * Drop a Draco-compressed GLB at /public/models/developer-desk.glb and render
 * <DracoModel /> in place of the procedural desk. The decoder is self-hosted.
 */
export function DracoModel({ url = '/models/developer-desk.glb', ...props }: DracoModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} {...props} />;
}
