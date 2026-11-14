'use client';

import { Float, Text } from '@react-three/drei';
import { DoubleSide } from 'three';

const SKILLS = ['NEXT.JS', 'REACT', 'THREE.JS', 'TYPESCRIPT', 'GSAP', 'POSTGRES'];

export function SkillCloud() {
  return (
    <group position={[0, 0.95, -0.2]}>
      <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.55}>
        <mesh>
          <octahedronGeometry args={[1.08, 1]} />
          <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh scale={0.46}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#0b1c1b"
            metalness={0.8}
            roughness={0.2}
            emissive="#5eead4"
            emissiveIntensity={0.55}
          />
        </mesh>
      </Float>

      <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[2.2, 0.01, 8, 180]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.34} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, -0.4, 0.5]}>
        <torusGeometry args={[2.8, 0.008, 8, 180]} />
        <meshBasicMaterial color="#c8ff72" transparent opacity={0.28} side={DoubleSide} toneMapped={false} />
      </mesh>

      {SKILLS.map((skill, index) => {
        const angle = (index / SKILLS.length) * Math.PI * 2;
        const radius = index % 2 === 0 ? 2.55 : 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle * 1.5) * 0.85;
        const z = Math.sin(angle) * radius;

        return (
          <Float key={skill} speed={1.2 + index * 0.08} rotationIntensity={0.1} floatIntensity={0.4}>
            <Text
              position={[x, y, z]}
              font="/fonts/rajdhani-semibold.ttf"
              fontSize={0.17}
              color={index % 2 === 0 ? '#c8ff72' : '#f4f1eb'}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.1}
            >
              {skill}
            </Text>
          </Float>
        );
      })}
    </group>
  );
}
