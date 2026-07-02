import type { EP02State } from "./gameState";

export const ep02Reward = {
  xp: 240,
  energy: 50,
  badge: "Signal Fixer",
  unlock: "EP03"
};

export function claimReward(state: EP02State): EP02State {
  return {
    ...state,
    gameState: "COMPLETE",
    xp: state.xp + ep02Reward.xp,
    energy: state.energy + ep02Reward.energy
  };
}
