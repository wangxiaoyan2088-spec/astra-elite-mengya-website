const screens = document.querySelectorAll("[data-game-screen]");
const goButtons = document.querySelectorAll("[data-go]");
const identityButtons = document.querySelectorAll("[data-identity]");
const identityNext = document.querySelector("[data-identity-next]");
const playerRole = document.querySelector("[data-player-role]");
const stepButtons = document.querySelectorAll("[data-step-button]");
const stepCards = document.querySelectorAll("[data-step]");
const stepNextButtons = document.querySelectorAll("[data-step-next]");
const vocabButtons = document.querySelectorAll("[data-vocab]");
const vocabStatus = document.querySelector("[data-vocab-status]");
const vocabNext = document.querySelector("[data-vocab-next]");
const droneArea = document.querySelector("[data-drone-area]");
const droneToken = document.querySelector("[data-drone-token]");
const dropZone = document.querySelector("[data-drop-zone]");
const droneStatus = document.querySelector("[data-drone-status]");
const droneNext = document.querySelector("[data-drone-next]");
const recordButton = document.querySelector("[data-record]");
const recordStatus = document.querySelector("[data-record-status]");
const recordNext = document.querySelector("[data-record-next]");
const creativeInput = document.querySelector("[data-creative]");
const creativeNext = document.querySelector("[data-creative-next]");

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.gameScreen === name);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showStep(name) {
  stepButtons.forEach((button) => button.classList.toggle("active", button.dataset.stepButton === name));
  stepCards.forEach((card) => card.classList.toggle("active", card.dataset.step === name));
}

goButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});

identityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    identityButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    playerRole.textContent = button.dataset.identity;
    identityNext.disabled = false;
  });
});

stepButtons.forEach((button) => {
  button.addEventListener("click", () => showStep(button.dataset.stepButton));
});

stepNextButtons.forEach((button) => {
  button.addEventListener("click", () => showStep(button.dataset.stepNext));
});

let vocabCount = 0;
vocabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("complete")) return;
    button.classList.add("complete");
    vocabCount += 1;
    vocabStatus.textContent = `Signal scanner charged: ${vocabCount}/6 words.`;
    if (vocabCount === vocabButtons.length) {
      vocabStatus.textContent = "Vocabulary complete. The drone signal is ready to scan.";
      vocabNext.disabled = false;
    }
  });
});

let dragging = false;

function moveDrone(clientX, clientY) {
  const areaRect = droneArea.getBoundingClientRect();
  const tokenRect = droneToken.getBoundingClientRect();
  const x = clientX - areaRect.left - tokenRect.width / 2;
  const y = clientY - areaRect.top - tokenRect.height / 2;
  const maxX = areaRect.width - tokenRect.width;
  const maxY = areaRect.height - tokenRect.height;
  droneToken.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
  droneToken.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
}

function completeDroneIfConnected() {
  const droneRect = droneToken.getBoundingClientRect();
  const zoneRect = dropZone.getBoundingClientRect();
  const droneCenterX = droneRect.left + droneRect.width / 2;
  const droneCenterY = droneRect.top + droneRect.height / 2;
  const connected =
    droneCenterX > zoneRect.left &&
    droneCenterX < zoneRect.right &&
    droneCenterY > zoneRect.top &&
    droneCenterY < zoneRect.bottom;

  if (connected) {
    dropZone.classList.add("connected");
    droneToken.classList.add("connected");
    droneStatus.textContent = "Signal reconnected. Great work, future pilot.";
    droneNext.disabled = false;
  }
}

droneToken.addEventListener("pointerdown", (event) => {
  dragging = true;
  droneToken.setPointerCapture(event.pointerId);
  moveDrone(event.clientX, event.clientY);
});

droneToken.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  moveDrone(event.clientX, event.clientY);
});

droneToken.addEventListener("pointerup", () => {
  dragging = false;
  completeDroneIfConnected();
});

recordButton.addEventListener("click", () => {
  recordButton.textContent = "Recording Complete";
  recordButton.classList.add("complete");
  recordStatus.textContent = "Mission report saved: We found the drone signal.";
  recordNext.disabled = false;
});

creativeInput.addEventListener("input", () => {
  creativeNext.disabled = creativeInput.value.trim().length < 8;
});
