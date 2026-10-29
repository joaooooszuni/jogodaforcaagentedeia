const alphabet = "abcdefghijklmnopqrstuvwxyz";
const maxErrors = 6;
const setupScreen = document.querySelector("#setup-screen");
const gameScreen = document.querySelector("#game-screen");
const setupForm = document.querySelector("#setup-form");
const playerInputs = [document.querySelector("#player-one"), document.querySelector("#player-two")];
const currentPlayerLabel = document.querySelector("#current-player");
const gameMessage = document.querySelector("#game-message");
const playingPanel = document.querySelector("#playing-panel");
const restartButton = document.querySelector("#restart-button");
const wordSlots = document.querySelector("#word-slots");
const usedLetters = document.querySelector("#used-letters");
const keyboard = document.querySelector("#keyboard");
const wrongCount = document.querySelector("#wrong-count");
const players = [];
let currentState = null;
let currentPlayerIndex = 0;
let roundStarter = 0;

function normalizeLetter(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function startRound() {
  if (!Array.isArray(window.FORCA_WORDS) || window.FORCA_WORDS.length !== 1000) {
    gameMessage.textContent = "Não foi possível carregar o dicionário de palavras.";
    return;
  }

  const word = window.FORCA_WORDS[Math.floor(Math.random() * window.FORCA_WORDS.length)];
  currentPlayerIndex = roundStarter;
  currentState = { word, guessed: [], wrong: 0, status: "playing" };
  restartButton.hidden = true;
  renderGame();
}

function renderGame() {
  currentPlayerLabel.textContent = players[currentPlayerIndex].name;
  gameMessage.classList.remove("message-error");

  if (currentState.status === "playing") {
    gameMessage.textContent = "Escolha uma letra. Depois do palpite, a vez passa para o outro jogador.";
  } else if (currentState.status === "won") {
    gameMessage.textContent = `${players[currentState.winner].name} completou a palavra e ganhou esta rodada!`;
  } else {
    gameMessage.textContent = `Fim da rodada! A palavra era ${currentState.word.toLocaleUpperCase("pt-BR")}.`;
  }

  for (let index = 0; index < players.length; index += 1) {
    document.querySelector(`#score-name-${index}`).textContent = players[index].name;
    document.querySelector(`#score-${index}`).textContent = players[index].score;
    document.querySelector(`#score-card-${index}`).classList.toggle("active", currentState.status === "playing" && index === currentPlayerIndex);
  }

  wrongCount.textContent = currentState.wrong;
  for (const part of document.querySelectorAll(".body-part")) {
    part.classList.remove("visible");
  }
  const bodyParts = ["part-head", "part-body", "part-arm-left", "part-arm-right", "part-leg-left", "part-leg-right"];
  bodyParts.slice(0, currentState.wrong).forEach((id) => document.querySelector(`#${id}`).classList.add("visible"));

  const finished = currentState.status !== "playing";
  const normalizedWord = Array.from(currentState.word, normalizeLetter);
  wordSlots.replaceChildren();
  for (const character of currentState.word) {
    const slot = document.createElement("span");
    const isRevealed = finished || currentState.guessed.includes(normalizeLetter(character));
    slot.textContent = isRevealed ? character : "";
    wordSlots.append(slot);
  }
  wordSlots.setAttribute("aria-label", `${normalizedWord.length} letras na palavra`);

  const tried = currentState.guessed.map((letter) => letter.toLocaleUpperCase("pt-BR")).join(", ");
  usedLetters.textContent = tried ? `Letras tentadas: ${tried}` : "Letras tentadas: nenhuma";
  keyboard.replaceChildren();
  for (const letter of alphabet) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = letter.toLocaleUpperCase("pt-BR");
    button.disabled = finished || currentState.guessed.includes(letter);
    button.setAttribute("aria-label", `Chutar a letra ${letter}`);
    button.addEventListener("click", () => makeGuess(letter));
    keyboard.append(button);
  }

  restartButton.hidden = !finished;
}

function makeGuess(letter) {
  if (currentState.status !== "playing" || currentState.guessed.includes(letter)) {
    return;
  }

  currentState.guessed.push(letter);
  const found = Array.from(currentState.word, normalizeLetter).includes(letter);
  if (!found) {
    currentState.wrong += 1;
  }

  if (Array.from(currentState.word, normalizeLetter).every((character) => currentState.guessed.includes(character))) {
    currentState.status = "won";
    currentState.winner = currentPlayerIndex;
    players[currentPlayerIndex].score += 1;
  } else if (currentState.wrong >= maxErrors) {
    currentState.status = "lost";
  } else {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }

  renderGame();
}

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const names = playerInputs.map((input) => input.value.trim());
  if (names.some((name) => !name)) {
    playerInputs.find((input) => !input.value.trim()).focus();
    return;
  }
  if (names[0].toLocaleLowerCase("pt-BR") === names[1].toLocaleLowerCase("pt-BR")) {
    playerInputs[1].setCustomValidity("Escolham nomes diferentes para identificar as duas pessoas.");
    playerInputs[1].reportValidity();
    return;
  }

  playerInputs[1].setCustomValidity("");
  players.splice(0, players.length, ...names.map((name) => ({ name, score: 0 })));
  setupScreen.hidden = true;
  gameScreen.hidden = false;
  roundStarter = 0;
  startRound();
});

for (const input of playerInputs) {
  input.addEventListener("input", () => input.setCustomValidity(""));
}

restartButton.addEventListener("click", () => {
  roundStarter = (roundStarter + 1) % players.length;
  startRound();
});

document.querySelector("#new-match-button").addEventListener("click", () => {
  currentState = null;
  gameScreen.hidden = true;
  setupScreen.hidden = false;
});

document.addEventListener("keydown", (event) => {
  if (currentState?.status === "playing" && /^[a-z]$/i.test(event.key)) {
    makeGuess(event.key.toLowerCase());
  }
});
