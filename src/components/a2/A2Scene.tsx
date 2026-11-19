'use client'

import { Suspense, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

/** Shared, mutable scene state written by the page and read inside the loop. */
export interface A2SceneState {
  progress: number
  pointerX: number
  pointerY: number
  burst: number
}

export function createA2SceneState(): A2SceneState {
  return { progress: 0, pointerX: 0, pointerY: 0, burst: 0 }
}

const ACCENT = '#63f5d3'
const SECONDARY = '#c9ff7a'

function ParticleField({ state }: { state: MutableRefObject<A2SceneState> }) {
  const points = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const count = 1400
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const mint = new THREE.Color(ACCENT)
    const lime = new THREE.Color(SECONDARY)

    for (let index = 0; index < count; index += 1) {
      const radius = 4 + Math.random() * 16
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[index * 3 + 1] = (Math.random() - 0.5) * 18
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

      const mixed = mint.clone().lerp(lime, Math.random())
      colors[index * 3] = mixed.r
      colors[index * 3 + 1] = mixed.g
      colors[index * 3 + 2] = mixed.b
    }

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return buffer
  }, [])

  useFrame((frame, delta) => {
    const node = points.current
    if (!node) return
    const step = Math.min(delta, 0.05)
    node.rotation.y += step * 0.035
    node.rotation.x = Math.sin(frame.clock.elapsedTime * 0.08) * 0.08
    // The field drifts forward as the page scrolls, so the world keeps moving.
    node.position.z = -state.current.progress * 6
    const scale = 1 + state.current.burst * 0.08
    node.scale.setScalar(scale)
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

function CoreObject({ state }: { state: MutableRefObject<A2SceneState> }) {
  const knot = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.Mesh>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const satellite = useRef<THREE.Mesh>(null)

  useFrame((frame, delta) => {
    const step = Math.min(delta, 0.05)
    const time = frame.clock.elapsedTime
    const scene = state.current
    const turn = 0.12 + scene.progress * 0.5

    if (knot.current) {
      knot.current.rotation.x += step * turn * 0.6
      knot.current.rotation.y += step * turn
      const scale = 1 + scene.burst * 0.12 + Math.sin(time * 0.6) * 0.02
      knot.current.scale.setScalar(scale)
    }
    if (shell.current) {
      shell.current.rotation.y -= step * 0.18
      shell.current.rotation.z += step * 0.06
    }
    if (ringA.current) ringA.current.rotation.z += step * 0.28
    if (ringB.current) ringB.current.rotation.z -= step * 0.2
    if (satellite.current) {
      const angle = time * 0.55
      satellite.current.position.set(Math.cos(angle) * 3.1, Math.sin(angle * 1.3) * 1.2, Math.sin(angle) * 3.1)
    }
  })

  return (
    <group>
      <mesh ref={knot} position={[0, 0.15, 0]}>
        <torusKnotGeometry args={[1.45, 0.32, 220, 28, 2, 3]} />
        <meshStandardMaterial
          color="#0e2b27"
          emissive={ACCENT}
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.75}
          wireframe
        />
      </mesh>

      <mesh ref={shell} position={[0, 0.15, 0]}>
        <icosahedronGeometry args={[2.9, 1]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.09} toneMapped={false} />
      </mesh>

      <mesh ref={ringA} position={[0, 0.15, 0]} rotation={[Math.PI / 2.1, 0.1, 0]}>
        <torusGeometry args={[3.7, 0.008, 8, 220]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.55} toneMapped={false} />
      </mesh>

      <mesh ref={ringB} position={[0, 0.15, 0]} rotation={[Math.PI / 1.75, -0.35, 0.5]}>
        <torusGeometry args={[4.4, 0.006, 8, 220]} />
        <meshBasicMaterial color={SECONDARY} transparent opacity={0.38} toneMapped={false} />
      </mesh>

      <mesh ref={satellite}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color={SECONDARY} toneMapped={false} />
      </mesh>
    </group>
  )
}

function ShardCluster() {
  const group = useRef<THREE.Group>(null)

  const shards = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => {
        const angle = index * 2.39996
        const radius = 3.6 + (index % 5) * 1.35
        return {
          position: [
            Math.cos(angle) * radius,
            -2.4 + Math.sin(index * 1.7) * 3.4,
            Math.sin(angle) * radius - 1.2,
          ] as [number, number, number],
          size: 0.05 + (index % 4) * 0.035,
          color: index % 3 === 0 ? SECONDARY : ACCENT,
          spin: 0.2 + (index % 5) * 0.08,
        }
      }),
    [],
  )

  useFrame((_, delta) => {
    const node = group.current
    if (!node) return
    node.rotation.y += Math.min(delta, 0.05) * 0.06
  })

  return (
    <group ref={group}>
      {shards.map((shard, index) => (
        <Float key={index} speed={1 + (index % 4) * 0.2} rotationIntensity={0.5} floatIntensity={0.9}>
          <mesh position={shard.position} scale={shard.size}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={shard.color} toneMapped={false} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function Rig({ state }: { state: MutableRefObject<A2SceneState> }) {
  const camera = useThree((three) => three.camera)
  const target = useRef(new THREE.Vector3(0, 0.2, 0))
  const pointer = useRef(new THREE.Vector2())

  useFrame((frame, delta) => {
    const step = Math.min(delta, 0.05)
    const scene = state.current
    pointer.current.lerp(frame.pointer, 1 - Math.exp(-4 * step))

    const time = frame.clock.elapsedTime
    const depth = 12.6 - scene.progress * 3.4
    const desiredX = pointer.current.x * 1.5 + Math.sin(time * 0.16) * 0.12
    const desiredY = 0.5 + pointer.current.y * 0.7 + Math.cos(time * 0.19) * 0.1
    const desiredZ = depth

    const ease = 1 - Math.exp(-3 * step)
    camera.position.x += (desiredX - camera.position.x) * ease
    camera.position.y += (desiredY - camera.position.y) * ease
    camera.position.z += (desiredZ - camera.position.z) * ease

    target.current.set(pointer.current.x * 0.3, 0.15 + scene.progress * -0.5, 0)
    camera.lookAt(target.current)
  })

  return null
}

export function A2Scene({ state }: { state: MutableRefObject<A2SceneState> }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.5, 12.6], fov: 45, near: 0.1, far: 80 }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.15
      }}
      aria-hidden="true"
    >
      <color attach="background" args={['#04070a']} />
      <fog attach="fog" args={['#04070a', 12, 34]} />

      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#bfffea', '#04070a', 0.6]} />
      <pointLight position={[6, 5, 5]} intensity={36} distance={26} decay={2} color={ACCENT} />
      <pointLight position={[-7, -3, 3]} intensity={22} distance={22} decay={2} color={SECONDARY} />

      <Suspense fallback={null}>
        <ParticleField state={state} />
        <CoreObject state={state} />
        <ShardCluster />
      </Suspense>

      <Rig state={state} />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.35} luminanceSmoothing={0.3} levels={6} />
        <Vignette offset={0.16} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  )
}
