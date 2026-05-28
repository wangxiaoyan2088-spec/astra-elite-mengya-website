const intro = document.querySelector("[data-intro]");
const gameplay = document.querySelector("[data-gameplay]");
const startGameButton = document.querySelector("[data-start-game]");
const stepButtons = document.querySelectorAll("[data-step-button]");
const missionScenes = document.querySelectorAll("[data-step]");
const completeButtons = document.querySelectorAll("[data-complete-step]");

const state = {
  unlocked: new Set(["story"]),
  completed: new Set(),
  currentStep: "story"
};

const nextStep = {
  story: "vocab",
  vocab: "stem",
  stem: "speaking",
  speaking: "creative",
  creative: "reward",
  reward: "success"
};

function showStep(step) {
  if (step !== "success" && !state.unlocked.has(step)) return;
  state.currentStep = step;
  missionScenes.forEach((scene) => scene.classList.toggle("active", scene.dataset.step === step));
  stepButtons.forEach((button) => button.classList.toggle("active", button.dataset.stepButton === step));
}

function unlockStep(step) {
  if (!step) return;
  state.unlocked.add(step);
  stepButtons.forEach((button) => {
    if (button.dataset.stepButton === step) button.classList.remove("locked");
  });
}

function completeStep(step) {
  state.completed.add(step);
  const target = nextStep[step];
  if (target === "success") {
    showStep("success");
    return;
  }
  unlockStep(target);
  showStep(target);
}

startGameButton.addEventListener("click", () => {
  intro.hidden = true;
  gameplay.hidden = false;
  showStep("story");
});

stepButtons.forEach((button) => {
  button.addEventListener("click", () => showStep(button.dataset.stepButton));
});

completeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled) return;
    completeStep(button.dataset.completeStep);
  });
});

const dialogue = [
  ["Milo receives a signal.", "Listen. A drone signal is waking up inside Astra Academy."],
  ["Leta notices the drone console.", "This console is glowing. Maybe the drone is trying to come home."],
  ["The signal becomes unstable.", "The antenna is weak. We need to rebuild the connection."],
  ["The mission begins.", "Future Explorer, help us recover The Lost Drone Signal."]
];

let dialogueIndex = 0;
const dialogueSpeaker = document.querySelector("[data-dialogue-speaker]");
const dialogueText = document.querySelector("[data-dialogue-text]");
const dialogueProgress = document.querySelector("[data-dialogue-progress]");
const nextDialogue = document.querySelector("[data-next-dialogue]");
const storyComplete = document.querySelector("[data-complete-step='story']");

nextDialogue.addEventListener("click", () => {
  dialogueIndex += 1;
  if (dialogueIndex < dialogue.length) {
    dialogueSpeaker.textContent = dialogue[dialogueIndex][0];
    dialogueText.textContent = dialogue[dialogueIndex][1];
    dialogueProgress.textContent = `${dialogueIndex + 1}/${dialogue.length}`;
  }
  if (dialogueIndex === dialogue.length - 1) {
    nextDialogue.classList.add("hidden");
    storyComplete.classList.remove("hidden");
  }
});

let selectedWord = null;
let vocabMatches = 0;
const wordCards = document.querySelectorAll("[data-word]");
const imageCards = document.querySelectorAll("[data-image-match]");
const vocabFeedback = document.querySelector("[data-vocab-feedback]");
const vocabProgress = document.querySelector("[data-vocab-progress]");
const vocabComplete = document.querySelector("[data-complete-step='vocab']");

function clearWrongCards() {
  wordCards.forEach((card) => card.classList.remove("wrong"));
  imageCards.forEach((card) => card.classList.remove("wrong"));
}

wordCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (card.classList.contains("matched")) return;
    clearWrongCards();
    wordCards.forEach((item) => item.classList.remove("selected"));
    selectedWord = card.dataset.word;
    card.classList.add("selected");
  });
});

imageCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!selectedWord || card.classList.contains("matched")) return;
    const wordCard = document.querySelector(`[data-word="${selectedWord}"]`);
    if (card.dataset.imageMatch === selectedWord) {
      card.classList.add("matched");
      wordCard.classList.add("matched");
      wordCard.classList.remove("selected");
      vocabMatches += 1;
      vocabProgress.textContent = `${vocabMatches}/6`;
      vocabFeedback.textContent = "Great job. The signal scanner is getting stronger.";
      selectedWord = null;
      if (vocabMatches === 6) {
        vocabFeedback.textContent = "Mission Complete. All vocabulary signals are connected.";
        vocabComplete.disabled = false;
      }
      return;
    }
    card.classList.add("wrong");
    wordCard.classList.add("wrong");
    vocabFeedback.textContent = "Try again. Milo says the image does not match this word yet.";
    setTimeout(clearWrongCards, 520);
  });
});

const sequence = ["core", "antenna", "console", "drone"];
let sequenceIndex = 0;
const sequenceButtons = document.querySelectorAll("[data-sequence]");
const stemFeedback = document.querySelector("[data-stem-feedback]");
const launchButton = document.querySelector("[data-launch]");
const stemComplete = document.querySelector("[data-complete-step='stem']");

sequenceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const expected = sequence[sequenceIndex];
    if (button.dataset.sequence === expected) {
      button.classList.add("activated");
      document.querySelector(`[data-object-label="${expected}"]`).classList.add("activated");
      sequenceIndex += 1;
      stemFeedback.textContent =
        sequenceIndex < sequence.length
          ? `Great. Now click ${sequence[sequenceIndex]}.`
          : "All systems connected. Press Launch Signal.";
      if (sequenceIndex === sequence.length) launchButton.disabled = false;
      return;
    }
    button.classList.add("wrong");
    stemFeedback.textContent = `Gentle hint from Milo: click ${expected} first.`;
    setTimeout(() => button.classList.remove("wrong"), 520);
  });
});

launchButton.addEventListener("click", () => {
  launchButton.classList.add("launched");
  launchButton.textContent = "Signal Launched";
  stemFeedback.textContent = "Final drone lights are on. Speaking Mission unlocked.";
  stemComplete.disabled = false;
});

const sentences = [
  "We found the drone signal.",
  "The moon base is safe.",
  "The drone is ready for launch.",
  "Let’s send the signal back.",
  "Mission complete."
];
let sentenceIndex = 0;
let totalScore = 0;
const sentenceCount = document.querySelector("[data-sentence-count]");
const sentenceText = document.querySelector("[data-sentence-text]");
const sentenceScore = document.querySelector("[data-sentence-score]");
const totalScoreEl = document.querySelector("[data-total-score]");
const speakingFeedback = document.querySelector("[data-speaking-feedback]");
const playAudio = document.querySelector("[data-play-audio]");
const recordSentence = document.querySelector("[data-record-sentence]");
const speakingComplete = document.querySelector("[data-complete-step='speaking']");

playAudio.addEventListener("click", () => {
  speakingFeedback.textContent = `Audio guide: ${sentences[sentenceIndex]}`;
});

recordSentence.addEventListener("click", () => {
  totalScore += 20;
  sentenceScore.textContent = "Score: 20/20";
  totalScoreEl.textContent = `Total: ${totalScore}/100`;
  speakingFeedback.textContent = "Clear voice detected. Mission sentence accepted.";
  recordSentence.classList.add("recording");
  setTimeout(() => recordSentence.classList.remove("recording"), 700);

  if (sentenceIndex < sentences.length - 1) {
    sentenceIndex += 1;
    setTimeout(() => {
      sentenceCount.textContent = `Sentence ${sentenceIndex + 1}/5`;
      sentenceText.textContent = `“${sentences[sentenceIndex]}”`;
      sentenceScore.textContent = "Score: 0/20";
    }, 450);
  } else {
    speakingFeedback.textContent = "Speaking Mission Passed. Total score: 100/100.";
    recordSentence.disabled = true;
    speakingComplete.disabled = false;
  }
});

const parts = document.querySelectorAll("[data-part]");
const buildZone = document.querySelector("[data-build-zone]");
const buildProgress = document.querySelector("[data-build-progress]");
const buildFeedback = document.querySelector("[data-build-feedback]");
const creativeComplete = document.querySelector("[data-complete-step='creative']");
const placedParts = new Set();
let draggedPart = null;

parts.forEach((part) => {
  part.addEventListener("dragstart", () => {
    draggedPart = part.dataset.part;
  });
  part.addEventListener("click", () => placePart(part.dataset.part, part));
});

buildZone.addEventListener("dragover", (event) => event.preventDefault());
buildZone.addEventListener("drop", () => {
  if (!draggedPart) return;
  const part = document.querySelector(`[data-part="${draggedPart}"]`);
  placePart(draggedPart, part);
  draggedPart = null;
});

function placePart(partName, partElement) {
  if (placedParts.has(partName)) return;
  placedParts.add(partName);
  partElement.classList.add("placed");
  const chip = document.createElement("span");
  chip.textContent = partElement.textContent;
  chip.className = "placed-part";
  buildZone.appendChild(chip);
  const count = Math.min(placedParts.size, 6);
  buildProgress.textContent = `${count}/6 parts placed`;
  buildFeedback.textContent = "Part connected. The repair machine is taking shape.";
  if (placedParts.size >= 6) {
    buildZone.classList.add("complete");
    buildFeedback.textContent = "Creative Mission Complete. The Moon Drone repair machine is ready.";
    creativeComplete.disabled = false;
  }
}

const badges = document.querySelectorAll("[data-badge]");
const collection = document.querySelector("[data-collection]");
const rewardFeedback = document.querySelector("[data-reward-feedback]");
const rewardComplete = document.querySelector("[data-complete-step='reward']");
let foundBadges = 0;

badges.forEach((badge) => {
  badge.addEventListener("click", () => {
    if (badge.classList.contains("found")) return;
    badge.classList.add("found");
    foundBadges += 1;
    collection.textContent = `${foundBadges}/5 badges found`;
    rewardFeedback.textContent = `${badge.dataset.badge} collected.`;
    if (foundBadges === badges.length) {
      rewardFeedback.textContent = "All hidden rewards found. Mission Success unlocked.";
      rewardComplete.disabled = false;
    }
  });
});

setInterval(() => {
  if (state.currentStep !== "reward") return;
  badges.forEach((badge) => {
    if (!badge.classList.contains("found")) badge.classList.toggle("hint");
  });
}, 2600);

document.querySelector("[data-back-map]").addEventListener("click", () => {
  showStep("story");
});
