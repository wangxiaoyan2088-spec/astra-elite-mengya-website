import { isCorrectCommand } from "../engine/progressEngine";

export function AICommand({
  onSuccess,
  onHint
}: {
  onSuccess: () => void;
  onHint: (message: string) => void;
}) {
  return (
    <article className="ep02-stage-card ai-command-stage">
      <p className="game-system-label">Stage 3 · AI Command Input</p>
      <h2>Write a command to fix the system</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const input = new FormData(form).get("command")?.toString() ?? "";
          if (isCorrectCommand(input)) onSuccess();
          else onHint("Try using repair + signal.");
        }}
      >
        <input name="command" placeholder="Write your command..." />
        <button className="ai-game-button primary" type="submit">
          Send Command
        </button>
      </form>
    </article>
  );
}
