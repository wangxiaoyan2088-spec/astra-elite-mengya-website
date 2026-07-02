const target = "Repair the drone signal route";
const words = ["Repair", "the", "drone", "signal", "route"];

export function WordPuzzle({
  selectedWords,
  onPick,
  onReset,
  onSuccess,
  onHint
}: {
  selectedWords: string[];
  onPick: (word: string) => void;
  onReset: () => void;
  onSuccess: () => void;
  onHint: (message: string) => void;
}) {
  const check = () => {
    if (selectedWords.join(" ") === target) onSuccess();
    else onHint("Think about signal path: Repair + drone + signal + route.");
  };

  return (
    <article className="ep02-stage-card word-puzzle-stage">
      <p className="game-system-label">Stage 2 · Word Puzzle</p>
      <h2>Build the repair command</h2>
      <div className="puzzle-answer">{selectedWords.join(" ") || "Click words in order..."}</div>
      <div className="word-tile-grid">
        {words.map((word) => (
          <button key={word} type="button" onClick={() => onPick(word)}>
            {word}
          </button>
        ))}
      </div>
      <div className="ep02-action-row">
        <button className="ai-game-button primary" type="button" onClick={check}>
          Check Signal Route
        </button>
        <button className="ai-game-button" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </article>
  );
}
