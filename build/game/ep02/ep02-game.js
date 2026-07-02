(function () {
  const board = document.querySelector("[data-ep02-board]");
  if (!board) return;

  const stateLabel = document.querySelector("[data-ep02-state]");
  const xpLabel = document.querySelector("[data-ep02-xp]");
  const energyLabel = document.querySelector("[data-ep02-energy]");
  const progressBar = document.querySelector("[data-ep02-progress-bar]");
  const progressText = document.querySelector("[data-ep02-progress-text]");
  const hintBox = document.querySelector("[data-ep02-hint] p");
  const steps = document.querySelectorAll("[data-step]");
  const storageKey = "astraEliteEP02State";

  const fallbackConfig = {
    reward: { xp: 240, energy: 50, badge: "Signal Fixer", unlock: "EP03" },
    story: {
      alert: "Drone signal lost in desert grid",
      milo: "Signal waves are breaking. We need a clear route command.",
      leta: "Start with the mission words, then repair the signal path."
    },
    wordPuzzle: {
      target: "Repair the drone signal route",
      tiles: ["Repair", "the", "drone", "signal", "route"],
      hint: "Think about signal path: Repair + drone + signal + route."
    },
    aiCommand: {
      requiredAny: [["signal", "repair"], ["antenna", "restore"], ["drone", "locate", "signal"]],
      hint: "Try using repair + signal."
    },
    boss: {
      name: "PIX AI",
      status: "SIGNAL DISTORTION ACTIVE",
      choices: [
        { id: "A", label: "Turn off system", correct: false },
        { id: "B", label: "Repair signal route", correct: true },
        { id: "C", label: "Ignore warning", correct: false }
      ],
      hint: "PIX is not an enemy. Use a repair action, not an escape action."
    }
  };

  let config = fallbackConfig;
  let game = loadLocalState();

  function loadLocalState() {
    try {
      return {
        gameState: "START",
        progress: 0,
        energy: 100,
        xp: 0,
        selectedWords: [],
        completed: {
          story: false,
          puzzle: false,
          ai_command: false,
          boss: false
        },
        ...JSON.parse(localStorage.getItem(storageKey) || "{}")
      };
    } catch {
      return {
        gameState: "START",
        progress: 0,
        energy: 100,
        xp: 0,
        selectedWords: [],
        completed: {
          story: false,
          puzzle: false,
          ai_command: false,
          boss: false
        }
      };
    }
  }

  function saveLocalState() {
    localStorage.setItem(storageKey, JSON.stringify(game));
  }

  function setHint(message, tone) {
    hintBox.textContent = message;
    hintBox.closest("[data-ep02-hint]").dataset.tone = tone || "normal";
  }

  function setGameState(nextState) {
    game.gameState = nextState;
    saveLocalState();
    render();
  }

  function setProgress(value) {
    game.progress = Math.max(0, Math.min(100, value));
  }

  function setXP(value) {
    game.xp = Math.max(0, value);
  }

  function setEnergy(value) {
    game.energy = Math.max(0, value);
  }

  function reduceEnergy(value) {
    setEnergy(game.energy - value);
    setHint(`Energy -${value}. Think about signal path.`, "warning");
    board.classList.add("boss-shake");
    setTimeout(() => board.classList.remove("boss-shake"), 520);
  }

  function updateHud() {
    stateLabel.textContent = game.gameState;
    xpLabel.textContent = game.xp;
    energyLabel.textContent = game.energy;
    progressBar.style.width = `${game.progress}%`;
    progressText.textContent = `${game.progress}%`;
    steps.forEach((step) => {
      const stepName = step.dataset.step;
      const active = stepName === game.gameState;
      const order = ["STORY", "WORD_PUZZLE", "AI_COMMAND", "BOSS_CHALLENGE", "REWARD"];
      const currentIndex = order.indexOf(game.gameState);
      const stepIndex = order.indexOf(stepName);
      step.classList.toggle("active", active);
      step.classList.toggle("done", stepIndex >= 0 && currentIndex > stepIndex);
    });
  }

  function renderStart() {
    board.innerHTML = `
      <article class="ep02-stage-card story-start">
        <div class="signal-orb" aria-hidden="true"></div>
        <p class="game-system-label">Stage 1 · Story Start</p>
        <h1>Signal Route</h1>
        <strong class="signal-alert">${config.story.alert}</strong>
        <p>${config.story.milo}</p>
        <button class="ai-game-button primary" type="button" data-ep02-action="start">START MISSION</button>
      </article>
    `;
  }

  function renderStory() {
    board.innerHTML = `
      <article class="ep02-stage-card story-stage">
        <p class="game-system-label">Milo Signal Alert</p>
        <h2>Drone signal lost in desert grid</h2>
        <div class="ep02-comic-row">
          <div class="ep02-character">🐳</div>
          <p>${config.story.milo}</p>
        </div>
        <div class="ep02-comic-row leta">
          <div class="ep02-character">👧</div>
          <p>${config.story.leta}</p>
        </div>
        <button class="ai-game-button primary" type="button" data-ep02-action="story-complete">Open Word Puzzle</button>
      </article>
    `;
  }

  function renderWordPuzzle() {
    const selected = game.selectedWords.join(" ");
    const remaining = config.wordPuzzle.tiles.filter((tile, index) => {
      const selectedAtIndex = game.selectedWords.filter((word) => word === tile).length;
      const seenBefore = config.wordPuzzle.tiles.slice(0, index + 1).filter((word) => word === tile).length;
      return selectedAtIndex < seenBefore;
    });

    board.innerHTML = `
      <article class="ep02-stage-card word-puzzle-stage">
        <p class="game-system-label">Stage 2 · Word Puzzle</p>
        <h2>Build the repair command</h2>
        <div class="puzzle-answer">${selected || "Click words in order..."}</div>
        <div class="word-tile-grid">
          ${remaining.map((word) => `<button type="button" data-word="${word}">${word}</button>`).join("")}
        </div>
        <div class="ep02-action-row">
          <button class="ai-game-button primary" type="button" data-ep02-action="check-puzzle">Check Signal Route</button>
          <button class="ai-game-button" type="button" data-ep02-action="reset-puzzle">Reset</button>
        </div>
      </article>
    `;
  }

  function renderAICommand() {
    board.innerHTML = `
      <article class="ep02-stage-card ai-command-stage">
        <p class="game-system-label">Stage 3 · AI Command Input</p>
        <h2>Write a command to fix the system</h2>
        <p>Examples: Repair drone signal route · Restore antenna connection · Locate lost drone signal</p>
        <form data-ep02-command-form>
          <input name="command" autocomplete="off" placeholder="Write your command...">
          <button class="ai-game-button primary" type="submit">Send Command</button>
        </form>
        <div class="ep02-command-console" data-ep02-command-console>Waiting for your English command.</div>
      </article>
    `;
  }

  function renderBoss() {
    board.innerHTML = `
      <article class="ep02-stage-card boss-stage">
        <div class="pix-core" aria-hidden="true">PIX</div>
        <p class="game-system-label">Stage 4 · Boss Challenge</p>
        <h2>${config.boss.name}</h2>
        <strong class="signal-alert">${config.boss.status}</strong>
        <p>${config.boss.question || "Choose the correct repair action."}</p>
        <div class="boss-choice-grid">
          ${config.boss.choices.map((choice) => `
            <button type="button" data-boss-choice="${choice.id}" data-correct="${choice.correct}">
              <span>${choice.id}</span>
              <strong>${choice.label}</strong>
            </button>
          `).join("")}
        </div>
      </article>
    `;
  }

  function renderReward() {
    board.innerHTML = `
      <article class="ep02-stage-card reward-stage-card">
        <div class="reward-particles" aria-hidden="true"></div>
        <p class="game-system-label">Stage 5 · Reward System</p>
        <h2>STAGE CLEAR!</h2>
        <strong class="reward-badge">Badge: ${config.reward.badge}</strong>
        <div class="reward-grid">
          <span>XP +${config.reward.xp}</span>
          <span>Energy +${config.reward.energy}</span>
          <span>Unlock ${config.reward.unlock}</span>
        </div>
        <div class="ep02-action-row">
          <a class="ai-game-button primary" href="../index.html">Back to World Map</a>
          <button class="ai-game-button" type="button" data-ep02-action="restart">Replay EP02</button>
        </div>
      </article>
    `;
  }

  function render() {
    updateHud();
    if (game.gameState === "START") renderStart();
    if (game.gameState === "STORY") renderStory();
    if (game.gameState === "WORD_PUZZLE") renderWordPuzzle();
    if (game.gameState === "AI_COMMAND") renderAICommand();
    if (game.gameState === "BOSS_CHALLENGE") renderBoss();
    if (game.gameState === "REWARD" || game.gameState === "COMPLETE") renderReward();
  }

  function checkAICommand(value) {
    const lower = value.toLowerCase();
    return config.aiCommand.requiredAny.some((group) => group.every((word) => lower.includes(word)));
  }

  function completeEP02() {
    game.completed.boss = true;
    setProgress(100);
    setXP(game.xp + config.reward.xp);
    setEnergy(game.energy + config.reward.energy);
    setHint("PIX stabilized. Signal restored 100%. EP03 unlocked.", "success");
    saveLocalState();
    window.AstraEliteGameEngine?.completeBoss?.("EP02");
    setGameState("REWARD");
  }

  function restart() {
    game = {
      gameState: "START",
      progress: 0,
      energy: 100,
      xp: 0,
      selectedWords: [],
      completed: {
        story: false,
        puzzle: false,
        ai_command: false,
        boss: false
      }
    };
    saveLocalState();
    setHint("Follow the signal path. I will help when the system gets noisy.");
    render();
  }

  board.addEventListener("click", (event) => {
    const wordButton = event.target.closest("[data-word]");
    if (wordButton) {
      game.selectedWords.push(wordButton.dataset.word);
      saveLocalState();
      renderWordPuzzle();
      return;
    }

    const bossChoice = event.target.closest("[data-boss-choice]");
    if (bossChoice) {
      if (bossChoice.dataset.correct === "true") {
        bossChoice.classList.add("correct");
        setTimeout(completeEP02, 420);
      } else {
        bossChoice.classList.add("wrong");
        reduceEnergy(20);
        saveLocalState();
      }
      return;
    }

    const action = event.target.closest("[data-ep02-action]")?.dataset.ep02Action;
    if (!action) return;

    if (action === "start") {
      setGameState("STORY");
      setHint("Milo heard the alert. Let the story open the mission.");
    }
    if (action === "story-complete") {
      game.completed.story = true;
      setProgress(10);
      setGameState("WORD_PUZZLE");
      setHint("Click the words to build: Repair the drone signal route.");
    }
    if (action === "reset-puzzle") {
      game.selectedWords = [];
      saveLocalState();
      renderWordPuzzle();
      setHint("Puzzle reset. Try the signal path again.");
    }
    if (action === "check-puzzle") {
      const answer = game.selectedWords.join(" ");
      if (answer === config.wordPuzzle.target) {
        game.completed.puzzle = true;
        setProgress(30);
        setGameState("AI_COMMAND");
        setHint("Good job! Signal restored +30%. Now command the AI system.", "success");
      } else {
        setHint(config.wordPuzzle.hint, "warning");
        board.classList.add("signal-success-pulse");
        setTimeout(() => board.classList.remove("signal-success-pulse"), 620);
      }
    }
    if (action === "restart") restart();
  });

  board.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-ep02-command-form]");
    if (!form) return;
    event.preventDefault();
    const input = form.elements.command;
    const value = input.value.trim();
    const consoleBox = form.parentElement.querySelector("[data-ep02-command-console]");
    if (checkAICommand(value)) {
      game.completed.ai_command = true;
      setProgress(70);
      consoleBox.textContent = "Command accepted. Signal restoration 70%. PIX interference detected.";
      consoleBox.className = "ep02-command-console success";
      setHint("Good job! Prepare for PIX signal distortion.", "success");
      saveLocalState();
      setTimeout(() => setGameState("BOSS_CHALLENGE"), 780);
    } else {
      consoleBox.textContent = config.aiCommand.hint;
      consoleBox.className = "ep02-command-console warning";
      setHint(config.aiCommand.hint, "warning");
    }
  });

  fetch("../../data/ep02_game.json")
    .then((response) => response.ok ? response.json() : fallbackConfig)
    .then((json) => {
      config = { ...fallbackConfig, ...json };
      render();
    })
    .catch(() => render());
})();
