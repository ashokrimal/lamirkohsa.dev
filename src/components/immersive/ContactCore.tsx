'use client';

import { Float, Text } from '@react-three/drei';

export function ContactCore() {
  return (
    <group position={[-5.6, 1.4, -1]}>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#d7fff4"
            emissive="#5eead4"
            emissiveIntensity={2.2}
            metalness={0.2}
            roughness={0.18}
          />
        </mesh>
        <mesh scale={1.55}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.22} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05, 0.012, 8, 160]} />
          <meshBasicMaterial color="#5eead4" transparent opacity={0.72} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2.8, 0.5, 0.3]}>
          <torusGeometry args={[1.45, 0.008, 8, 160]} />
          <meshBasicMaterial color="#c8ff72" transparent opacity={0.4} toneMapped={false} />
        </mesh>
      </Float>

      <Text
        position={[0, 1.95, 0]}
        font="/fonts/rajdhani-semibold.ttf"
        fontSize={0.18}
        color="#c8ff72"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.16}
      >
        SIGNAL / OPEN
      </Text>

      <pointLight color="#5eead4" intensity={6} distance={7} decay={2} />
    </group>
  );
}
