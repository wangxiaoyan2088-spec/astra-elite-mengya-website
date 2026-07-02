import type { GameState, GameNodeId } from "./useGameState";

export type AbilityKey = "grammar" | "logic" | "ai_understanding";

export interface LearningEvent {
  type: "click" | "answer" | "boss_win" | "node_complete";
  epId: string;
  nodeId: GameNodeId | string;
  correct?: boolean;
  answer?: string;
  createdAt: string;
}

const abilityByNode: Record<string, AbilityKey> = {
  story: "grammar",
  run: "logic",
  quiz: "grammar",
  ai_challenge: "ai_understanding",
  boss: "ai_understanding",
  reward: "logic"
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function recordAnswer(
  state: GameState,
  epId: string,
  nodeId: GameNodeId | string,
  correct: boolean,
  answer = ""
): GameState {
  const next = structuredClone(state);
  const ep = next.eps.find((item) => item.id === epId);
  if (!ep || ep.status === "locked") return next;

  const failedNodeId = `${epId}_${nodeId}`;
  const ability = abilityByNode[nodeId] ?? "logic";
  next.trace.learning_score[ability] = clampScore(
    next.trace.learning_score[ability] + (correct ? 3 : -2)
  );

  if (correct) {
    ep.completed_nodes = Array.from(new Set([...ep.completed_nodes, nodeId as GameNodeId]));
    ep.failed_nodes = ep.failed_nodes.filter((item) => item !== failedNodeId);
    next.trace.xp += 45;
    next.trace.energy += 8;
  } else {
    ep.failed_nodes = Array.from(new Set([...ep.failed_nodes, failedNodeId]));
    next.trace.failed_nodes = Array.from(new Set([...next.trace.failed_nodes, failedNodeId]));
    next.trace.energy = Math.max(0, next.trace.energy - 4);
  }

  appendLearningEvent(next, {
    type: "answer",
    epId,
    nodeId,
    correct,
    answer,
    createdAt: new Date().toISOString()
  });
  return next;
}

export function appendLearningEvent(state: GameState, event: LearningEvent): GameState {
  const traceWithLog = state.trace as typeof state.trace & { behavior_log?: LearningEvent[] };
  traceWithLog.behavior_log = [event, ...(traceWithLog.behavior_log ?? [])].slice(0, 100);
  return state;
}

export function getLearningSummary(state: GameState) {
  const score = state.trace.learning_score;
  return {
    xp: state.trace.xp,
    energy: state.trace.energy,
    completedEpCount: state.trace.completed_ep.length,
    failedNodeCount: state.trace.failed_nodes.length,
    averageScore: Math.round((score.grammar + score.logic + score.ai_understanding) / 3),
    strongestSkill: Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] as AbilityKey
  };
}
