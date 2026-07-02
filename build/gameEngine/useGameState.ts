export type EPStatus = "locked" | "unlocked" | "completed";
export type GameNodeId = "story" | "run" | "quiz" | "ai_challenge" | "boss" | "reward" | "locked";

export interface EPState {
  id: string;
  status: EPStatus;
  progress: number;
  boss: string;
  completed_nodes: GameNodeId[];
  failed_nodes: string[];
  current_node: GameNodeId;
  boss_state: "offline" | "waiting" | "unstable" | "repaired";
}

export interface LearningTrace {
  user_id: string;
  xp: number;
  energy: number;
  level: number;
  streak: number;
  completed_ep: string[];
  failed_nodes: string[];
  learning_score: {
    grammar: number;
    logic: number;
    ai_understanding: number;
  };
}

export interface GameState {
  currentEp: string;
  miloPosition: number;
  eps: EPState[];
  trace: LearningTrace;
}

export const nodeOrder: Exclude<GameNodeId, "locked">[] = [
  "story",
  "run",
  "quiz",
  "ai_challenge",
  "boss",
  "reward"
];

export function createInitialGameState(eps: EPState[], trace: LearningTrace): GameState {
  const firstPlayable = eps.find((ep) => ep.status !== "locked") ?? eps[0];
  return {
    currentEp: firstPlayable?.id ?? "EP01",
    miloPosition: Math.max(0, eps.findIndex((ep) => ep.id === firstPlayable?.id)),
    eps,
    trace
  };
}

export function getEp(state: GameState, epId: string): EPState | undefined {
  return state.eps.find((ep) => ep.id === epId);
}

export function advanceNode(state: GameState, epId: string): GameState {
  const next = structuredClone(state);
  const ep = getEp(next, epId);
  if (!ep || ep.status === "locked") return next;

  const currentIndex = Math.max(0, nodeOrder.indexOf(ep.current_node as Exclude<GameNodeId, "locked">));
  const currentNode = nodeOrder[currentIndex];
  ep.completed_nodes = Array.from(new Set([...ep.completed_nodes, currentNode]));
  ep.current_node = nodeOrder[Math.min(currentIndex + 1, nodeOrder.length - 1)];
  ep.progress = Math.max(ep.progress, Math.round(((currentIndex + 1) / nodeOrder.length) * 100));
  next.currentEp = ep.id;
  next.miloPosition = next.eps.findIndex((item) => item.id === ep.id);
  next.trace.xp += 45;
  next.trace.energy += 8;
  next.trace.level = Math.max(1, Math.floor(next.trace.xp / 500) + 1);
  return next;
}

export function completeBoss(state: GameState, epId: string): GameState {
  const next = structuredClone(state);
  const ep = getEp(next, epId);
  if (!ep || ep.status === "locked") return next;

  ep.status = "completed";
  ep.progress = 100;
  ep.current_node = "reward";
  ep.boss_state = "repaired";
  ep.completed_nodes = Array.from(new Set([...ep.completed_nodes, ...nodeOrder]));
  next.trace.completed_ep = Array.from(new Set([...next.trace.completed_ep, ep.id]));
  unlockNextEpisode(next, ep.id);
  return next;
}

export function unlockNextEpisode(state: GameState, epId: string): GameState {
  const index = state.eps.findIndex((ep) => ep.id === epId);
  const nextEp = state.eps[index + 1];
  if (nextEp && nextEp.status === "locked") {
    nextEp.status = "unlocked";
    nextEp.current_node = "story";
    nextEp.boss_state = "waiting";
  }
  return state;
}
