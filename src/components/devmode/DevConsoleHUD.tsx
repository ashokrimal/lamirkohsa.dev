'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useDevMode } from '@/contexts/DevModeContext';

const PROMPT_PREFIX = 'lamirkohsa@portfolio ~ %';

const MIN_TERMINAL_WIDTH = 720;
const MIN_TERMINAL_HEIGHT = 420;
const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 560;

type TerminalRect = {
  width: number;
  height: number;
  left: number;
  top: number;
};

type ResizeDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

const computeInitialRect = (): TerminalRect => {
  if (typeof window === 'undefined') {
    return {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      left: 0,
      top: 0,
    };
  }

  const maxWidth = Math.max(MIN_TERMINAL_WIDTH, Math.min(DEFAULT_WIDTH, window.innerWidth - 120));
  const maxHeight = Math.max(MIN_TERMINAL_HEIGHT, Math.min(DEFAULT_HEIGHT, window.innerHeight - 160));

  const left = Math.max((window.innerWidth - maxWidth) / 2, 60);
  const top = Math.max((window.innerHeight - maxHeight) / 2, 100);

  return {
    width: maxWidth,
    height: maxHeight,
    left,
    top,
  };
};

const clampRectToViewport = (rect: TerminalRect): TerminalRect => {
  if (typeof window === 'undefined') {
    return rect;
  }

  const minLeft = 48;
  const minTop = 96;
  const maxWidth = Math.max(MIN_TERMINAL_WIDTH, window.innerWidth - minLeft * 2);
  const maxHeight = Math.max(MIN_TERMINAL_HEIGHT, window.innerHeight - minTop - 80);

  const width = Math.min(Math.max(rect.width, MIN_TERMINAL_WIDTH), maxWidth);
  const height = Math.min(Math.max(rect.height, MIN_TERMINAL_HEIGHT), maxHeight);

  const left = Math.min(Math.max(rect.left, minLeft), window.innerWidth - width - minLeft);
  const top = Math.min(Math.max(rect.top, minTop), window.innerHeight - height - minTop);

  return { width, height, left, top };
};

const BatteryIcon = ({ level }: { level: number | null }) => {
  const safeLevel = Math.max(0, Math.min(100, level ?? 0));
  const fillWidth = `${Math.max(6, (safeLevel / 100) * 38)}px`;
  const isLow = safeLevel <= 15;
  return (
    <svg width="46" height="16" viewBox="0 0 46 16" className="text-white" aria-hidden="true">
      <rect x="1" y="1" width="40" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="3"
        y="3"
        width={fillWidth}
        height="10"
        rx="3"
        className={isLow ? 'fill-rose-400' : 'fill-emerald-400'}
      />
      <rect x="42.5" y="4" width="3" height="8" rx="2" className="fill-current" />
    </svg>
  );
};

const WifiIcon = ({ connected }: { connected: boolean }) => (
  <svg width="22" height="16" viewBox="0 0 22 16" className="text-white" aria-hidden="true">
    <path
      d="M11 13.5c-1.1 0-2-.9-2-2 0-.5.2-1 .6-1.4C9.9 9.8 10.4 9.5 11 9.5s1.1.3 1.4.6c.4.4.6.9.6 1.4 0 1.1-.9 2-2 2z"
      className={connected ? 'fill-emerald-400' : 'fill-slate-500'}
    />
    <path
      d="M4.2 6.7A11.9 11.9 0 0 1 11 4.5c2.6 0 5.1.9 7 2.2"
      fill="none"
      stroke={connected ? '#34d399' : '#64748b'}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6.9 9.3A7.7 7.7 0 0 1 11 7.8c1.7 0 3.4.6 4.6 1.5"
      fill="none"
      stroke={connected ? '#34d399' : '#64748b'}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9.7 11.9c.4-.3.8-.4 1.3-.4.5 0 1 .2 1.3.4"
      fill="none"
      stroke={connected ? '#34d399' : '#64748b'}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const FinderIcon = () => (
  <Image
    src="/finder-icon.png"
    alt="Finder"
    width={48}
    height={48}
    className="h-12 w-12 rounded-2xl shadow-[0_12px_24px_rgba(15,23,42,0.35)]"
  />
);

const SafariIcon = () => (
  <Image
    src="/safari.png"
    alt="Safari"
    width={48}
    height={48}
    className="h-12 w-12 rounded-full shadow-[0_10px_20px_rgba(8,47,73,0.35)]"
  />
);

const MailIcon = () => (
  <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 shadow-[0_10px_20px_rgba(30,64,175,0.4)]">
    <div className="absolute inset-2 rounded-xl border border-white/40 bg-white/10" />
    <div className="absolute inset-2 flex items-center justify-center">
      <div className="h-8 w-8 -rotate-45 border border-white/70" />
    </div>
  </div>
);

const TerminalIcon = () => (
  <Image
    src="/terminal.png"
    alt="Terminal"
    width={48}
    height={48}
    className="h-12 w-12 rounded-2xl shadow-[0_10px_20px_rgba(15,23,42,0.5)]"
  />
);

const TrashIcon = () => (
  <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-300 via-slate-200 to-slate-500 shadow-[0_10px_20px_rgba(100,116,139,0.4)]">
    <div className="absolute inset-x-2 top-2 h-2 rounded-full bg-slate-500/70" />
    <div className="absolute inset-x-3 top-4 bottom-2 rounded-lg border border-white/50 bg-white/40" />
    <div className="absolute inset-x-5 top-6 bottom-3 rounded bg-slate-600/30" />
  </div>
);

type DockApp = {
  id: string;
  label: string;
  renderIcon: () => JSX.Element;
};

const DOCK_APPS: DockApp[] = [
  { id: 'finder', label: 'Finder', renderIcon: () => <FinderIcon /> },
  { id: 'safari', label: 'Safari', renderIcon: () => <SafariIcon /> },
  { id: 'mail', label: 'Mail', renderIcon: () => <MailIcon /> },
  { id: 'terminal', label: 'Terminal', renderIcon: () => <TerminalIcon /> },
  { id: 'trash', label: 'Trash', renderIcon: () => <TrashIcon /> },
];

export default function DevConsoleHUD() {
  const { mode, runCommand, commandLogs = [], commandHistory = [], resetTerminalSession } = useDevMode();

  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [terminalRect, setTerminalRect] = useState<TerminalRect>(() => clampRectToViewport(computeInitialRect()));
  const resizeSessionRef = useRef<{
    direction: ResizeDirection;
    startRect: TerminalRect;
    startX: number;
    startY: number;
  } | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [now, setNow] = useState(() => new Date());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [connectionType, setConnectionType] = useState(() => {
    const connection = typeof navigator !== 'undefined' ? (navigator as any).connection : undefined;
    return connection?.effectiveType ?? 'Unknown';
  });
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mode === 'dev') {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
      setIsMinimized(false);
      setInputValue('');
      setCursorPosition(0);
      setHistoryIndex(null);
    }
  }, [mode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }
    const connection = (navigator as any).connection;
    const updateConnectionType = () => {
      setConnectionType(connection.effectiveType || 'Unknown');
    };

    connection.addEventListener('change', updateConnectionType);
    updateConnectionType();

    return () => connection.removeEventListener('change', updateConnectionType);
  }, []);

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const battery = await (navigator as any).getBattery?.();
        if (!battery) return;

        const updateLevel = () => setBatteryLevel(Math.round(battery.level * 100));
        updateLevel();
        battery.addEventListener('levelchange', updateLevel);
        return () => battery.removeEventListener('levelchange', updateLevel);
      } catch (error) {
        setBatteryLevel(null);
      }
      return undefined;
    };

    fetchBattery();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setTerminalRect(prev => clampRectToViewport(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen || isMinimized) {
      return;
    }
    requestAnimationFrame(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [commandLogs, isOpen, isMinimized]);

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) {
      return;
    }
    const pos = Math.max(0, Math.min(cursorPosition, inputValue.length));
    inputEl.setSelectionRange(pos, pos);
  }, [cursorPosition, inputValue.length]);

  const visibleLogs = useMemo(() => commandLogs.slice(-100), [commandLogs]);

  const formattedTime = useMemo(
    () => now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [now],
  );

  const formattedDate = useMemo(
    () => now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    [now],
  );

  const openTerminal = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setTerminalRect(clampRectToViewport(computeInitialRect()));
    resetTerminalSession();
    setInputValue('');
    setCursorPosition(0);
    setHistoryIndex(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [resetTerminalSession]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    resetTerminalSession();
    setInputValue('');
    setCursorPosition(0);
    setHistoryIndex(null);
  }, [resetTerminalSession]);

  const handleMinimize = useCallback(() => {
    if (!isOpen) return;
    setIsMinimized(prev => {
      const next = !prev;
      if (!next) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return next;
    });
  }, [isOpen]);

  const handleRestoreDefault = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setTerminalRect(clampRectToViewport(computeInitialRect()));
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleDockTerminalClick = useCallback(() => {
    if (!isOpen) {
      openTerminal();
      return;
    }
    if (isMinimized) {
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setIsMinimized(true);
    }
  }, [isMinimized, isOpen, openTerminal]);

  const handleResizeMove = useCallback(
    (event: MouseEvent) => {
      const session = resizeSessionRef.current;
      if (!session) {
        return;
      }

      event.preventDefault();

      const { direction, startRect, startX, startY } = session;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      let nextRect = { ...startRect };

      switch (direction) {
        case 'right':
          nextRect.width = startRect.width + deltaX;
          break;
        case 'left':
          nextRect.width = startRect.width - deltaX;
          nextRect.left = startRect.left + deltaX;
          break;
        case 'bottom':
          nextRect.height = startRect.height + deltaY;
          break;
        case 'top':
          nextRect.height = startRect.height - deltaY;
          nextRect.top = startRect.top + deltaY;
          break;
        case 'top-left':
          nextRect.width = startRect.width - deltaX;
          nextRect.left = startRect.left + deltaX;
          nextRect.height = startRect.height - deltaY;
          nextRect.top = startRect.top + deltaY;
          break;
        case 'top-right':
          nextRect.width = startRect.width + deltaX;
          nextRect.height = startRect.height - deltaY;
          nextRect.top = startRect.top + deltaY;
          break;
        case 'bottom-left':
          nextRect.width = startRect.width - deltaX;
          nextRect.left = startRect.left + deltaX;
          nextRect.height = startRect.height + deltaY;
          break;
        case 'bottom-right':
          nextRect.width = startRect.width + deltaX;
          nextRect.height = startRect.height + deltaY;
          break;
        default:
          break;
      }

      nextRect = clampRectToViewport(nextRect);
      setTerminalRect(nextRect);
    },
    [],
  );

  const stopResize = useCallback(() => {
    if (!resizeSessionRef.current) {
      return;
    }
    resizeSessionRef.current = null;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', stopResize);
  }, [handleResizeMove]);

  const startResize = useCallback(
    (direction: ResizeDirection, event: ReactMouseEvent) => {
      if (!isOpen || isMinimized) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      resizeSessionRef.current = {
        direction,
        startRect: terminalRect,
        startX: event.clientX,
        startY: event.clientY,
      };
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', stopResize);
    },
    [handleResizeMove, isMinimized, isOpen, stopResize, terminalRect],
  );

  useEffect(() => () => {
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', stopResize);
  }, [handleResizeMove, stopResize]);

  if (mode !== 'dev') {
    return null;
  }

  const executeCommand = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }
    runCommand?.(trimmed);
    setInputValue('');
    setCursorPosition(0);
    setHistoryIndex(null);
    setTimeout(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const syncCursor = (value: string, position: number) => {
    const clamped = Math.max(0, Math.min(position, value.length));
    setInputValue(value);
    setCursorPosition(clamped);
    setTimeout(() => inputRef.current?.setSelectionRange(clamped, clamped), 0);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executeCommand();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      syncCursor('', 0);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      syncCursor(inputValue, 0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      syncCursor(inputValue, inputValue.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!commandHistory.length) {
        return;
      }
      setHistoryIndex(prev => {
        const nextIndex = prev === null ? commandHistory.length - 1 : Math.max(prev - 1, 0);
        const value = commandHistory[nextIndex] ?? '';
        syncCursor(value, value.length);
        return nextIndex;
      });
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!commandHistory.length) {
        syncCursor('', 0);
        setHistoryIndex(null);
        return;
      }
      setHistoryIndex(prev => {
        if (prev === null) {
          syncCursor('', 0);
          return null;
        }
        const nextIndex = prev + 1;
        if (nextIndex >= commandHistory.length) {
          syncCursor('', 0);
          return null;
        }
        const value = commandHistory[nextIndex] ?? '';
        syncCursor(value, value.length);
        return nextIndex;
      });
      return;
    }

    requestAnimationFrame(() => {
      const pos = inputRef.current?.selectionStart ?? 0;
      setCursorPosition(pos);
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = event.target;
    setInputValue(value);
    setCursorPosition(selectionStart ?? value.length);
    setHistoryIndex(null);
  };

  const terminalStyle: React.CSSProperties = {
    width: `${terminalRect.width}px`,
    height: `${terminalRect.height}px`,
    left: `${terminalRect.left}px`,
    top: `${terminalRect.top}px`,
    position: 'absolute',
  };

  const beforeCursor = inputValue.slice(0, cursorPosition);
  const caretChar = inputValue[cursorPosition] ?? ' ';
  const afterCursor = inputValue.slice(
    caretChar === ' ' && cursorPosition === inputValue.length ? cursorPosition : cursorPosition + 1,
  );

  const renderResizeHandles = isOpen && !isMinimized;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-slate-100">
      <div className="absolute inset-0 bg-[url('/wallpaper.jpg')] bg-cover bg-center" />
      <div className="relative flex h-full flex-col">
        <header className="flex items-center justify-between bg-slate-950/60 px-6 py-3 text-xs text-white backdrop-blur">
          <div className="flex items-center gap-3 font-medium">
            <span className="text-base"></span>
            <span className="font-semibold">Terminal</span>
            <span className="text-white/60">Shell</span>
            <span className="text-white/60">Edit</span>
            <span className="text-white/60">View</span>
            <span className="text-white/60">Window</span>
            <span className="text-white/60">Help</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-white/80">
            <WifiIcon connected={isOnline} />
            <BatteryIcon level={batteryLevel} />
            <span className="uppercase tracking-[0.25em] text-white/60">{connectionType}</span>
            <span>{formattedTime}</span>
            <span>{formattedDate}</span>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 pb-20 pt-8">
          {isOpen && !isMinimized && (
            <main className="flex flex-1 items-center justify-center">
              <div
                className="group relative rounded-[26px] border border-white/10 text-[#c5c8c6] shadow-[0_42px_70px_rgba(0,0,0,0.5)]"
                style={terminalStyle}
              >
                <div className="absolute inset-0 rounded-[26px] bg-[#1e1e1e]" aria-hidden />
                <div
                  className="absolute inset-0 rounded-[26px] opacity-40"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '4px 4px, 6px 6px',
                    backgroundPosition: '0 0, 3px 3px',
                  }}
                  aria-hidden
                />
                <div
                  className="relative flex h-full flex-col overflow-hidden rounded-[26px]"
                  style={{ fontFamily: '"SF Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace' }}
                >
                  <div className="flex items-center gap-3 bg-[#2c2c2c]/90 px-5 py-3 font-sans text-sm text-white/75">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        aria-label="Close"
                        className="h-3.5 w-3.5 rounded-full bg-[#ff5f57] shadow-inner shadow-black/40 transition group-hover:brightness-110"
                        onClick={handleClose}
                      />
                      <button
                        type="button"
                        aria-label="Minimize"
                        className="h-3.5 w-3.5 rounded-full bg-[#febb2e] shadow-inner shadow-black/40 transition group-hover:brightness-110"
                        onClick={handleMinimize}
                      />
                      <button
                        type="button"
                        aria-label="Restore default size"
                        className="h-3.5 w-3.5 rounded-full bg-[#28c840] shadow-inner shadow-black/40 transition group-hover:brightness-110"
                        onClick={handleRestoreDefault}
                      />
                    </div>
                    <div className="mx-auto flex flex-1 flex-col items-center justify-center">
                      <span className="font-medium text-white/80">Dev Console</span>
                      <span className="text-xs text-white/40">lamirkohsa.dev — zsh</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/50" />
                  </div>

                  <div className="flex h-full flex-col font-mono text-[13px]">
                    <div className="relative flex-1 overflow-hidden">
                      <div className="absolute inset-0 overflow-y-auto px-6 py-6">
                        {visibleLogs.length === 0 ? (
                          <div className="text-white/60">
                            Welcome to Dev Console. Type <span className="text-emerald-300">help</span> to discover available commands.
                          </div>
                        ) : (
                          visibleLogs.map(log => (
                            <div key={log.id} className="mb-4">
                              <div className="flex gap-2 text-[#98c379]">
                                <span>{PROMPT_PREFIX}</span>
                                <span className="text-[#e5c07b]">{log.command}</span>
                              </div>
                              {log.response && (
                                <pre className="mt-1 whitespace-pre-wrap text-[#c5c8c6]">{log.response}</pre>
                              )}
                            </div>
                          ))
                        )}
                        <div ref={terminalEndRef} />
                      </div>
                    </div>

                    <div className="border-t border-white/10 bg-[#161616]/90 px-4 py-3" onClick={() => inputRef.current?.focus()}>
                      <div className="flex items-center gap-2">
                        <span className="text-[#98c379]">{PROMPT_PREFIX}</span>
                        <div className="relative flex-1 text-[#abb2bf]">
                          <span className="whitespace-pre">{beforeCursor}</span>
                          <span
                            className={`relative inline-flex h-5 min-w-[8px] items-center justify-center rounded-[2px] ${
                              isFocused ? 'bg-[#98c379] text-[#1e1e1e]' : 'bg-[#4d5b3c] text-[#d7ffb2]'
                            } animate-[pulse_1.25s_ease-in-out_infinite]`}
                          >
                            {caretChar === ' ' ? '\u00A0' : caretChar}
                          </span>
                          <span className="whitespace-pre">{afterCursor}</span>
                        </div>
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="absolute left-0 top-0 h-px w-px opacity-0"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        aria-hidden
                      />
                      <div className="mt-2 flex gap-3 text-xs text-white/40">
                        <span>⏎ execute</span>
                        <span>↑/↓ history</span>
                        <span>Ctrl+C clear line</span>
                      </div>
                    </div>
                  </div>

                  {renderResizeHandles && (
                    <>
                      <div
                        aria-hidden
                        className="absolute inset-x-6 top-[-6px] h-3 cursor-n-resize"
                        onMouseDown={event => startResize('top', event)}
                      />
                      <div
                        aria-hidden
                        className="absolute inset-x-6 bottom-[-6px] h-3 cursor-s-resize"
                        onMouseDown={event => startResize('bottom', event)}
                      />
                      <div
                        aria-hidden
                        className="absolute inset-y-6 left-[-6px] w-3 cursor-w-resize"
                        onMouseDown={event => startResize('left', event)}
                      />
                      <div
                        aria-hidden
                        className="absolute inset-y-6 right-[-6px] w-3 cursor-e-resize"
                        onMouseDown={event => startResize('right', event)}
                      />
                      <div
                        aria-hidden
                        className="absolute left-[-6px] top-[-6px] h-4 w-4 cursor-nw-resize"
                        onMouseDown={event => startResize('top-left', event)}
                      />
                      <div
                        aria-hidden
                        className="absolute right-[-6px] top-[-6px] h-4 w-4 cursor-ne-resize"
                        onMouseDown={event => startResize('top-right', event)}
                      />
                      <div
                        aria-hidden
                        className="absolute left-[-6px] bottom-[-6px] h-4 w-4 cursor-sw-resize"
                        onMouseDown={event => startResize('bottom-left', event)}
                      />
                      <div
                        aria-hidden
                        className="absolute bottom-[-6px] right-[-6px] h-4 w-4 cursor-se-resize"
                        onMouseDown={event => startResize('bottom-right', event)}
                      />
                    </>
                  )}
                </div>
              </div>
            </main>
          )}

          {isOpen && isMinimized && (
            <div className="pointer-events-auto rounded-2xl border border-white/15 bg-black/40 px-6 py-4 text-sm text-white/70 backdrop-blur">
              <button
                type="button"
                className="flex items-center gap-3"
                onClick={() => {
                  setIsMinimized(false);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
              >
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs uppercase tracking-[0.3em] text-white/60">Terminal</span>
                <span>Minimized — click to resume session</span>
              </button>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-6">
          <div className="pointer-events-auto rounded-3xl border border-white/10 bg-black/30 px-6 py-4 backdrop-blur">
            <div className="flex items-end gap-4">
              {DOCK_APPS.map(app => {
                const Icon = app.renderIcon;
                const isTerminal = app.id === 'terminal';
                const active = isTerminal && isOpen && !isMinimized;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      if (isTerminal) {
                        handleDockTerminalClick();
                      }
                    }}
                    className={`flex flex-col items-center transition-transform hover:-translate-y-1 ${
                      active ? 'scale-110 drop-shadow-[0_18px_35px_rgba(34,197,94,0.45)]' : ''
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <Icon />
                    </span>
                    <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/70">{app.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
