'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const WORLD_WIDTH = 420
const WORLD_HEIGHT = 620
const BIRD_SIZE = 26
const PIPE_WIDTH = 62
const GAP = 156

type Pipe = { x: number; top: number; passed: boolean }

function newPipe(x: number): Pipe { return { x, top: 150 + Math.random() * 230, passed: false } }

export default function OfflineFlappy() {
  const [offline, setOffline] = useState(false)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [birdY, setBirdY] = useState(WORLD_HEIGHT / 2)
  const [gameScale, setGameScale] = useState(1)
  const boardRef = useRef<HTMLButtonElement>(null)
  const [pipes, setPipes] = useState<Pipe[]>([newPipe(WORLD_WIDTH + 110), newPipe(WORLD_WIDTH + 350)])
  const frame = useRef<number | null>(null)
  const lastTime = useRef(0)
  const birdYRef = useRef(birdY)
  const velocity = useRef(0)
  const pipesRef = useRef(pipes)
  const scoreRef = useRef(0)
  const runningRef = useRef(false)

  useEffect(() => { const update = () => setOffline(!navigator.onLine); update(); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) } }, [])
  useEffect(() => { const board = boardRef.current; if (!board) return; const resize = () => setGameScale(Math.min(1.34, board.clientWidth / WORLD_WIDTH)); const observer = new ResizeObserver(resize); resize(); observer.observe(board); return () => observer.disconnect() }, [])

  const reset = useCallback(() => { const next = [newPipe(WORLD_WIDTH + 110), newPipe(WORLD_WIDTH + 350)]; birdYRef.current = WORLD_HEIGHT / 2; velocity.current = 0; pipesRef.current = next; scoreRef.current = 0; setBirdY(birdYRef.current); setPipes(next); setScore(0); setGameOver(false); setRunning(true); runningRef.current = true }, [])
  const flap = useCallback(() => { if (!offline) return; if (!runningRef.current || gameOver) reset(); velocity.current = -410 }, [gameOver, offline, reset])

  useEffect(() => {
    if (!offline || !running) return
    const tick = (time: number) => {
      const delta = Math.min((time - lastTime.current) / 1000 || 0, .035); lastTime.current = time
      velocity.current += 1120 * delta; birdYRef.current += velocity.current * delta
      const nextPipes = pipesRef.current.map((pipe) => ({ ...pipe, x: pipe.x - 150 * delta }))
      if (nextPipes[nextPipes.length - 1].x < WORLD_WIDTH - 70) nextPipes.push(newPipe(nextPipes[nextPipes.length - 1].x + 240))
      let nextScore = scoreRef.current
      nextPipes.forEach((pipe) => { if (!pipe.passed && pipe.x + PIPE_WIDTH < 82) { pipe.passed = true; nextScore += 1 } })
      const hitGround = birdYRef.current < 0 || birdYRef.current + BIRD_SIZE > WORLD_HEIGHT
      const hitPipe = nextPipes.some((pipe) => 82 + BIRD_SIZE > pipe.x && 82 < pipe.x + PIPE_WIDTH && (birdYRef.current < pipe.top || birdYRef.current + BIRD_SIZE > pipe.top + GAP))
      if (hitGround || hitPipe) { runningRef.current = false; setRunning(false); setGameOver(true); setBest((current) => Math.max(current, nextScore)); return }
      scoreRef.current = nextScore; pipesRef.current = nextPipes; setBirdY(birdYRef.current); setPipes(nextPipes); setScore(nextScore); frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [offline, running])

  useEffect(() => { const keydown = (event: KeyboardEvent) => { if (event.code === 'Space' || event.code === 'ArrowUp') { event.preventDefault(); flap() } }; window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown) }, [flap])
  if (!offline) return null
  return <div className="offline-overlay" role="dialog" aria-modal="true" aria-labelledby="offline-title"><div className="offline-shell"><div className="offline-topline"><span className="offline-logo">AR</span><span>Connection lost</span><span>{String(score).padStart(2, '0')} / best {String(best).padStart(2, '0')}</span></div><div className="offline-copy"><p className="section-label">Offline mode</p><h1 id="offline-title">Keep <span className="accent-text">flying.</span></h1><p>No internet right now. Take a short flight while we wait for the signal to return.</p></div><button ref={boardRef} className="flappy-board" type="button" onClick={flap} aria-label="Flap the bird"><div className="flappy-world" style={{ transform: `scale(${gameScale})` }}><div className="flappy-sky" /><div className="flappy-cloud cloud-one" /><div className="flappy-cloud cloud-two" /><div className="flappy-bird" style={{ transform: `translate(82px, ${birdY}px) rotate(${Math.max(-18, Math.min(80, velocity.current / 12))}deg)` }}><span /></div>{pipes.map((pipe, index) => <div key={`${pipe.x}-${index}`}><div className="flappy-pipe flappy-pipe-top" style={{ transform: `translate(${pipe.x}px, ${pipe.top - 480}px)` }} /><div className="flappy-pipe flappy-pipe-bottom" style={{ transform: `translate(${pipe.x}px, ${pipe.top + GAP}px)` }} /></div>)}<div className="flappy-ground" /><div className="flappy-message">{gameOver ? <><strong>Good flight.</strong><span>Tap or press Space to fly again</span></> : running ? <><strong>{score}</strong><span>Tap to flap</span></> : <><strong>Tap to start</strong><span>Space / ↑ also works</span></>}</div></div></button><div className="offline-footer"><span>Game runs locally in your browser</span><span>Waiting to reconnect automatically</span></div></div></div>
}
