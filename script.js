const board = document.getElementById("board");
const ctx = board.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const speedEl = document.getElementById("speed");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const controlButtons = document.querySelectorAll(".controls button");

const cellSize = 24;
const gridSize = board.width / cellSize;
const storageKey = "snake-high-score";

let snake;
let direction;
let pendingDirection;
let food;
let score;
let speed;
let gameTick;
let isRunning = false;
let isPaused = false;

function loadHighScore() {
  return Number(localStorage.getItem(storageKey) || 0);
}

function updateHighScoreDisplay() {
  highScoreEl.textContent = String(loadHighScore());
}

function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };
}

function placeFood() {
  let candidate = randomGridPosition();

  while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y)) {
    candidate = randomGridPosition();
  }

  food = candidate;
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawBoard() {
  ctx.fillStyle = "#091325";
  ctx.fillRect(0, 0, board.width, board.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  for (let i = 1; i < gridSize; i += 1) {
    const offset = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, board.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(board.width, offset);
    ctx.stroke();
  }

  snake.forEach((segment, index) => {
    const color = index === 0 ? "#5ce08e" : "#7ef7a9";
    drawCell(segment.x, segment.y, color);
  });

  drawCell(food.x, food.y, "#ff5d7a");
}

function updateHud() {
  scoreEl.textContent = String(score);
  speedEl.textContent = `${speed.toFixed(1)}x`;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function setDirection(nextDirection) {
  if (!isRunning || isPaused) {
    return;
  }

  const opposite = {
    up: "down",
    down: "up",
    left: "right",
    right: "left"
  };

  if (nextDirection !== opposite[direction]) {
    pendingDirection = nextDirection;
  }
}

function moveSnake() {
  direction = pendingDirection;

  const head = { ...snake[0] };

  if (direction === "up") {
    head.y -= 1;
  } else if (direction === "down") {
    head.y += 1;
  } else if (direction === "left") {
    head.x -= 1;
  } else if (direction === "right") {
    head.x += 1;
  }

  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitBody = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitBody) {
    gameOver();
    return;
  }

  snake.unshift(head);

  const ateFood = head.x === food.x && head.y === food.y;

  if (ateFood) {
    score += 1;
    speed = Math.min(2.5, 1 + score * 0.05);
    updateHud();
    placeFood();
    restartTick();
  } else {
    snake.pop();
  }

  drawBoard();
}

function restartTick() {
  clearInterval(gameTick);
  const interval = Math.max(70, 150 / speed);
  gameTick = setInterval(moveSnake, interval);
}

function gameOver() {
  isRunning = false;
  clearInterval(gameTick);

  const highScore = loadHighScore();
  if (score > highScore) {
    localStorage.setItem(storageKey, String(score));
    updateHighScoreDisplay();
  }

  setStatus("Game over. Press Start or Space to try again.");
}

function startGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = "right";
  pendingDirection = "right";
  score = 0;
  speed = 1;
  isRunning = true;
  isPaused = false;

  updateHud();
  updateHighScoreDisplay();
  placeFood();
  drawBoard();
  restartTick();
  setStatus("Running. Use arrows or WASD. Press Space to pause.");
}

function togglePause() {
  if (!isRunning) {
    startGame();
    return;
  }

  if (isPaused) {
    isPaused = false;
    restartTick();
    setStatus("Running. Use arrows or WASD. Press Space to pause.");
  } else {
    isPaused = true;
    clearInterval(gameTick);
    setStatus("Paused. Press Space to resume.");
  }
}

function keyToDirection(key) {
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right"
  };

  return map[key];
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  const directionFromKey = keyToDirection(event.key);
  if (directionFromKey) {
    event.preventDefault();
    setDirection(directionFromKey);
  }
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.dir);
  });
});

startBtn.addEventListener("click", startGame);

updateHighScoreDisplay();
setStatus("Press Start or Space to play.");
ctx.fillStyle = "#091325";
ctx.fillRect(0, 0, board.width, board.height);
