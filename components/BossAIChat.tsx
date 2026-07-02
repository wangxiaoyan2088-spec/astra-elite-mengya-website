type BossAIChatProps = {
  bossName: string;
  hp: number;
};

export function BossAIChat({ bossName, hp }: BossAIChatProps) {
  return (
    <section className="boss-chat-panel">
      <header>
        <h1>{bossName}</h1>
        <p>STATUS: INSTABILITY HIGH</p>
        <div className="boss-hp-shell">
          <div className="boss-hp-bar" style={{ width: `${hp}%` }} />
        </div>
      </header>
      <div className="boss-chat-window" />
      <form className="boss-input-row">
        <input type="text" name="message" placeholder="Type an English repair command..." />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
