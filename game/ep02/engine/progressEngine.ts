import type { EP02State } from "./gameState";

export function completeStory(state: EP02State): EP02State {
  return {
    ...state,
    gameState: "WORD_PUZZLE",
    progress: 10,
    completed: { ...state.completed, story: true }
  };
}

export function solvePuzzle(state: EP02State): EP02State {
  return {
    ...state,
    gameState: "AI_COMMAND",
    progress: 30,
    completed: { ...state.completed, puzzle: true }
  };
}

export function acceptAICommand(state: EP02State): EP02State {
  return {
    ...state,
    gameState: "BOSS_CHALLENGE",
    progress: 70,
    completed: { ...state.completed, ai_command: true }
  };
}

export function failBossChoice(state: EP02State): EP02State {
  return {
    ...state,
    energy: Math.max(0, state.energy - 20)
  };
}

export function restoreSignal(state: EP02State): EP02State {
  return {
    ...state,
    gameState: "REWARD",
    progress: 100,
    completed: { ...state.completed, boss: true }
  };
}

export function isCorrectCommand(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    (lower.includes("signal") && lower.includes("repair")) ||
    (lower.includes("antenna") && lower.includes("restore")) ||
    (lower.includes("drone") && lower.includes("locate") && lower.includes("signal"))
  );
}
