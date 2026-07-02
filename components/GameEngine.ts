export type EPStatus = "locked" | "unlocked" | "completed";

export type EPWorld = {
  id: string;
  slug: string;
  title: string;
  world_title: string;
  status: EPStatus;
  xp_reward: number;
  energy_reward: number;
  boss: string;
  theme: string;
  entry: string;
};

export type EPNodeType = "story" | "learning" | "ai_challenge" | "boss" | "reward";

export type EPNode = {
  id: string;
  type: EPNodeType;
  label: string;
  title: string;
  description: string;
  xp: number;
};

export type PlayerProgress = {
  completed: string[];
  xp: number;
  energy: number;
  level: number;
  streak: number;
};

export function calculateLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

export function evaluateBossCommand(input: string, keywords: string[]) {
  const lower = input.toLowerCase();
  const hits = keywords.filter((keyword) => lower.includes(keyword)).length;
  if (hits >= 2) return { result: "correct", damage: 30 };
  if (hits === 1 || input.length > 10) return { result: "partial", damage: 10 };
  return { result: "teaching", damage: 0 };
}
