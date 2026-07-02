window.ASTRA_GAME_DATA = {
  player: {
    name: "Milo",
    level: 3,
    xp: 1200,
    energy: 80,
    streak: 1,
    skills: ["Hint", "AI Vision"]
  },
  epWorlds: [
    {
      id: "EP01",
      slug: "ep01",
      title: "The Moon Signal",
      world_title: "Drone City",
      status: "unlocked",
      xp_reward: 200,
      energy_reward: 80,
      boss: "PIX AI",
      theme: "Moon Base Signal",
      entry: "game/ep01/index.html"
    },
    {
      id: "EP02",
      slug: "ep02",
      title: "The Lost Drone Signal",
      world_title: "Signal Route",
      status: "unlocked",
      xp_reward: 240,
      energy_reward: 90,
      boss: "Watcher Drone",
      theme: "Drone Navigation",
      entry: "game/ep02/index.html"
    },
    {
      id: "EP03",
      slug: "ep03",
      title: "The Magic 3D Printer",
      world_title: "Maker Valley",
      status: "locked",
      xp_reward: 260,
      energy_reward: 100,
      boss: "Printer Core",
      theme: "3D Printing",
      entry: "game/ep03/index.html"
    },
    {
      id: "EP04",
      slug: "ep04",
      title: "The Mind Link System",
      world_title: "Memory Bridge",
      status: "locked",
      xp_reward: 280,
      energy_reward: 110,
      boss: "Mind Link AI",
      theme: "Human-AI Thinking",
      entry: "game/ep04/index.html"
    },
    {
      id: "EP05",
      slug: "ep05",
      title: "The AI Robot Pet",
      world_title: "Robot Garden",
      status: "locked",
      xp_reward: 300,
      energy_reward: 120,
      boss: "Pet Emotion Core",
      theme: "Robotics and Emotion",
      entry: "game/ep05/index.html"
    },
    {
      id: "EP06",
      slug: "ep06",
      title: "The Hologram Classroom",
      world_title: "Hologram School",
      status: "locked",
      xp_reward: 320,
      energy_reward: 130,
      boss: "Holo Teacher",
      theme: "Spatial Learning",
      entry: "game/ep06/index.html"
    }
  ],
  epNodes: {
    EP01: [
      { id: "start", type: "story", label: "Start", title: "Moon Classroom Awakens", description: "Leta presses the red button. Milo wakes up inside the blue hologram.", xp: 20 },
      { id: "stage1", type: "learning", label: "Stage 1", title: "Signal Words", description: "Match mission words: drone, signal, propeller, oxygen, console.", xp: 40 },
      { id: "stage2", type: "learning", label: "Stage 2", title: "Repair Order", description: "Choose the correct order to repair the drone signal path.", xp: 50 },
      { id: "ai_challenge", type: "ai_challenge", label: "AI Challenge", title: "Give Milo an English Command", description: "Type a clear English instruction to stabilize the moon signal.", xp: 60 },
      { id: "boss", type: "boss", label: "Boss", title: "PIX AI Core", description: "Use language to repair the unstable AI system.", xp: 100 },
      { id: "reward", type: "reward", label: "Reward", title: "Moon Signal Badge", description: "Collect XP, AI Energy, and unlock the next mission route.", xp: 200 }
    ],
    EP02: [
      { id: "start", type: "story", label: "Start", title: "Lost Signal Route", description: "A silver drone disappears behind the moon city towers.", xp: 20 },
      { id: "stage1", type: "learning", label: "Stage 1", title: "Route Vocabulary", description: "Learn route, antenna, launch, mission, map, and drone.", xp: 40 },
      { id: "stage2", type: "learning", label: "Stage 2", title: "Path Logic", description: "Choose the safest path around the warning zone.", xp: 50 },
      { id: "ai_challenge", type: "ai_challenge", label: "AI Challenge", title: "Command the Drone", description: "Write an English command to guide the drone home.", xp: 60 },
      { id: "boss", type: "boss", label: "Boss", title: "Watcher Drone", description: "Calm the warning system with precise English.", xp: 100 },
      { id: "reward", type: "reward", label: "Reward", title: "Signal Route Badge", description: "Earn XP and open the next route.", xp: 240 }
    ]
  },
  bossConfigs: {
    EP01: {
      boss_id: "pix_ai",
      name: "PIX AI CORE",
      status: "INSTABILITY HIGH",
      opening: "SYSTEM ERROR: DRONE PATH LOST",
      hp: 100,
      correct_keywords: ["drone", "signal", "repair", "oxygen", "propeller", "route", "stable", "console"],
      hints: [
        "Use a clear English command.",
        "Mention the drone or signal.",
        "Try: Repair the drone signal route."
      ],
      teaching_mode: "PIX needs a simple command with an action and a target."
    }
  }
};
