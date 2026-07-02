import type { EPWorld, PlayerProgress } from "./GameEngine";
import { EPNode } from "./EPNode";
import { PlayerHUD } from "./PlayerHUD";

type GameWorldMapProps = {
  worlds: EPWorld[];
  progress: PlayerProgress;
};

export function GameWorldMap({ worlds, progress }: GameWorldMapProps) {
  return (
    <main className="world-map-page">
      <section className="world-hero">
        <div>
          <p className="game-system-label">Super Mario World Map + AI Learning Engine</p>
          <h1>横版 AI 世界地图入口</h1>
        </div>
        <PlayerHUD name="Milo" progress={progress} skills={["Hint", "AI Vision"]} />
      </section>
      <section className="world-map-panel">
        <div className="ep-world-grid">
          {worlds.map((ep) => (
            <EPNode key={ep.id} ep={ep} completed={progress.completed.includes(ep.id)} />
          ))}
        </div>
      </section>
    </main>
  );
}
