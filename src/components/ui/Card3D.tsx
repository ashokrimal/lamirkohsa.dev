'use client'

import React, { useRef, useState, useCallback } from 'react'

interface Card3DProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number // Maximum tilt in degrees, default 8
  glare?: boolean // Whether to render Apple-like specular sheen
  onClick?: () => void
}

export function Card3D({
  children,
  className = '',
  maxTilt = 7,
  glare = true,
  onClick,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      const tiltX = ((0.5 - y) * maxTilt * 2).toFixed(2)
      const tiltY = ((x - 0.5) * maxTilt * 2).toFixed(2)

      setTransformStyle(
        `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.012, 1.012, 1.012)`
      )
      setGlarePosition({
        x: Math.round(x * 100),
        y: Math.round(y * 100),
        opacity: 0.18,
      })
    },
    [maxTilt]
  )

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-[26px] overflow-hidden ${className}`}
    >
      {children}

      {/* Apple-style specular glass glare overlay */}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 380px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 70%)`,
          }}
        />
      )}
    </div>
  )
}
