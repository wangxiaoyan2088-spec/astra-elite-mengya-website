"use client";

import { useState } from "react";
import { AICommand } from "./components/AICommand";
import { BossBattle } from "./components/BossBattle";
import { RewardScreen } from "./components/RewardScreen";
import { StoryStage } from "./components/StoryStage";
import { WordPuzzle } from "./components/WordPuzzle";
import { initialEP02State, type EP02GameState } from "./engine/gameState";
import {
  acceptAICommand,
  completeStory,
  failBossChoice,
  restoreSignal,
  solvePuzzle
} from "./engine/progressEngine";
import { claimReward } from "./engine/rewardEngine";

export default function EP02Page() {
  const [gameState, setGameState] = useState<EP02GameState>("START");
  const [progress, setProgress] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [xp, setXP] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [hint, setHint] = useState("Follow the signal path. Leta will help when the system gets noisy.");

  const sync = (next: typeof initialEP02State) => {
    setGameState(next.gameState);
    setProgress(next.progress);
    setEnergy(next.energy);
    setXP(next.xp);
  };

  const state = {
    ...initialEP02State,
    gameState,
    progress,
    energy,
    xp,
    selectedWords
  };

  const renderStage = () => {
    if (gameState === "START" || gameState === "STORY") {
      return (
        <StoryStage
          onStart={() => {
            setGameState("WORD_PUZZLE");
            sync(completeStory(state));
          }}
        />
      );
    }

    if (gameState === "WORD_PUZZLE") {
      return (
        <WordPuzzle
          selectedWords={selectedWords}
          onPick={(word) => setSelectedWords((words) => [...words, word])}
          onReset={() => setSelectedWords([])}
          onHint={setHint}
          onSuccess={() => {
            sync(solvePuzzle(state));
            setHint("Good job! Signal restored +30%.");
          }}
        />
      );
    }

    if (gameState === "AI_COMMAND") {
      return (
        <AICommand
          onHint={setHint}
          onSuccess={() => {
            sync(acceptAICommand(state));
            setHint("Command accepted. PIX interference detected.");
          }}
        />
      );
    }

    if (gameState === "BOSS_CHALLENGE") {
      return (
        <BossBattle
          onWrong={() => {
            sync(failBossChoice(state));
            setHint("Energy -20. Think about signal path.");
          }}
          onSuccess={() => {
            const restored = restoreSignal(state);
            sync(claimReward(restored));
            setHint("PIX stabilized. EP03 unlocked.");
          }}
        />
      );
    }

    return <RewardScreen onReplay={() => sync(initialEP02State)} />;
  };

  return (
    <main className="ep02-game-page">
      <section className="ep02-hud-panel">
        <div className="ep02-hud-stat"><span>Game State</span><strong>{gameState}</strong></div>
        <div className="ep02-hud-stat"><span>XP</span><strong>{xp}</strong></div>
        <div className="ep02-hud-stat"><span>Energy</span><strong>{energy}</strong></div>
        <div className="ep02-signal-bar"><span>Signal Restoration</span><div><i style={{ width: `${progress}%` }} /></div><strong>{progress}%</strong></div>
      </section>
      <section className="ep02-game-board">{renderStage()}</section>
      <aside className="ep02-leta-hint"><span>Leta Hint</span><p>{hint}</p></aside>
    </main>
  );
}
