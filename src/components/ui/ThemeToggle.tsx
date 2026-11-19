'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme, type Theme, type ThemeOrigin } from '@/contexts/ThemeContext'
import { sensoryAudio } from '@/lib/sensory-audio'

interface ThemeToggleProps {
  className?: string
  variant?: 'button' | 'segmented'
}

function originFromEvent(event: React.MouseEvent<HTMLButtonElement>): ThemeOrigin {
  const rect = event.currentTarget.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

export function ThemeToggle({ className = '', variant = 'button' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render placeholder with same dimensions to prevent layout shifts
    return (
      <div
        className={`h-8 w-8 rounded-xl ${className}`}
        aria-hidden="true"
      />
    )
  }

  if (variant === 'segmented') {
    const options: Array<{ value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }> = [
      { value: 'light', label: 'Light', icon: Sun },
      { value: 'system', label: 'Auto', icon: Laptop },
      { value: 'dark', label: 'Dark', icon: Moon },
    ]

    return (
      <div
        className={`inline-flex items-center p-1 rounded-full bg-overlay-soft border border-line-subtle ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        {options.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={(event) => {
                sensoryAudio.playToggle()
                setTheme(option.value, originFromEvent(event))
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-surface text-ink font-semibold shadow-xs border border-line-subtle'
                  : 'text-muted hover:text-ink'
              }`}
              aria-pressed={isActive}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // Default compact icon button
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={(event) => {
        sensoryAudio.playToggle()
        toggleTheme(originFromEvent(event))
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-overlay hover:text-ink transition-colors duration-200 cursor-pointer active:scale-95 ${className}`}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={reduceMotion ? false : { opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
            className="inline-flex items-center justify-center"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={reduceMotion ? false : { opacity: 0, rotate: 30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, rotate: -30, scale: 0.8 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
            className="inline-flex items-center justify-center"
          >
            <Moon className="w-3.5 h-3.5 text-ink" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
