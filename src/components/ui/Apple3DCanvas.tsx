'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface Apple3DCanvasProps {
  className?: string
}

export function Apple3DCanvas({ className = '' }: Apple3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Verify WebGL availability
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setIsSupported(false)
        return
      }
    } catch {
      setIsSupported(false)
      return
    }

    let animationFrameId: number
    const width = container.clientWidth || 320
    const height = container.clientHeight || 320

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 4.2

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting (Apple ambient + key light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0x0071e3, 2.5) // Apple Blue sheen
    keyLight.position.set(4, 5, 4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x52725d, 1.8) // Sage fill
    fillLight.position.set(-4, -2, -3)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight(0xffffff, 2.2, 10)
    rimLight.position.set(0, 3, 3)
    scene.add(rimLight)

    // Geometry: Elegant Torus Knot reminiscent of Apple's Siri / Vision spatial sphere
    const geometry = new THREE.TorusKnotGeometry(1.05, 0.32, 128, 32, 2, 3)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1d1d1f,
      emissive: 0x001428,
      metalness: 0.25,
      roughness: 0.15,
      transmission: 0.6,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.55, 32, 32)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x0071e3,
      emissive: 0x0071e3,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    })
    const innerSphere = new THREE.Mesh(innerGeo, innerMat)
    scene.add(innerSphere)

    // Mouse tracking for 3D parallax
    let targetRotationX = 0
    let targetRotationY = 0
    let currentRotationX = 0
    let currentRotationY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

      targetRotationY = x * 0.8
      targetRotationX = y * 0.8
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Resize observer
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // Render loop
    let clock = new THREE.Clock()
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Smooth lerp towards cursor
      currentRotationX += (targetRotationX - currentRotationX) * 0.05
      currentRotationY += (targetRotationY - currentRotationY) * 0.05

      // Floating continuous rotation
      mesh.rotation.x = currentRotationX + elapsedTime * 0.25
      mesh.rotation.y = currentRotationY + elapsedTime * 0.35
      mesh.position.y = Math.sin(elapsedTime * 1.5) * 0.08

      innerSphere.position.y = Math.sin(elapsedTime * 1.5 + 0.5) * 0.05
      innerSphere.rotation.y = elapsedTime * 0.5

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      resizeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)

      geometry.dispose()
      material.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      renderer.dispose()

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  if (!isSupported) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[260px] pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
