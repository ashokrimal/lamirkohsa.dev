'use client'

import { useCallback, useRef, useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { useReducedMotion } from 'framer-motion'

/**
 * Tiny atmospheric warm-sage + stone SVG blur placeholder rendered inline at zero
 * network cost so project banners and case study frames display a cohesive blurred
 * preview before transitioning sharply to the full asset.
 */
const DEFAULT_LQIP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d7d2c8"/><stop offset="55%" stop-color="#b8c4bc"/><stop offset="100%" stop-color="#8b948e"/></linearGradient></defs><rect width="32" height="20" fill="url(#g)"/><ellipse cx="11" cy="8" rx="10" ry="6" fill="#e9e4da" fill-opacity="0.45"/><ellipse cx="23" cy="14" rx="9" ry="6" fill="#5e7f69" fill-opacity="0.22"/></svg>`

export const PROJECT_LQIP_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DEFAULT_LQIP_SVG)}`

export interface ProgressiveImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  blurDataURL?: string
  placeholderClassName?: string
}

/**
 * Progressive image loader pairing an immediate blurred low-quality placeholder
 * with a crisp fade + de-blur transition once the high-resolution image arrives.
 */
export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  blurDataURL = PROJECT_LQIP_DATA_URL,
  onLoad,
  onError,
  referrerPolicy = 'no-referrer',
  ...props
}: ProgressiveImageProps) {
  const reduceMotion = useReducedMotion()
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const srcKey = typeof src === 'string' ? src : JSON.stringify(src)
  const isLoaded = loadedSrc === srcKey

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setLoadedSrc(srcKey)
      onLoad?.(event)
    },
    [onLoad, srcKey],
  )

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setLoadedSrc(srcKey)
      onError?.(event)
    },
    [onError, srcKey],
  )

  const checkCachedRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node
      if (node && node.complete && node.naturalWidth > 0 && loadedSrc !== srcKey) {
        queueMicrotask(() => {
          setLoadedSrc(srcKey)
        })
      }
    },
    [loadedSrc, srcKey],
  )

  return (
    <>
      {/* Blurred low-quality atmospheric placeholder backdrop */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity ${
          reduceMotion ? 'duration-150' : 'duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
        } ${isLoaded ? 'opacity-0' : 'opacity-100'} ${placeholderClassName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blurDataURL}
          alt=""
          className="h-full w-full scale-110 object-cover blur-2xl saturate-125"
        />
        {!reduceMotion && (
          <span className="absolute inset-0 animate-pulse bg-gradient-to-tr from-black/5 via-white/15 to-transparent" />
        )}
      </span>

      <Image
        ref={checkCachedRef}
        src={src}
        alt={alt}
        placeholder="blur"
        blurDataURL={blurDataURL}
        referrerPolicy={referrerPolicy}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-[transform,opacity,filter] ${
          reduceMotion ? 'duration-150' : 'duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
        } ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
        {...props}
      />
    </>
  )
}
