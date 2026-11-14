'use client';

import { Float, Text } from '@react-three/drei';

const SCREEN_LINES = [
  { width: 0.95, color: '#5eead4' },
  { width: 0.6, color: '#9eb0aa' },
  { width: 1.22, color: '#c8ff72' },
  { width: 0.76, color: '#5eead4' },
  { width: 1.04, color: '#6b8f88' },
  { width: 0.48, color: '#c8ff72' },
];

export function DeveloperDesk() {
  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.16}>
      <group position={[5.2, -2.45, 1.1]} rotation={[0, -0.55, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.7, 0.11, 1.65]} />
          <meshStandardMaterial color="#111b1e" metalness={0.65} roughness={0.34} />
        </mesh>

        {[-1.55, 1.55].map((x) => (
          <group key={x} position={[x, -0.48, 0]}>
            <mesh>
              <boxGeometry args={[0.06, 0.94, 0.06]} />
              <meshStandardMaterial color="#263438" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.48, 0.25]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
              <boxGeometry args={[0.06, 0.06, 0.6]} />
              <meshStandardMaterial color="#263438" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 0.34, -0.42]}>
          <boxGeometry args={[0.42, 0.06, 0.3]} />
          <meshStandardMaterial color="#263438" metalness={0.85} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0.66, -0.42]}>
          <boxGeometry args={[0.06, 0.62, 0.06]} />
          <meshStandardMaterial color="#263438" metalness={0.85} roughness={0.24} />
        </mesh>

        <mesh position={[0, 1.16, -0.22]}>
          <boxGeometry args={[1.92, 1.12, 0.08]} />
          <meshStandardMaterial color="#081014" metalness={0.82} roughness={0.18} />
        </mesh>
        <mesh position={[0, 1.16, -0.175]}>
          <planeGeometry args={[1.74, 0.94]} />
          <meshBasicMaterial color="#082a28" toneMapped={false} />
        </mesh>

        {SCREEN_LINES.map((line, index) => (
          <mesh key={`${line.width}-${index}`} position={[-0.7 + line.width / 2, 1.48 - index * 0.13, -0.168]}>
            <planeGeometry args={[line.width, 0.032]} />
            <meshBasicMaterial color={line.color} toneMapped={false} />
          </mesh>
        ))}

        <Text
          position={[-0.82, 1.57, -0.165]}
          font="/fonts/rajdhani-medium.ttf"
          fontSize={0.08}
          color="#f4f1eb"
          anchorX="left"
          anchorY="middle"
        >
          workspace.tsx
        </Text>

        <mesh position={[0, 0.1, 0.48]}>
          <boxGeometry args={[1.2, 0.035, 0.36]} />
          <meshStandardMaterial color="#0b1418" metalness={0.55} roughness={0.5} />
        </mesh>

        <mesh position={[1.35, 0.16, 0.35]}>
          <cylinderGeometry args={[0.11, 0.09, 0.22, 20]} />
          <meshStandardMaterial color="#d9e7df" metalness={0.1} roughness={0.4} />
        </mesh>
        <mesh position={[1.35, 0.29, 0.35]}>
          <torusGeometry args={[0.085, 0.018, 12, 24]} />
          <meshStandardMaterial color="#d9e7df" metalness={0.1} roughness={0.4} />
        </mesh>

        <group position={[-1.47, 0.08, -0.3]} rotation={[0, 0.3, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.6, 10]} />
            <meshStandardMaterial color="#3a4a4c" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0.14, 0.64, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.09, 0.2, 0.2, 20, 1, true]} />
            <meshStandardMaterial color="#c8ff72" side={2} emissive="#c8ff72" emissiveIntensity={0.5} />
          </mesh>
        </group>

        <pointLight position={[0, 1.2, 0.65]} color="#5eead4" intensity={2.4} distance={4.5} decay={2} />
      </group>
    </Float>
  );
}
