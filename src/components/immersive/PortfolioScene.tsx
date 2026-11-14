'use client';

import { Suspense, useRef, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';
import { Float, Grid, Preload, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { ContactCore } from './ContactCore';
import { DeveloperDesk } from './DeveloperDesk';
import { ProjectCards } from './ProjectCards';
import { PostFX } from './PostFX';
import { SkillCloud } from './SkillCloud';
import type { ImmersiveProject } from './data';
import type { RigState } from './rig';

const SHARDS = Array.from({ length: 26 }, (_, index) => {
  const angle = index * 2.39996;
  const radius = 3.8 + (index % 6) * 1.2;
  return {
    position: [
      Math.cos(angle) * radius,
      -1.5 + Math.sin(index * 1.7) * 2.6,
      Math.sin(angle) * radius - 1.5,
    ] as [number, number, number],
    scale: 0.035 + (index % 4) * 0.022,
    color: index % 3 === 0 ? '#c8ff72' : '#5eead4',
  };
});

function Shards() {
  return (
    <group>
      {SHARDS.map((shard, index) => (
        <mesh
          key={index}
          position={shard.position}
          scale={shard.scale}
          rotation={[index * 0.4, index * 0.7, index * 0.2]}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={shard.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function SectionGate({
  rig,
  from,
  to,
  children,
}: {
  rig: MutableRefObject<RigState>;
  from: number;
  to: number;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const progress = rig.current.progress;
    const inside = progress >= from && progress <= to;
    const nextScale = MathUtils.damp(node.scale.x, inside ? 1 : 0, 6, Math.min(delta, 0.05));
    node.scale.setScalar(Math.max(nextScale, 0.001));
    node.visible = inside || nextScale > 0.02;
  });

  return <group ref={group}>{children}</group>;
}

function HeroMonument() {
  const { size } = useThree();
  const compact = size.width < 700;

  return (
    <group position={compact ? [1.85, 2.55, 1.1] : [3.15, 1.15, 2.4]} scale={compact ? 0.7 : 1}>
      <Float speed={1.1} rotationIntensity={0.32} floatIntensity={0.45}>
        <mesh>
          <icosahedronGeometry args={[2.05, 1]} />
          <meshBasicMaterial color="#2b8f82" wireframe transparent opacity={0.52} toneMapped={false} />
        </mesh>
      </Float>
      <mesh rotation={[Math.PI / 2.2, 0.2, 0.1]}>
        <torusGeometry args={[3.08, 0.012, 8, 200]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.62} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 1.9, -0.5, 0.8]}>
        <torusGeometry args={[3.65, 0.008, 8, 200]} />
        <meshBasicMaterial color="#c8ff72" transparent opacity={0.34} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#c8ff72" toneMapped={false} />
      </mesh>
    </group>
  );
}

function World({ rig, onOpenProject }: { rig: MutableRefObject<RigState>; onOpenProject: (project: ImmersiveProject) => void }) {
  return (
    <group>
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#bfffea', '#061114', 0.7]} />
      <directionalLight position={[5, 7, 6]} intensity={1.55} color="#e5fff8" />
      <pointLight position={[-7, 3, 4]} intensity={14} distance={18} decay={2} color="#5eead4" />
      <pointLight position={[7, -3, 2]} intensity={10} distance={16} decay={2} color="#c8ff72" />

      <Stars radius={90} depth={45} count={2800} factor={3.2} saturation={0} fade speed={0.35} />

      <Grid
        position={[0, -3.2, 0]}
        args={[50, 50]}
        cellSize={0.55}
        cellThickness={0.45}
        cellColor="#19342f"
        sectionSize={2.75}
        sectionThickness={0.8}
        sectionColor="#2dd4bf"
        fadeDistance={30}
        fadeStrength={1.4}
        infiniteGrid
      />

      <SectionGate rig={rig} from={0} to={0.115}>
        <HeroMonument />
      </SectionGate>

      <SectionGate rig={rig} from={0.115} to={0.475}>
        <ProjectCards onOpen={onOpenProject} />
      </SectionGate>

      <SectionGate rig={rig} from={0.48} to={0.72}>
        <DeveloperDesk />
      </SectionGate>

      <SectionGate rig={rig} from={0.69} to={0.87}>
        <SkillCloud />
      </SectionGate>

      <SectionGate rig={rig} from={0.84} to={1}>
        <ContactCore />
      </SectionGate>

      <Shards />
    </group>
  );
}

interface PortfolioSceneProps {
  rig: MutableRefObject<RigState>;
  onOpenProject: (project: ImmersiveProject) => void;
}

export function PortfolioScene({ rig, onOpenProject }: PortfolioSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.8, 15], fov: 42, near: 0.1, far: 120 }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <color attach="background" args={['#04070a']} />
      <fog attach="fog" args={['#04070a', 11, 35]} />
      <CameraRig rig={rig} />
      <Suspense fallback={null}>
        <World rig={rig} onOpenProject={onOpenProject} />
      </Suspense>
      <PostFX />
      <Preload all />
    </Canvas>
  );
}
