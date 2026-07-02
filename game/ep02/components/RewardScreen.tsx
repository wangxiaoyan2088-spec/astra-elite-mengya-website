import { ep02Reward } from "../engine/rewardEngine";

export function RewardScreen({ onReplay }: { onReplay: () => void }) {
  return (
    <article className="ep02-stage-card reward-stage-card">
      <div className="reward-particles" aria-hidden="true" />
      <p className="game-system-label">Stage 5 · Reward System</p>
      <h2>STAGE CLEAR!</h2>
      <strong className="reward-badge">Badge: {ep02Reward.badge}</strong>
      <div className="reward-grid">
        <span>XP +{ep02Reward.xp}</span>
        <span>Energy +{ep02Reward.energy}</span>
        <span>Unlock {ep02Reward.unlock}</span>
      </div>
      <button className="ai-game-button" type="button" onClick={onReplay}>
        Replay EP02
      </button>
    </article>
  );
}
