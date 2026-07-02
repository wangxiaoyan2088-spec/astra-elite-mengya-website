export function StoryStage({ onStart }: { onStart: () => void }) {
  return (
    <article className="ep02-stage-card story-stage">
      <p className="game-system-label">Stage 1 · Story Start</p>
      <h1>Signal Route</h1>
      <strong className="signal-alert">Drone signal lost in desert grid</strong>
      <p>Milo receives a warning from the desert grid. The drone route is broken.</p>
      <button className="ai-game-button primary" type="button" onClick={onStart}>
        START MISSION
      </button>
    </article>
  );
}
