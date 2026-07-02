import type { PlayerProgress } from "./GameEngine";

type PlayerHUDProps = {
  name: string;
  progress: PlayerProgress;
  skills: string[];
};

export function PlayerHUD({ name, progress, skills }: PlayerHUDProps) {
  return (
    <aside className="player-hud">
      <div className="hud-avatar">{name.slice(0, 1)}</div>
      <div><span>Player</span><strong>{name}</strong></div>
      <div><span>Level</span><strong>{progress.level}</strong></div>
      <div><span>XP</span><strong>{progress.xp}</strong></div>
      <div><span>AI Energy</span><strong>{progress.energy}</strong></div>
      <div><span>Skills</span><strong>{skills.join(" · ")}</strong></div>
    </aside>
  );
}
