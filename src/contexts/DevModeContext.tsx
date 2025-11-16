'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';

type DevMode = 'classic' | 'dev';

type DevCommandLog = {
  id: string;
  command: string;
  response: string;
  timestamp: number;
};

type VirtualFile = {
  type: 'file';
  content: string;
};

type VirtualDirectory = {
  type: 'dir';
  children: Record<string, VirtualNode>;
};

type VirtualNode = VirtualFile | VirtualDirectory;

const HOME_PATH = '/Users/lamirkohsa/portfolio';
const HOME_SEGMENTS = HOME_PATH.split('/').filter(Boolean);

const VIRTUAL_FILE_SYSTEM: VirtualDirectory = {
  type: 'dir',
  children: {
    Users: {
      type: 'dir',
      children: {
        lamirkohsa: {
          type: 'dir',
          children: {
            portfolio: {
              type: 'dir',
              children: {
                'README.md': {
                  type: 'file',
                  content: `# lamirkohsa.dev

Welcome to the virtual workspace! Use the built-in terminal commands to explore.

Commands to try:
  - ls, cd, pwd
  - cat README.md
  - theme light
  - js console.log('hello world')
`,
                },
                notes: {
                  type: 'dir',
                  children: {
                    'todo.txt': {
                      type: 'file',
                      content: `Design refinements
- Polish macOS terminal HUD
- Expand command simulation
- Add streaming output effects
`,
                    },
                  },
                },
                src: {
                  type: 'dir',
                  children: {
                    components: {
                      type: 'dir',
                      children: {
                        'DevConsoleHUD.tsx': {
                          type: 'file',
                          content: 'Virtual component placeholder. Open the real file in the editor to view implementation.\n',
                        },
                      },
                    },
                    'index.ts': {
                      type: 'file',
                      content: 'export * from "./components";\n',
                    },
                  },
                },
                public: {
                  type: 'dir',
                  children: {
                    'wallpaper.jpg': {
                      type: 'file',
                      content: 'Binary asset placeholder',
                    },
                  },
                },
                'package.json': {
                  type: 'file',
                  content: `{
  "name": "lamirkohsa.dev",
  "version": "1.0.0"
}
`,
                },
              },
            },
          },
        },
      },
    },
    etc: {
      type: 'dir',
      children: {
        'motd.txt': {
          type: 'file',
          content: 'You have discovered a hidden corner of the virtual filesystem.\n',
        },
      },
    },
  },
};

const PAGE_INFORMATION: Record<string, string[]> = {
  home: [
    'Page: Home',
    'Focus: Portfolio overview and featured projects',
    'Highlights:',
    '  • Hero introduction with current goals',
    '  • Featured projects built with MERN stack and cross-platform tooling',
    '  • Certifications and learning journey snapshots',
  ],
  about: [
    'Page: About',
    'Name: Ashok Rimal',
    'Role: Builder, problem-solver, lifelong learner',
    'Age: 21',
    'Education: Bachelor of Computer Applications, Crimson College of Technology (2022 – Present)',
    'Skills:',
    '  • Mobile: Swift (iOS fundamentals), Kotlin (Android essentials)',
    '  • Web: MongoDB, Express, React, Node.js, Tailwind CSS',
    '  • Foundations: C++, C, Responsive Web, Web Design',
    '  • Tools: Git & GitHub, Figma, AI-assisted prototyping',
  ],
  projects: [
    'Page: Projects',
    'Content: Case studies and shipped builds demonstrating real-world problem solving.',
    'Navigation hint: Use "page projects" to switch the UI view.',
  ],
  contact: [
    'Page: Contact',
    'Purpose: Provide quick ways to reach out for collaborations, internships, and freelance work.',
    'Includes: Email, social links, and availability notes.',
  ],
};

const isDirectory = (node: VirtualNode): node is VirtualDirectory => node.type === 'dir';
const isFile = (node: VirtualNode): node is VirtualFile => node.type === 'file';

const getNodeAtSegments = (segments: string[]): VirtualNode | null => {
  let node: VirtualNode = VIRTUAL_FILE_SYSTEM;
  for (const segment of segments) {
    if (!isDirectory(node)) {
      return null;
    }
    const nextNode: VirtualNode | undefined = node.children[segment];
    if (!nextNode) {
      return null;
    }
    node = nextNode;
  }
  return node;
};

const pathFromSegments = (segments: string[]): string => (segments.length ? `/${segments.join('/')}` : '/');

const segmentsStartWith = (segments: string[], prefix: string[]) =>
  prefix.length <= segments.length && prefix.every((value, index) => segments[index] === value);

const promptPathFromSegments = (segments: string[]): string => {
  if (segmentsStartWith(segments, HOME_SEGMENTS)) {
    const relative = segments.slice(HOME_SEGMENTS.length);
    return relative.length ? `~/${relative.join('/')}` : '~';
  }
  return pathFromSegments(segments);
};

type ResolveResult = {
  segments: string[];
  node: VirtualNode | null;
  raw: string;
};

const resolvePathSegments = (input: string | undefined, currentSegments: string[]): ResolveResult => {
  const raw = input?.trim() ?? '';
  if (!raw) {
    const segments = [...currentSegments];
    return { segments, node: getNodeAtSegments(segments), raw };
  }

  let working = raw;
  let baseSegments: string[];

  if (working.startsWith('/')) {
    baseSegments = [];
    working = working.slice(1);
  } else if (working.startsWith('~')) {
    baseSegments = [...HOME_SEGMENTS];
    working = working.slice(1);
    if (working.startsWith('/')) {
      working = working.slice(1);
    }
  } else {
    baseSegments = [...currentSegments];
  }

  const parts = working.split('/').filter(Boolean);
  for (const part of parts) {
    if (part === '.' || part === '') {
      continue;
    }
    if (part === '..') {
      if (baseSegments.length > 0) {
        baseSegments.pop();
      }
      continue;
    }
    baseSegments.push(part);
  }

  return { segments: baseSegments, node: getNodeAtSegments(baseSegments), raw };
};

const listDirectoryEntries = (dir: VirtualDirectory): string[] => {
  return Object.entries(dir.children)
    .sort((a, b) => {
      if (a[1].type === b[1].type) {
        return a[0].localeCompare(b[0]);
      }
      return a[1].type === 'dir' ? -1 : 1;
    })
    .map(([name, node]) => (isDirectory(node) ? `${name}/` : name));
};

const parseStoredSegments = (raw: string | null): string[] | null => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(part => typeof part === 'string')) {
      return parsed as string[];
    }
  } catch (error) {
    console.error('Failed to parse stored path for DevMode terminal:', error);
  }
  return null;
};

const clampHistory = (history: string[]): string[] => (history.length > 100 ? history.slice(-100) : history);

const clampLogs = (logs: DevCommandLog[]): DevCommandLog[] => (logs.length > 120 ? logs.slice(-120) : logs);

const formatValue = (value: unknown): string => {
  if (value instanceof Error) {
    return `Error: ${value.message}`;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'undefined') {
    return 'undefined';
  }
  if (typeof value === 'function') {
    return value.toString();
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

type PageConfig = {
  accentColors: Record<string, string>;
  sectionOrder: string[];
  knownSections: string[];
  autoLayout: boolean;
  content: Record<string, string>;
};

interface DevModeContextValue {
  mode: DevMode;
  setMode: (mode: DevMode) => void;
  runCommand: (input: string) => void;
  commandLogs: DevCommandLog[];
  commandHistory: string[];
  resetTerminalSession: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  registerPageSections: (page: string, sections: string[]) => void;
  getSectionOrder: (page: string, defaultOrder: string[]) => string[];
  getAccentColor: (page: string, section: string, fallback: string) => string;
  setAccentColor: (page: string, section: string, value: string) => void;
  getContentValue: (page: string, key: string, fallback: string) => string;
  setContentValue: (page: string, key: string, value: string) => void;
  moveSection: (page: string, source: string, target?: string) => void;
  isAutoLayoutEnabled: (page: string) => boolean;
}

const DevModeContext = createContext<DevModeContextValue | undefined>(undefined);

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultPageConfig = (): PageConfig => ({
  accentColors: {},
  sectionOrder: [],
  knownSections: [],
  autoLayout: false,
  content: {},
});

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DevMode>('classic');
  const [activePage, setActivePageState] = useState('home');
  const [pageConfigs, setPageConfigs] = useState<Record<string, PageConfig>>({});
  const [commandLogs, setCommandLogs] = useState<DevCommandLog[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const commandHistoryRef = useRef<string[]>([]);

  const appendLog = useCallback((command: string, response: string) => {
    const log: DevCommandLog = {
      id: makeId(),
      command,
      response,
      timestamp: Date.now(),
    };
    setCommandLogs(prev => [...prev.slice(-24), log]);
  }, []);

  const updatePageConfig = useCallback(
    (pageKey: string, transformer: (config: PageConfig) => PageConfig) => {
      setPageConfigs(prev => {
        const current = prev[pageKey] ?? defaultPageConfig();
        const next = transformer(current);
        return { ...prev, [pageKey]: next };
      });
    },
    [],
  );

  const registerPageSections = useCallback(
    (pageKey: string, sections: string[]) => {
      updatePageConfig(pageKey, current => {
        const knownSet = Array.from(new Set(sections));
        const sanitizedOrder = (current.sectionOrder.length ? current.sectionOrder : knownSet)
          .filter(section => knownSet.includes(section));
        const missing = knownSet.filter(section => !sanitizedOrder.includes(section));
        return {
          ...current,
          knownSections: knownSet,
          sectionOrder: [...sanitizedOrder, ...missing],
        };
      });
    },
    [updatePageConfig],
  );

  const getSectionOrder = useCallback(
    (pageKey: string, defaultOrder: string[]) => {
      const config = pageConfigs[pageKey];
      if (!config) {
        return defaultOrder;
      }
      const order = config.sectionOrder.length ? config.sectionOrder : defaultOrder;
      const sanitized = order.filter(section => defaultOrder.includes(section));
      const missing = defaultOrder.filter(section => !sanitized.includes(section));
      return [...sanitized, ...missing];
    },
    [pageConfigs],
  );

  const getAccentColor = useCallback(
    (pageKey: string, section: string, fallback: string) => {
      return pageConfigs[pageKey]?.accentColors[section] ?? fallback;
    },
    [pageConfigs],
  );

  const setAccentColor = useCallback(
    (pageKey: string, section: string, value: string) => {
      updatePageConfig(pageKey, current => ({
        ...current,
        accentColors: { ...current.accentColors, [section]: value },
      }));
    },
    [updatePageConfig],
  );

  const getContentValue = useCallback(
    (pageKey: string, key: string, fallback: string) => {
      return pageConfigs[pageKey]?.content[key] ?? fallback;
    },
    [pageConfigs],
  );

  const setContentValue = useCallback(
    (pageKey: string, key: string, value: string) => {
      updatePageConfig(pageKey, current => ({
        ...current,
        content: { ...current.content, [key]: value },
      }));
    },
    [updatePageConfig],
  );

  const moveSection = useCallback(
    (pageKey: string, source: string, target?: string) => {
      updatePageConfig(pageKey, current => {
        if (!current.sectionOrder.length || !current.sectionOrder.includes(source)) {
          return current;
        }
        const withoutSource = current.sectionOrder.filter(section => section !== source);
        if (target && withoutSource.includes(target)) {
          const index = withoutSource.indexOf(target);
          withoutSource.splice(index, 0, source);
        } else {
          withoutSource.push(source);
        }
        return { ...current, sectionOrder: withoutSource };
      });
    },
    [updatePageConfig],
  );

  const isAutoLayoutEnabled = useCallback(
    (pageKey: string) => {
      return pageConfigs[pageKey]?.autoLayout ?? false;
    },
    [pageConfigs],
  );

  const setMode = useCallback((next: DevMode) => {
    setModeState(next);
  }, []);

  const setActivePage = useCallback((page: string) => {
    setActivePageState(page);
  }, []);

  const resetTerminalSession = useCallback(() => {
    setCommandLogs([]);
    setCommandHistory([]);
    commandHistoryRef.current = [];
  }, []);

  useEffect(() => {
    commandHistoryRef.current = commandHistory;
  }, [commandHistory]);

  const runCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        return;
      }

      const existingHistory = commandHistoryRef.current;
      const nextHistory = clampHistory([...existingHistory, trimmed]);
      commandHistoryRef.current = nextHistory;
      setCommandHistory(nextHistory);

      const respond = (message: string) => appendLog(trimmed, message);

      const tokens = trimmed.split(/\s+/);
      const base = tokens[0]?.toLowerCase() ?? '';

      if (!base) {
        respond('No command detected. Type "help" for available commands.');
        return;
      }

      if (base === 'help') {
        respond(
          [
            'Available commands:',
            '  System:',
            '    clear          - Clear the terminal screen',
            '    date           - Show current date and time',
            '    echo <text>    - Display a line of text',
            '    exit           - Return to classic mode',
            '    help           - Show this help message',
            '    history        - Show recent command history',
            '    info [page]    - Show summary information about a page',
            '    js <code>      - Execute JavaScript and show the result',
            '    pwd            - Show current working directory',
            '    whoami         - Show current user',
            '  ',
            '  Navigation:',
            '    mode <classic|dev> - Switch between classic UI and dev overlay',
            '    page <name>    - Switch the active page (home, about, projects, contact)',
          ].join('\n'),
        );
        return;
      }

      if (base === 'clear') {
        setCommandLogs([]);
        return;
      }

      if (base === 'echo') {
        respond(tokens.slice(1).join(' '));
        return;
      }

      if (base === 'date') {
        respond(new Date().toLocaleString());
        return;
      }

      if (base === 'whoami') {
        respond('lamirkohsa');
        return;
      }

      if (base === 'pwd') {
        respond('/Users/lamirkohsa/portfolio');
        return;
      }

      if (base === 'exit') {
        setModeState('classic');
        respond('Exited to classic mode.');
        return;
      }

      if (base === 'history') {
        const history = commandHistoryRef.current.slice(-10);
        respond(history.length > 0 ? history.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n') : 'No command history.');
        return;
      }

      if (base === 'js') {
        const script = trimmed.slice(base.length).trim();
        if (!script) {
          respond('Usage: js <expression|statement>');
          return;
        }

        const logs: string[] = [];
        const captureConsole = {
          log: (...args: unknown[]) => {
            logs.push(args.map(formatValue).join(' '));
          },
          warn: (...args: unknown[]) => {
            logs.push(args.map(formatValue).join(' '));
          },
          error: (...args: unknown[]) => {
            logs.push(args.map(formatValue).join(' '));
          },
        } satisfies Pick<typeof console, 'log' | 'warn' | 'error'>;

        try {
          const body = /\breturn\b/.test(script) || script.includes(';') || script.includes('\n')
            ? script
            : `return (${script});`;
          const evaluator = new Function('console', `'use strict';\n${body}`);
          const result = evaluator(captureConsole);

          const flush = (value: unknown) => {
            const segments: string[] = [];
            if (logs.length) {
              segments.push(logs.join('\n'));
            }
            if (!(value === undefined && !logs.length)) {
              const formatted = formatValue(value);
              if (formatted !== 'undefined' || !segments.length) {
                segments.push(formatted);
              }
            }
            respond(segments.join('\n') || 'undefined');
          };

          if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
            (result as Promise<unknown>)
              .then(value => flush(value))
              .catch((error: unknown) => {
                if (logs.length) {
                  logs.push(formatValue(error));
                  respond(logs.join('\n'));
                } else {
                  respond(formatValue(error));
                }
              });
          } else {
            flush(result);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const segments = logs.length ? [...logs, `Error: ${message}`] : [`Error: ${message}`];
          respond(segments.join('\n'));
        }
        return;
      }

      if (base === 'mode') {
        const target = tokens[1]?.toLowerCase();
        if (target !== 'classic' && target !== 'dev') {
          respond('Usage: mode <classic|dev>');
          return;
        }
        setModeState(target);
        respond(`Mode set to ${target}.`);
        return;
      }

      if (base === 'page') {
        const targetPage = tokens[1]?.toLowerCase();
        if (!targetPage) {
          respond('Usage: page <name>');
          return;
        }
        setActivePageState(targetPage);
        respond(`Active page set to ${targetPage}.`);
        return;
      }

      if (base === 'info') {
        const targetPage = tokens[1]?.toLowerCase() ?? activePage;
        const info = PAGE_INFORMATION[targetPage];
        if (info) {
          respond(info.join('\n'));
        } else {
          const available = Object.keys(PAGE_INFORMATION)
            .map(key => `  • ${key}`)
            .join('\n');
          respond(`No information available for "${targetPage}". Try one of:\n${available}`);
        }
        return;
      }

      respond(`Unknown command: ${trimmed}. Type "help" for a list of commands.`);
    },
    [appendLog, activePage, setActivePageState],
  );

  const value = useMemo<DevModeContextValue>(
    () => ({
      mode,
      setMode,
      runCommand,
      commandLogs,
      commandHistory,
      resetTerminalSession,
      activePage,
      setActivePage: setActivePageState,
      registerPageSections,
      getSectionOrder,
      getAccentColor,
      setAccentColor,
      getContentValue,
      setContentValue,
      moveSection,
      isAutoLayoutEnabled,
    }),
    [
      mode,
      setMode,
      runCommand,
      commandLogs,
      commandHistory,
      resetTerminalSession,
      activePage,
      registerPageSections,
      getSectionOrder,
      getAccentColor,
      setAccentColor,
      getContentValue,
      setContentValue,
      moveSection,
      isAutoLayoutEnabled,
    ],
  );

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
}
