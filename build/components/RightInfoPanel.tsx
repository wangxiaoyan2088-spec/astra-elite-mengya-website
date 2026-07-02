import type { EPWorld } from "./GameEngine";

type RightInfoPanelProps = {
  ep: EPWorld & { image?: string; lesson_title?: string; energy_reward?: number; xp?: number };
};

export function RightInfoPanel({ ep }: RightInfoPanelProps) {
  const locked = ep.status === "locked";
  return (
    <aside className="level-preview-panel">
      <p className="game-system-label">Level Preview</p>
      <h2>{ep.id} {ep.title}</h2>
      {ep.image ? <img src={ep.image} alt={`${ep.title} preview`} /> : null}
      <p>{ep.lesson_title || ep.theme}</p>
      <div className="preview-boss-row">
        <span className="boss-face">🤖</span>
        <strong>Boss: {ep.boss}</strong>
      </div>
      <div className="preview-rewards">
        <span>💜 XP {ep.xp || ep.xp_reward}</span>
        <span>⚡ Energy +{ep.energy_reward || 50}</span>
      </div>
      <button className="ai-game-button primary" disabled={locked}>
        {locked ? "Locked" : "Enter Level"}
      </button>
    </aside>
  );
}
