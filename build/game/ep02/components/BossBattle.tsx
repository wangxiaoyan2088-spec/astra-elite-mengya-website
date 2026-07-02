const choices = [
  { id: "A", label: "Turn off system", correct: false },
  { id: "B", label: "Repair signal route", correct: true },
  { id: "C", label: "Ignore warning", correct: false }
];

export function BossBattle({
  onSuccess,
  onWrong
}: {
  onSuccess: () => void;
  onWrong: () => void;
}) {
  return (
    <article className="ep02-stage-card boss-stage">
      <div className="pix-core" aria-hidden="true">PIX</div>
      <p className="game-system-label">Stage 4 · Boss Challenge</p>
      <h2>PIX AI</h2>
      <strong className="signal-alert">SIGNAL DISTORTION ACTIVE</strong>
      <div className="boss-choice-grid">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={choice.correct ? onSuccess : onWrong}
          >
            <span>{choice.id}</span>
            <strong>{choice.label}</strong>
          </button>
        ))}
      </div>
    </article>
  );
}
