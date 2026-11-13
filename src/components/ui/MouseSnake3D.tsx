'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * A lightweight additive 3D chain that trails the pointer. It only runs for
 * fine pointers, pauses when the visitor prefers reduced motion, and renders
 * behind the homepage content.
 */
export function MouseSnake3D() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.z = 28

    const segmentCount = 22
    const geometry = new THREE.SphereGeometry(0.32, 12, 12)
    const material = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const snake = new THREE.InstancedMesh(geometry, material, segmentCount)
    snake.frustumCulled = false
    snake.visible = false
    scene.add(snake)

    const points = Array.from({ length: segmentCount }, () => new THREE.Vector3())
    const target = new THREE.Vector3()
    const dummy = new THREE.Object3D()
    const clock = new THREE.Clock()
    let hasPointer = false
    let width = 1
    let height = 1
    let frame = 0

    const resize = () => {
      width = host.clientWidth || window.innerWidth
      height = host.clientHeight || window.innerHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const onPointerMove = (event: PointerEvent) => {
      const visibleHeight =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
      const visibleWidth = visibleHeight * camera.aspect
      target.set(
        (event.clientX / width) * visibleWidth - visibleWidth / 2,
        -(event.clientY / height) * visibleHeight + visibleHeight / 2,
        0,
      )
      if (!hasPointer) {
        points.forEach((point) => point.copy(target))
        hasPointer = true
        snake.visible = true
      }
    }

    const animate = () => {
      const elapsed = clock.getElapsedTime()

      if (hasPointer) {
        points[0].lerp(target, 0.22)
        for (let index = 1; index < segmentCount; index += 1) {
          points[index].lerp(points[index - 1], 0.34)
        }

        for (let index = 0; index < segmentCount; index += 1) {
          const wave = Math.sin(elapsed * 1.35 - index * 0.3)
          const trail = index / segmentCount
          dummy.position.set(
            points[index].x + wave * 0.035 * index,
            points[index].y + Math.cos(elapsed * 1.1 - index * 0.26) * 0.03 * index,
            wave * 0.55 - trail * 0.8,
          )
          dummy.scale.setScalar(1 - trail * 0.72)
          dummy.updateMatrix()
          snake.setMatrixAt(index, dummy.matrix)
        }
        snake.instanceMatrix.needsUpdate = true
      }

      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={hostRef} className="home-snake" aria-hidden="true" />
}
