const countChips = document.getElementById("countChips");
const clockCount = document.getElementById("clockCount");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const results = document.getElementById("results");

const GAME_LETTERS = ["A", "B", "C", "D", "E"];

let gameCount = 1;

function pickLottoNumbers() {
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, 6).sort((a, b) => a - b);
}

function ballRange(number) {
  if (number <= 10) return "r1";
  if (number <= 20) return "r2";
  if (number <= 30) return "r3";
  if (number <= 40) return "r4";
  return "r5";
}

function describe(numbers) {
  const sum = numbers.reduce((total, number) => total + number, 0);
  const odd = numbers.filter((number) => number % 2 === 1).length;
  const high = numbers.filter((number) => number >= 24).length;
  return {
    sum,
    parity: `홀 ${odd} : 짝 ${6 - odd}`,
    range: `저 ${6 - high} : 고 ${high}`,
  };
}

function renderEmpty() {
  const empty = document.createElement("div");
  empty.className = "empty";

  const title = document.createElement("strong");
  title.textContent = "아직 뽑은 번호가 없습니다";

  empty.append(title, "게임 수를 고르고 “번호 뽑기”를 눌러 주세요.");
  return empty;
}

function renderTicket(index, numbers) {
  const stats = describe(numbers);

  const ticket = document.createElement("article");
  ticket.className = "ticket";

  const game = document.createElement("div");
  game.className = "game";
  game.textContent = GAME_LETTERS[index] ?? String(index + 1);
  const gameLabel = document.createElement("small");
  gameLabel.textContent = "GAME";
  game.appendChild(gameLabel);

  const balls = document.createElement("div");
  balls.className = "balls";
  numbers.forEach((number, position) => {
    const ball = document.createElement("div");
    ball.className = `ball ${ballRange(number)} drop`;
    ball.style.animationDelay = `${position * 60}ms`;
    ball.textContent = number;
    balls.appendChild(ball);
  });

  const meta = document.createElement("div");
  meta.className = "meta";
  [`합계 ${stats.sum}`, stats.parity, stats.range].forEach((text) => {
    const item = document.createElement("span");
    item.textContent = text;
    meta.appendChild(item);
  });

  const body = document.createElement("div");
  body.append(balls, meta);

  ticket.append(game, body);
  return ticket;
}

function generateNumbers() {
  results.innerHTML = "";
  for (let i = 0; i < gameCount; i += 1) {
    results.appendChild(renderTicket(i, pickLottoNumbers()));
  }
}

function selectCount(value) {
  gameCount = value;
  countChips.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(Number(chip.dataset.count) === value));
  });
  clockCount.textContent = `${value * 6}개`;
}

function reset() {
  results.innerHTML = "";
  results.appendChild(renderEmpty());
}

countChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (chip) selectCount(Number(chip.dataset.count));
});

generateBtn.addEventListener("click", generateNumbers);
resetBtn.addEventListener("click", reset);

reset();
