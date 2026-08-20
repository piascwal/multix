import { useState } from 'preact/hooks';
import { unlockAudio } from './game/audio';
import type { AnswerMode, GameMode, GameResult, LeaderboardScope } from './game/types';
import { Home } from './components/Home';
import { LeaderboardMenuScreen } from './components/LeaderboardMenuScreen';
import { Game } from './components/Game';
import { Results } from './components/Results';
import { useEffectsLayer } from './useEffectsLayer';

type Screen = 'home' | 'leaderboard' | 'game' | 'results';

const ALL_TABLES = new Set(Array.from({ length: 11 }, (_, i) => i + 2));

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [tables, setTables] = useState<Set<number>>(new Set());
  const [answerMode, setAnswerMode] = useState<AnswerMode>('qcm');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [playerName, setPlayerName] = useState('');
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('general');

  const effectsLayer = useEffectsLayer();

  function toggleTable(table: number): void {
    setTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) next.delete(table);
      else next.add(table);
      return next;
    });
  }

  function selectAll(currentlyAllSelected: boolean): void {
    setTables(currentlyAllSelected ? new Set() : new Set(ALL_TABLES));
  }

  function handleStart(): void {
    unlockAudio();
    setScreen('game');
  }

  function handleViewLeaderboard(): void {
    setLeaderboardScope(tables.size === 1 ? Array.from(tables)[0]! : 'general');
    setScreen('leaderboard');
  }

  function handleGameEnd(result: GameResult): void {
    setLastResult(result);
    setScreen('results');
  }

  return (
    <>
      {effectsLayer.layer}
      <div id="app">
        {screen === 'home' && (
          <Home
            tables={tables}
            onToggleTable={toggleTable}
            onSelectAll={selectAll}
            answerMode={answerMode}
            onAnswerModeChange={setAnswerMode}
            gameMode={gameMode}
            onGameModeChange={setGameMode}
            onStart={handleStart}
            onViewLeaderboard={handleViewLeaderboard}
          />
        )}

        {screen === 'leaderboard' && (
          <LeaderboardMenuScreen initialScope={leaderboardScope} onBack={() => setScreen('home')} />
        )}

        {screen === 'game' && (
          <Game
            tables={tables}
            answerMode={answerMode}
            gameMode={gameMode}
            effects={effectsLayer}
            onGameEnd={handleGameEnd}
          />
        )}

        {screen === 'results' && lastResult && (
          <Results
            result={lastResult}
            defaultPlayerName={playerName}
            onLaunchConfetti={effectsLayer.launchConfetti}
            onSaveName={setPlayerName}
            onMenu={() => setScreen('home')}
            onReplay={() => setScreen('game')}
          />
        )}
      </div>
    </>
  );
}
