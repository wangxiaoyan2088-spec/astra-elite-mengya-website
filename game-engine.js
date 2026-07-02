(function () {
  const data = window.ASTRA_GAME_DATA || {};
  const storageKey = "astraEliteGameProgress";

  const defaults = {
    completed: [],
    xp: data.player?.xp || 1200,
    energy: data.player?.energy || 80,
    level: data.player?.level || 3,
    streak: data.player?.streak || 1
  };

  function loadProgress() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch {
      return { ...defaults };
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }

  function addProgress(xp, energy) {
    const progress = loadProgress();
    progress.xp += xp;
    progress.energy += energy;
    progress.level = Math.max(1, Math.floor(progress.xp / 500) + 1);
    saveProgress(progress);
    renderPlayerHud();
    return progress;
  }

  function relativeFromGameRoot(entry) {
    return entry.replace(/^game\//, "");
  }

  function rewardValue(ep) {
    return ep.xp || ep.xp_reward || 0;
  }

  function renderLevelPreview(ep) {
    const panel = document.querySelector("[data-level-preview]");
    if (!panel || !ep) return;
    const locked = ep.status === "locked";
    panel.innerHTML = `
      <p class="game-system-label">Level Preview</p>
      <h2>${ep.id} ${ep.title}</h2>
      <img src="${ep.image || "../assets/scenery/mooncity_signal.jpg"}" alt="${ep.title} level preview">
      <p>${ep.lesson_title || ep.theme}：进入 ${ep.title}，用英语、逻辑和 AI 指令完成学习闯关。</p>
      <div class="preview-boss-row">
        <span class="boss-face">🤖</span>
        <strong>Boss: ${ep.boss}</strong>
      </div>
      <div class="preview-rewards">
        <span>💜 XP ${rewardValue(ep)}</span>
        <span>⚡ Energy +${ep.energy_reward || 50}</span>
      </div>
      <button class="ai-game-button primary" type="button" data-enter-selected ${locked ? "disabled" : ""}>${locked ? "Locked" : "Enter Level"}</button>
    `;
    const enter = panel.querySelector("[data-enter-selected]");
    if (enter && !locked) {
      enter.addEventListener("click", () => {
        window.location.href = relativeFromGameRoot(ep.entry);
      });
    }
  }

  function renderPlayerHud() {
    const hud = document.querySelector("[data-player-hud]");
    if (!hud) return;
    const progress = loadProgress();
    const skills = data.player?.skills || ["Hint"];
    hud.innerHTML = `
      <div class="hud-avatar">M</div>
      <div>
        <span>Player</span>
        <strong>${data.player?.name || "Milo"}</strong>
      </div>
      <div>
        <span>Level</span>
        <strong>${progress.level}</strong>
      </div>
      <div>
        <span>XP</span>
        <strong>${progress.xp}</strong>
      </div>
      <div>
        <span>AI Energy</span>
        <strong>${progress.energy}</strong>
      </div>
      <div>
        <span>Skills</span>
        <strong>${skills.join(" · ")}</strong>
      </div>
    `;
  }

  function renderWorldMap() {
    const map = document.querySelector("[data-world-map]");
    if (!map) return;
    const progress = loadProgress();
    map.innerHTML = "";
    const worlds = data.epWorlds || [];
    renderLevelPreview(worlds[0]);
    worlds.forEach((ep, index) => {
      const completed = progress.completed.includes(ep.id);
      const status = completed ? "completed" : ep.status;
      const node = document.createElement("article");
      node.className = `ep-world-node ${status}`;
      node.style.setProperty("--node-index", index);
      node.innerHTML = `
        <button type="button" ${status === "locked" ? "disabled" : ""} data-ep-index="${index}" data-ep-entry="${relativeFromGameRoot(ep.entry)}" aria-label="${ep.id} ${ep.title}" title="+${rewardValue(ep)} XP · Boss: ${ep.boss}">
          <span class="ep-planet">${status === "locked" ? "🔒" : completed ? "⭐" : "🌍"}</span>
          <span class="ep-id">${ep.id}</span>
          <strong>${ep.title}</strong>
          <small>${completed ? "⭐⭐⭐" : status === "locked" ? "☆☆☆" : "⭐⭐⭐"}</small>
          <em>${status === "locked" ? "Locked" : completed ? "Completed" : "Open"}</em>
          <span class="ep-hover-tip">+${rewardValue(ep)} XP · Boss: ${ep.boss}</span>
        </button>
        <div class="floating-island" aria-hidden="true"><i></i></div>
      `;
      map.appendChild(node);
    });
    map.querySelectorAll("[data-ep-entry]").forEach((button) => {
      button.addEventListener("mouseenter", () => {
        renderLevelPreview(worlds[Number(button.dataset.epIndex)]);
      });
      button.addEventListener("focus", () => {
        renderLevelPreview(worlds[Number(button.dataset.epIndex)]);
      });
      button.addEventListener("click", () => {
        const ep = worlds[Number(button.dataset.epIndex)];
        renderLevelPreview(ep);
        if (ep.status === "locked") {
          button.closest(".ep-world-node")?.classList.add("lock-shake");
          setTimeout(() => button.closest(".ep-world-node")?.classList.remove("lock-shake"), 520);
          return;
        }
        window.location.href = button.dataset.epEntry;
      });
    });
  }

  function nodeIcon(type) {
    if (type === "story") return "🟢";
    if (type === "learning") return "🟡";
    if (type === "ai_challenge") return "🔵";
    if (type === "boss") return "🔴";
    if (type === "reward") return "⭐";
    return "🌍";
  }

  function renderEpNodes() {
    const track = document.querySelector("[data-ep-nodes]");
    if (!track) return;
    const epId = document.body.dataset.epId || "EP01";
    const nodes = data.epNodes?.[epId] || [];
    track.innerHTML = nodes
      .map((node, index) => `
        <article class="ep-stage-node ${node.type}">
          <span class="stage-icon">${nodeIcon(node.type)}</span>
          <small>${node.label}</small>
          <h3>${node.title}</h3>
          <p>${node.description}</p>
          <strong>+${node.xp} XP</strong>
          ${index < nodes.length - 1 ? '<i class="stage-connector"></i>' : ""}
        </article>
      `)
      .join("");
  }

  function bindEpInteractions() {
    const award = document.querySelector("[data-award-node]");
    if (award) {
      award.addEventListener("click", () => {
        const progress = addProgress(40, 10);
        award.textContent = `XP Claimed · Level ${progress.level}`;
        award.disabled = true;
      });
    }

    const form = document.querySelector("[data-ai-command-form]");
    if (!form) return;
    const feedback = document.querySelector("[data-ai-command-feedback]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = new FormData(form).get("command").toString().toLowerCase();
      const strong = ["repair", "drone", "signal"].filter((word) => value.includes(word)).length;
      if (strong >= 2) {
        addProgress(60, 20);
        feedback.textContent = "Command accepted. Milo stabilized the moon signal. +60 XP";
        feedback.className = "ai-feedback success";
        return;
      }
      if (value.length > 8) {
        feedback.textContent = "Partial command detected. Hint: include action + target, like Repair the drone signal.";
        feedback.className = "ai-feedback partial";
        return;
      }
      feedback.textContent = "Teaching mode: write a simple English command with a verb and a mission object.";
      feedback.className = "ai-feedback warning";
    });
  }

  function addBossMessage(role, text) {
    const chat = document.querySelector("[data-boss-chat]");
    if (!chat) return;
    const message = document.createElement("div");
    message.className = `boss-message ${role}`;
    message.innerHTML = `<span>${role === "boss" ? "PIX AI" : "Player"}</span><p>${text}</p>`;
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
  }

  function initBoss() {
    const form = document.querySelector("[data-boss-form]");
    if (!form) return;
    const epId = document.body.dataset.bossEp || "EP01";
    const config = data.bossConfigs?.[epId];
    if (!config) return;
    let hp = config.hp;
    const hpBar = document.querySelector("[data-boss-hp-bar]");
    const hpText = document.querySelector("[data-boss-hp]");
    const status = document.querySelector("[data-boss-status]");

    function setHp(nextHp) {
      hp = Math.max(0, nextHp);
      hpBar.style.width = `${hp}%`;
      hpText.textContent = hp;
      if (hp <= 0) {
        status.textContent = "SYSTEM REPAIRED";
        addBossMessage("boss", "STABILITY RESTORED. Moon Signal Badge unlocked. +200 XP");
        const progress = loadProgress();
        if (!progress.completed.includes(epId)) progress.completed.push(epId);
        progress.xp += 200;
        progress.energy += 80;
        progress.level = Math.floor(progress.xp / 500) + 1;
        saveProgress(progress);
      }
    }

    setHp(hp);
    addBossMessage("boss", config.opening);
    addBossMessage("boss", "Use English to repair me. Command format: action + target.");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (hp <= 0) return;
      const input = form.elements.message;
      const text = input.value.trim();
      if (!text) return;
      addBossMessage("player", text);
      const lower = text.toLowerCase();
      const hits = config.correct_keywords.filter((keyword) => lower.includes(keyword)).length;
      if (hits >= 2) {
        addBossMessage("boss", "CORRECT COMMAND DETECTED. Stability rising.");
        setHp(hp - 30);
      } else if (hits === 1 || text.length > 10) {
        addBossMessage("boss", config.hints[Math.min(1, config.hints.length - 1)]);
        setHp(hp - 10);
      } else {
        addBossMessage("boss", config.teaching_mode);
      }
      input.value = "";
    });
  }

  renderPlayerHud();
  renderWorldMap();
  renderEpNodes();
  bindEpInteractions();
  initBoss();
})();
