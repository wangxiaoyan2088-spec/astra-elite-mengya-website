import type { EPWorld } from "./GameEngine";

type EPNodeProps = {
  ep: EPWorld;
  completed?: boolean;
};

export function EPNode({ ep, completed }: EPNodeProps) {
  const status = completed ? "completed" : ep.status;
  return (
    <article className={`ep-world-node ${status}`}>
      <a href={`/${ep.entry}`}>
        <span className="ep-planet">{status === "locked" ? "🔒" : completed ? "⭐" : "🌍"}</span>
        <span className="ep-id">{ep.id}</span>
        <strong>{ep.world_title}</strong>
        <small>{ep.title}</small>
        <em>{status}</em>
      </a>
    </article>
  );
}
