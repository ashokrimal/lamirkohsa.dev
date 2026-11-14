'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, RoundedBox, Text } from '@react-three/drei';
import { MathUtils, Vector3, type Group } from 'three';
import type { ImmersiveProject } from './data';

interface NeonCardProps {
  project: ImmersiveProject;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  onOpen: (project: ImmersiveProject) => void;
}

export function NeonCard({ project, position, rotation, scale = 1, onOpen }: NeonCardProps) {
  const [hovered, setHovered] = useState(false);
  const floatRef = useRef<Group>(null);
  const hoverScale = useRef(new Vector3(1, 1, 1));

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  useFrame((state, delta) => {
    const node = floatRef.current;
    if (!node) return;

    node.position.y = Math.sin(state.clock.getElapsedTime() * 0.72) * 0.075;
    const nextScale = MathUtils.damp(node.scale.x, hovered ? 1.035 : 1, 9, delta);
    hoverScale.current.setScalar(nextScale);
    node.scale.copy(hoverScale.current);
  });

  const glow = hovered ? '#f4ffd6' : project.accent;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = '';
      }}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(project);
      }}
    >
      <group ref={floatRef}>
        <mesh position={[0, 0, -0.16]}>
          <planeGeometry args={[3.35, 4.4]} />
          <meshBasicMaterial color={project.accent} transparent opacity={hovered ? 0.12 : 0.035} toneMapped={false} />
        </mesh>

        <RoundedBox args={[3.1, 4.15, 0.22]} radius={0.11} smoothness={5}>
          <meshStandardMaterial
            color="#081218"
            metalness={0.76}
            roughness={0.2}
            emissive={project.accent}
            emissiveIntensity={hovered ? 0.2 : 0.045}
          />
          <Edges scale={1.006} threshold={18} color={glow} />
        </RoundedBox>

        <mesh position={[0, 2.03, 0.02]}>
          <boxGeometry args={[3.1, 0.012, 0.012]} />
          <meshBasicMaterial color={project.accent} toneMapped={false} />
        </mesh>

        <Text
          position={[-1.27, 1.63, 0.13]}
          font="/fonts/rajdhani-semibold.ttf"
          fontSize={0.25}
          color={project.accent}
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {project.index}
        </Text>

        <Text
          position={[-1.27, 1.2, 0.13]}
          font="/fonts/rajdhani-medium.ttf"
          fontSize={0.145}
          color="#9eb0aa"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.12}
        >
          {project.category.toUpperCase()}
        </Text>

        <Text
          position={[-1.27, 0.42, 0.13]}
          font="/fonts/rajdhani-semibold.ttf"
          fontSize={0.5}
          color="#f4f1eb"
          anchorX="left"
          anchorY="middle"
          maxWidth={2.45}
          lineHeight={0.9}
        >
          {project.title}
        </Text>

        <Text
          position={[-1.27, -0.5, 0.13]}
          font="/fonts/rajdhani-medium.ttf"
          fontSize={0.18}
          color="#a8b5b0"
          anchorX="left"
          anchorY="middle"
          maxWidth={2.35}
          lineHeight={1.15}
        >
          {project.subtitle}
        </Text>

        <mesh position={[-0.48, -1.14, 0.12]}>
          <boxGeometry args={[1.58, 0.008, 0.008]} />
          <meshBasicMaterial color={project.accent} transparent opacity={0.45} toneMapped={false} />
        </mesh>

        <Text
          position={[-1.27, -1.56, 0.13]}
          font="/fonts/rajdhani-semibold.ttf"
          fontSize={0.155}
          color={hovered ? '#f4ffd6' : project.accent}
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.12}
        >
          OPEN CASE →
        </Text>

        <mesh position={[1.25, -1.56, 0.13]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color={project.accent} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
