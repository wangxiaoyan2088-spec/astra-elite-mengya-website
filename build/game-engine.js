(function () {
  const data = window.ASTRA_GAME_DATA || {};
  const engineStorageKey = "astraEliteGameEngineState";
  const legacyProgressKey = "astraEliteGameProgress";

  const nodeOrder = ["story", "run", "quiz", "ai_challenge", "boss", "reward"];
  const nodeLabels = {
    story: "Story",
    run: "Run & Jump",
    quiz: "Quiz Gate",
    ai_challenge: "AI Challenge",
    boss: "Boss Battle",
    reward: "Reward"
  };
  const scoreByNode = {
    story: "grammar",
    run: "logic",
    quiz: "grammar",
    ai_challenge: "ai_understanding",
    boss: "ai_understanding",
    reward: "logic"
  };
  const mapPositions = [
    { left: "18%", top: "45%" },
    { left: "42%", top: "39%" },
    { left: "67%", top: "43%" },
    { left: "18%", top: "74%" },
    { left: "43%", top: "72%" },
    { left: "69%", top: "74%" }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParse(value) {
    try {
      return JSON.parse(value || "{}");
    } catch {
      return {};
    }
  }

  function relativeFromGameRoot(entry) {
    return entry.replace(/^game\//, "");
  }

  function rewardValue(ep) {
    return ep.xp || ep.xp_reward || 0;
  }

  function normalizeBossId(boss) {
    return String(boss || "AI_CORE")
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/gi, "")
      .toUpperCase();
  }

  function baseEpState(ep, index) {
    const status = ep.status || "locked";
    const unlocked = status !== "locked";
    return {
      id: ep.id,
      status,
      progress: typeof ep.progress === "number" ? ep.progress : 0,
      boss: normalizeBossId(ep.boss),
      completed_nodes: Array.isArray(ep.completed_nodes) ? ep.completed_nodes : [],
      failed_nodes: Array.isArray(ep.failed_nodes) ? ep.failed_nodes : [],
      current_node: ep.current_node || (unlocked ? "story" : "locked"),
      boss_state: ep.boss_state || (unlocked ? "waiting" : "offline"),
      last_feedback: null,
      index
    };
  }

  function defaultTrace() {
    const player = data.player || {};
    return {
      user_id: "milo_001",
      xp: player.xp || 1200,
      energy: player.energy || 80,
      level: player.level || 3,
      streak: player.streak || 1,
      completed_ep: [],
      failed_nodes: [],
      behavior_log: [],
      learning_score: {
        grammar: 70,
        logic: 80,
        ai_understanding: 60
      }
    };
  }

  function createInitialEngineState() {
    const eps = (data.epWorlds || []).map(baseEpState);
    return {
      version: 2,
      currentEp: eps.find((ep) => ep.status !== "locked")?.id || eps[0]?.id || "EP01",
      miloPosition: 0,
      lastEvent: null,
      eps,
      trace: defaultTrace()
    };
  }

  function mergeEngineState(saved) {
    const initial = createInitialEngineState();
    const savedEps = Array.isArray(saved.eps) ? saved.eps : [];
    const savedTrace = saved.trace || {};
    initial.eps = initial.eps.map((ep) => {
      const match = savedEps.find((savedEp) => savedEp.id === ep.id);
      return match ? { ...ep, ...match, index: ep.index } : ep;
    });
    initial.trace = {
      ...initial.trace,
      ...savedTrace,
      learning_score: {
        ...initial.trace.learning_score,
        ...(savedTrace.learning_score || {})
      },
      completed_ep: Array.isArray(savedTrace.completed_ep) ? savedTrace.completed_ep : initial.trace.completed_ep,
      failed_nodes: Array.isArray(savedTrace.failed_nodes) ? savedTrace.failed_nodes : initial.trace.failed_nodes,
      behavior_log: Array.isArray(savedTrace.behavior_log) ? savedTrace.behavior_log : initial.trace.behavior_log
    };
    initial.currentEp = saved.currentEp || initial.currentEp;
    initial.miloPosition = typeof saved.miloPosition === "number" ? saved.miloPosition : initial.miloPosition;
    initial.lastEvent = saved.lastEvent || initial.lastEvent;
    return initial;
  }

  function loadEngineState() {
    const saved = safeParse(localStorage.getItem(engineStorageKey));
    const engine = mergeEngineState(saved);

    const legacy = safeParse(localStorage.getItem(legacyProgressKey));
    if (Array.isArray(legacy.completed) && legacy.completed.length) {
      legacy.completed.forEach((epId) => {
        const ep = getEpState(engine, epId);
        if (ep) {
          ep.status = "completed";
          ep.progress = 100;
          ep.current_node = "reward";
          ep.completed_nodes = [...new Set([...ep.completed_nodes, ...nodeOrder])];
        }
      });
      engine.trace.xp = Math.max(engine.trace.xp, legacy.xp || 0);
      engine.trace.energy = Math.max(engine.trace.energy, legacy.energy || 0);
    }

    return engine;
  }

  function saveEngineState(engine) {
    engine.trace.level = Math.max(1, Math.floor(engine.trace.xp / 500) + 1);
    localStorage.setItem(engineStorageKey, JSON.stringify(engine));
    localStorage.setItem(legacyProgressKey, JSON.stringify({
      completed: engine.trace.completed_ep,
      xp: engine.trace.xp,
      energy: engine.trace.energy,
      level: engine.trace.level,
      streak: engine.trace.streak
    }));
  }

  function getEpState(engine, epId) {
    return engine.eps.find((ep) => ep.id === epId);
  }

  function getEpData(epId) {
    return (data.epWorlds || []).find((ep) => ep.id === epId);
  }

  function currentNodeIndex(ep) {
    return Math.max(0, nodeOrder.indexOf(ep.current_node));
  }

  function setMapFeedback(engine, type, epId, nodeId) {
    engine.lastEvent = {
      type,
      epId,
      nodeId,
      time: Date.now()
    };
  }

  function pushBehavior(engine, event) {
    engine.trace.behavior_log.unshift({
      ...event,
      time: new Date().toISOString()
    });
    engine.trace.behavior_log = engine.trace.behavior_log.slice(0, 16);
  }

  function adjustScore(engine, key, delta) {
    const scores = engine.trace.learning_score;
    scores[key] = Math.max(0, Math.min(100, (scores[key] || 0) + delta));
  }

  function awardTrace(engine, ep, nodeId, correct) {
    const ability = scoreByNode[nodeId] || "logic";
    const xp = correct ? 45 : 8;
    const energy = correct ? 8 : -4;
    engine.trace.xp += xp;
    engine.trace.energy = Math.max(0, engine.trace.energy + energy);
    adjustScore(engine, ability, correct ? 3 : -2);
    pushBehavior(engine, {
      type: correct ? "node_success" : "node_failed",
      epId: ep.id,
      nodeId,
      answer: correct ? "correct" : "wrong",
      xp,
      energy
    });
  }

  function unlockNextEp(engine, epId) {
    const index = engine.eps.findIndex((ep) => ep.id === epId);
    const next = engine.eps[index + 1];
    if (!next || next.status !== "locked") return null;
    next.status = "unlocked";
    next.current_node = "story";
    next.progress = Math.max(next.progress, 0);
    next.boss_state = "waiting";
    next.last_feedback = "unlocked";
    return next;
  }

  function advanceNode(epId) {
    const engine = loadEngineState();
    const ep = getEpState(engine, epId);
    if (!ep || ep.status === "locked") {
      setMapFeedback(engine, "locked", epId, "locked");
      saveEngineState(engine);
      return engine;
    }

    const nodeId = ep.current_node === "locked" ? "story" : ep.current_node;
    const index = currentNodeIndex(ep);
    ep.completed_nodes = [...new Set([...ep.completed_nodes, nodeId])];
    ep.current_node = nodeOrder[Math.min(index + 1, nodeOrder.length - 1)];
    ep.progress = Math.max(ep.progress, Math.round(((index + 1) / nodeOrder.length) * 100));
    ep.last_feedback = "advanced";
    engine.currentEp = ep.id;
    engine.miloPosition = ep.index;
    awardTrace(engine, ep, nodeId, true);
    setMapFeedback(engine, "advance", ep.id, nodeId);
    saveEngineState(engine);
    return engine;
  }

  function answerQuiz(epId, correct) {
    const engine = loadEngineState();
    const ep = getEpState(engine, epId);
    if (!ep || ep.status === "locked") {
      setMapFeedback(engine, "locked", epId, "locked");
      saveEngineState(engine);
      return engine;
    }

    const failedId = `${ep.id}_quiz_gate`;
    engine.currentEp = ep.id;
    engine.miloPosition = ep.index;

    if (correct) {
      ep.completed_nodes = [...new Set([...ep.completed_nodes, "quiz"])];
      ep.failed_nodes = ep.failed_nodes.filter((node) => node !== failedId);
      ep.current_node = nodeOrder[Math.max(currentNodeIndex(ep), nodeOrder.indexOf("ai_challenge"))];
      ep.progress = Math.max(ep.progress, 60);
      ep.last_feedback = "correct";
      awardTrace(engine, ep, "quiz", true);
      setMapFeedback(engine, "correct", ep.id, "quiz");
    } else {
      ep.failed_nodes = [...new Set([...ep.failed_nodes, failedId])];
      engine.trace.failed_nodes = [...new Set([...engine.trace.failed_nodes, failedId])];
      ep.progress = Math.max(0, ep.progress - 8);
      ep.last_feedback = "wrong";
      awardTrace(engine, ep, "quiz", false);
      setMapFeedback(engine, "wrong", ep.id, "quiz");
    }

    saveEngineState(engine);
    return engine;
  }

  function completeBoss(epId) {
    const engine = loadEngineState();
    const ep = getEpState(engine, epId);
    if (!ep || ep.status === "locked") return engine;

    const epData = getEpData(epId) || {};
    ep.status = "completed";
    ep.progress = 100;
    ep.current_node = "reward";
    ep.boss_state = "repaired";
    ep.completed_nodes = [...new Set([...ep.completed_nodes, ...nodeOrder])];
    ep.failed_nodes = [];
    ep.last_feedback = "boss-cleared";
    engine.currentEp = ep.id;
    engine.miloPosition = ep.index;
    engine.trace.completed_ep = [...new Set([...engine.trace.completed_ep, ep.id])];
    engine.trace.xp += rewardValue(epData);
    engine.trace.energy += epData.energy_reward || 50;
    adjustScore(engine, "ai_understanding", 6);
    pushBehavior(engine, {
      type: "boss_win",
      epId: ep.id,
      nodeId: "boss",
      xp: rewardValue(epData),
      energy: epData.energy_reward || 50
    });
    const unlocked = unlockNextEp(engine, ep.id);
    setMapFeedback(engine, "boss_win", ep.id, unlocked?.id || "reward");
    saveEngineState(engine);
    return engine;
  }

  function selectEp(epId) {
    const engine = loadEngineState();
    const ep = getEpState(engine, epId);
    if (!ep || ep.status === "locked") {
      setMapFeedback(engine, "locked", epId, "locked");
    } else {
      engine.currentEp = ep.id;
      engine.miloPosition = ep.index;
      setMapFeedback(engine, "select", ep.id, ep.current_node);
    }
    saveEngineState(engine);
    return engine;
  }

  function addProgress(xp, energy) {
    const engine = loadEngineState();
    engine.trace.xp += xp;
    engine.trace.energy += energy;
    saveEngineState(engine);
    renderAll();
    return engine.trace;
  }

  function progressPercent(engine) {
    if (!engine.eps.length) return 0;
    const active = engine.eps.find((ep) => ep.id === engine.currentEp) || engine.eps[0];
    return Math.min(100, Math.max(6, ((active.index + active.progress / 100) / Math.max(1, engine.eps.length - 1)) * 100));
  }

  function renderNodePips(epState) {
    return `
      <div class="node-pips" aria-label="EP node state">
        ${nodeOrder.map((node) => {
          const done = epState.completed_nodes.includes(node);
          const current = epState.current_node === node;
          const failed = epState.failed_nodes.some((failedNode) => failedNode.includes(node));
          return `<i class="${done ? "done" : ""} ${current ? "current" : ""} ${failed ? "failed" : ""}" title="${nodeLabels[node]}"></i>`;
        }).join("")}
      </div>
    `;
  }

  function renderLevelPreview(epData, epState) {
    const panel = document.querySelector("[data-level-preview]");
    if (!panel || !epData || !epState) return;
    const locked = epState.status === "locked";
    const failed = epState.failed_nodes.length > 0;
    panel.innerHTML = `
      <p class="game-system-label">Level Preview</p>
      <h2>${epData.id} ${epData.title}</h2>
      <img src="${epData.image || "../assets/scenery/mooncity_signal.jpg"}" alt="${epData.title} level preview">
      <p>${epData.lesson_title || epData.theme}：地图会根据学习状态实时变化。当前节点：<strong>${nodeLabels[epState.current_node] || "Locked"}</strong></p>
      <div class="preview-progress">
        <span>Progress ${epState.progress}%</span>
        <i style="width:${epState.progress}%"></i>
      </div>
      ${renderNodePips(epState)}
      <div class="preview-boss-row ${epState.boss_state === "repaired" ? "repaired" : failed ? "warning" : ""}">
        <span class="boss-face">🤖</span>
        <strong>Boss: ${epData.boss}</strong>
        <em>${epState.boss_state === "repaired" ? "REPAIRED" : failed ? "INSTABILITY HIGH" : "WAITING"}</em>
      </div>
      <div class="preview-rewards">
        <span>💜 XP ${rewardValue(epData)}</span>
        <span>⚡ Energy +${epData.energy_reward || 50}</span>
      </div>
      <div class="level-preview-actions">
        <button class="state-button primary" type="button" data-state-action="advance" ${locked ? "disabled" : ""}>推进节点</button>
        <button class="state-button success" type="button" data-state-action="correct" ${locked ? "disabled" : ""}>答对</button>
        <button class="state-button danger" type="button" data-state-action="wrong" ${locked ? "disabled" : ""}>答错</button>
        <button class="state-button boss" type="button" data-state-action="boss-win" ${locked ? "disabled" : ""}>Boss Win</button>
      </div>
      <button class="ai-game-button primary" type="button" data-enter-selected ${locked ? "disabled" : ""}>${locked ? "Locked" : "Enter Level"}</button>
    `;

    const enter = panel.querySelector("[data-enter-selected]");
    if (enter && !locked) {
      enter.addEventListener("click", () => {
        window.location.href = relativeFromGameRoot(epData.entry);
      });
    }
  }

  function renderPlayerHud() {
    const hud = document.querySelector("[data-player-hud]");
    if (!hud) return;
    const engine = loadEngineState();
    const skills = data.player?.skills || ["Hint"];
    hud.innerHTML = `
      <div class="hud-avatar">M</div>
      <div>
        <span>Player</span>
        <strong>${data.player?.name || "Milo"}</strong>
      </div>
      <div>
        <span>Level</span>
        <strong>${engine.trace.level}</strong>
      </div>
      <div>
        <span>XP</span>
        <strong>${engine.trace.xp}</strong>
      </div>
      <div>
        <span>AI Energy</span>
        <strong>${engine.trace.energy}</strong>
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
    const engine = loadEngineState();
    const worlds = data.epWorlds || [];
    const currentData = getEpData(engine.currentEp) || worlds[0];
    const currentState = getEpState(engine, currentData?.id);
    const runnerPosition = mapPositions[engine.miloPosition] || mapPositions[0];
    const last = engine.lastEvent || {};

    const path = document.querySelector(".world-path");
    if (path) {
      path.classList.toggle("broken", last.type === "wrong");
      path.classList.toggle("connected", last.type !== "wrong");
      path.style.setProperty("--path-progress", `${progressPercent(engine)}%`);
    }

    renderLevelPreview(currentData, currentState);
    map.innerHTML = `
      <div class="milo-map-runner" style="left:${runnerPosition.left}; top:${runnerPosition.top}" aria-label="Milo current position">
        <span>🐳</span>
      </div>
      ${worlds.map((ep, index) => {
        const epState = getEpState(engine, ep.id) || baseEpState(ep, index);
        const locked = epState.status === "locked";
        const completed = epState.status === "completed";
        const active = engine.currentEp === ep.id;
        const failed = epState.failed_nodes.length > 0 || (last.type === "wrong" && last.epId === ep.id);
        const bossAlert = epState.current_node === "boss" && epState.boss_state !== "repaired";
        const justUnlocked = epState.last_feedback === "unlocked" || (last.type === "boss_win" && last.nodeId === ep.id);
        return `
          <article class="ep-world-node ${epState.status} ${active ? "current" : ""} ${failed ? "failed" : ""} ${bossAlert ? "boss-alert" : ""} ${justUnlocked ? "just-unlocked" : ""}" style="--node-index:${index}">
            <button type="button" data-ep-id="${ep.id}" aria-disabled="${locked}" aria-label="${ep.id} ${ep.title}" title="+${rewardValue(ep)} XP · Boss: ${ep.boss}">
              <span class="ep-planet">${locked ? "🔒" : completed ? "⭐" : failed ? "⚠️" : "🌍"}</span>
              <span class="ep-id">${ep.id}</span>
              <strong>${ep.title}</strong>
              <small>${completed ? "⭐⭐⭐" : locked ? "☆☆☆" : "⭐⭐⭐"}</small>
              <div class="node-progress-shell"><i style="width:${epState.progress}%"></i></div>
              ${renderNodePips(epState)}
              <b class="node-current">${nodeLabels[epState.current_node] || "Locked"}</b>
              <em>${locked ? "Locked" : completed ? "Completed" : "Open"}</em>
              <span class="ep-hover-tip">+${rewardValue(ep)} XP · Boss: ${ep.boss}</span>
            </button>
            <div class="floating-island" aria-hidden="true"><i></i></div>
          </article>
        `;
      }).join("")}
    `;

    map.querySelectorAll("[data-ep-id]").forEach((button) => {
      button.addEventListener("mouseenter", () => {
        const epData = getEpData(button.dataset.epId);
        renderLevelPreview(epData, getEpState(loadEngineState(), button.dataset.epId));
      });
      button.addEventListener("focus", () => {
        const epData = getEpData(button.dataset.epId);
        renderLevelPreview(epData, getEpState(loadEngineState(), button.dataset.epId));
      });
      button.addEventListener("click", () => {
        const epId = button.dataset.epId;
        const engine = loadEngineState();
        const ep = getEpState(engine, epId);
        if (ep?.status === "locked") {
          selectEp(epId);
          const node = button.closest(".ep-world-node");
          node?.classList.add("lock-shake");
          setTimeout(() => node?.classList.remove("lock-shake"), 520);
          renderAll();
          return;
        }
        advanceNode(epId);
        renderAll();
      });
    });
  }

  function renderLearningPanels() {
    const engine = loadEngineState();
    const growth = document.querySelector("[data-milo-growth]");
    if (growth) {
      const score = engine.trace.learning_score;
      growth.innerHTML = `
        <div>
          <p class="game-system-label">角色成长系统</p>
          <h2>Milo</h2>
        </div>
        <div class="milo-growth-body">
          <div class="milo-avatar-large">🐳</div>
          <div class="milo-stat-grid">
            <strong>Level ${engine.trace.level}</strong>
            <span>HP ${100 + engine.trace.level * 4}</span>
            <span>Speed ${110 + engine.trace.streak * 3}</span>
            <span>AI Power ${score.ai_understanding}</span>
          </div>
        </div>
        <div class="skill-slots">
          <span>💎<small>Hint</small></span>
          <span>🧊<small>Time Freeze</small></span>
          <span>🔥<small>AI Vision</small></span>
          <span class="${engine.trace.level >= 5 ? "" : "locked"}">🔒<small>Lv.5 Unlock</small></span>
        </div>
      `;
    }

    const daily = document.querySelector("[data-daily-panel]");
    if (daily) {
      daily.innerHTML = `
        <span>Daily System</span>
        <h3>Daily Quest</h3>
        <p>完成 1 个关卡 ${engine.trace.completed_ep.length > 0 ? "1/1" : "0/1"}</p>
        <p>Streak: <strong>${engine.trace.streak + 2} Days</strong></p>
        <em>奖励：50 Energy</em>
      `;
    }

    const achievements = document.querySelector("[data-achievement-panel]");
    if (achievements) {
      achievements.innerHTML = `
        <span>Achievements</span>
        <h3>成就系统</h3>
        <p>🏅 AI Explorer ${engine.trace.completed_ep.length ? "✓" : ""}</p>
        <p>🧠 Logic Master ${engine.trace.learning_score.logic >= 85 ? "✓" : ""}</p>
        <p>⚔️ Boss Killer ${engine.trace.completed_ep.length ? "✓" : ""}</p>
      `;
    }

    const report = document.querySelector("[data-learning-report]");
    if (report) {
      const scores = engine.trace.learning_score;
      report.innerHTML = `
        <span>For Parents</span>
        <h3>学习报告</h3>
        <div class="trace-score-grid">
          <label>English <i style="width:${scores.grammar}%"></i></label>
          <label>Logic <i style="width:${scores.logic}%"></i></label>
          <label>AI Cmd <i style="width:${scores.ai_understanding}%"></i></label>
        </div>
        <strong>${engine.trace.behavior_log.length} actions · ${Math.round((scores.grammar + scores.logic + scores.ai_understanding) / 3)}%</strong>
      `;
    }

    document.querySelectorAll(".flow-card").forEach((card) => {
      const current = (loadEngineState().eps.find((ep) => ep.id === loadEngineState().currentEp) || {}).current_node;
      card.classList.toggle("active", card.classList.contains(current === "ai_challenge" ? "boss" : current));
      card.classList.toggle("done", current && nodeOrder.indexOf(current) > nodeOrder.findIndex((node) => card.classList.contains(node)));
    });
  }

  function bindStateActions() {
    document.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-state-action]");
      if (!actionButton) return;
      const engine = loadEngineState();
      const epId = engine.currentEp;
      if (actionButton.dataset.stateAction === "advance") advanceNode(epId);
      if (actionButton.dataset.stateAction === "correct") answerQuiz(epId, true);
      if (actionButton.dataset.stateAction === "wrong") answerQuiz(epId, false);
      if (actionButton.dataset.stateAction === "boss-win") completeBoss(epId);
      renderAll();
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
    const engine = loadEngineState();
    const epState = getEpState(engine, epId);
    track.innerHTML = nodes
      .map((node, index) => `
        <article class="ep-stage-node ${node.type} ${epState?.completed_nodes.includes(node.type) || epState?.completed_nodes.includes(node.id) ? "done" : ""} ${epState?.current_node === node.type || epState?.current_node === node.id ? "active" : ""}">
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
        const trace = addProgress(40, 10);
        award.textContent = `XP Claimed · Level ${trace.level}`;
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
        answerQuiz(document.body.dataset.epId || "EP01", true);
        feedback.textContent = "Command accepted. Milo stabilized the moon signal. +60 XP";
        feedback.className = "ai-feedback success";
        return;
      }
      if (value.length > 8) {
        feedback.textContent = "Partial command detected. Hint: include action + target, like Repair the drone signal.";
        feedback.className = "ai-feedback partial";
        return;
      }
      answerQuiz(document.body.dataset.epId || "EP01", false);
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
        completeBoss(epId);
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

  function renderAll() {
    renderPlayerHud();
    renderWorldMap();
    renderLearningPanels();
    renderEpNodes();
  }

  window.AstraEliteGameEngine = {
    loadEngineState,
    saveEngineState,
    advanceNode,
    answerQuiz,
    completeBoss,
    selectEp
  };

  renderAll();
  bindStateActions();
  bindEpInteractions();
  initBoss();
})();
