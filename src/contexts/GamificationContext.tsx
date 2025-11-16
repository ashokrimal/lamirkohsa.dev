'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type GamificationMode = 'classic' | 'gamified';

type CharacterId = 'arcane-architect' | 'swift-shadow' | 'data-alchemist';

export interface PlayableCharacter {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  emoji: string;
  specialty: string;
}

interface GamificationContextValue {
  mode: GamificationMode;
  toggleMode: () => void;
  setMode: (mode: GamificationMode) => void;
  characters: PlayableCharacter[];
  character: PlayableCharacter;
  selectCharacter: (id: CharacterId) => void;
}

const defaultCharacters: PlayableCharacter[] = [
  {
    id: 'arcane-architect',
    name: 'Nova',
    title: 'Arcane Architect',
    description: 'Bends frontend constellations into immersive interfaces with precision and flare.',
    emoji: '🪄',
    specialty: 'Frontend sorcery & interaction design',
  },
  {
    id: 'swift-shadow',
    name: 'Kairo',
    title: 'Swift Shadow',
    description: 'Navigates mobile realms with stealthy sprints and polished, responsive flows.',
    emoji: '🗡️',
    specialty: 'Swift, Kotlin, and cross-platform agility',
  },
  {
    id: 'data-alchemist',
    name: 'Lyra',
    title: 'Data Alchemist',
    description: 'Transmutes backend chaos into reliable systems that scale and self-heal.',
    emoji: '⚗️',
    specialty: 'API design, automation, and observability',
  },
];

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<GamificationMode>('classic');
  const [characterId, setCharacterId] = useState<CharacterId>('arcane-architect');

  const value = useMemo<GamificationContextValue>(() => {
    const character = defaultCharacters.find(c => c.id === characterId) ?? defaultCharacters[0];

    const toggleMode = () => {
      setMode(current => (current === 'classic' ? 'gamified' : 'classic'));
    };

    const selectCharacter = (id: CharacterId) => {
      setCharacterId(id);
      setMode('gamified');
    };

    return {
      mode,
      toggleMode,
      setMode,
      characters: defaultCharacters,
      character,
      selectCharacter,
    };
  }, [mode, characterId]);

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
