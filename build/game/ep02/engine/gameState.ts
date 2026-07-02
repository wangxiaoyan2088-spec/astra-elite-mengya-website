export type EP02GameState =
  | "START"
  | "STORY"
  | "WORD_PUZZLE"
  | "AI_COMMAND"
  | "BOSS_CHALLENGE"
  | "REWARD"
  | "COMPLETE";

export interface EP02Progress {
  story: boolean;
  puzzle: boolean;
  ai_command: boolean;
  boss: boolean;
}

export interface EP02State {
  gameState: EP02GameState;
  progress: number;
  energy: number;
  xp: number;
  selectedWords: string[];
  completed: EP02Progress;
}

export const initialEP02State: EP02State = {
  gameState: "START",
  progress: 0,
  energy: 100,
  xp: 0,
  selectedWords: [],
  completed: {
    story: false,
    puzzle: false,
    ai_command: false,
    boss: false
  }
};

export const ep02Flow: EP02GameState[] = [
  "START",
  "STORY",
  "WORD_PUZZLE",
  "AI_COMMAND",
  "BOSS_CHALLENGE",
  "REWARD",
  "COMPLETE"
];
