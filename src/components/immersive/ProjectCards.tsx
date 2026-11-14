'use client';

import { useThree } from '@react-three/fiber';
import { IMMERSIVE_PROJECTS, type ImmersiveProject } from './data';
import { NeonCard } from './NeonCard';

interface ProjectCardsProps {
  onOpen: (project: ImmersiveProject) => void;
}

export function ProjectCards({ onOpen }: ProjectCardsProps) {
  const { size } = useThree();
  const compact = size.width < 700;

  const layout = compact
    ? [
        { position: [-2.05, 0.2, 0] as [number, number, number], rotation: [0.02, 0.08, 0] as [number, number, number] },
        { position: [2.0, -1.15, -0.6] as [number, number, number], rotation: [0.02, -0.12, 0] as [number, number, number] },
      ]
    : [
        { position: [1.9, -0.12, 0] as [number, number, number], rotation: [0.02, 0.16, -0.015] as [number, number, number] },
        { position: [5.8, -0.82, -1.35] as [number, number, number], rotation: [0.015, -0.2, 0.02] as [number, number, number] },
      ];

  return (
    <group>
      {IMMERSIVE_PROJECTS.map((project, index) => (
        <NeonCard
          key={project.id}
          project={project}
          position={layout[index].position}
          rotation={layout[index].rotation}
          scale={compact ? 0.61 : 1}
          onOpen={onOpen}
        />
      ))}
    </group>
  );
}
