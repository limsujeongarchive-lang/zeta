const countInput = document.getElementById("count");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const results = document.getElementById("results");

function pickLottoNumbers() {
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, 6).sort((a, b) => a - b);
}

function renderSet(index, lottoNumbers) {
  const card = document.createElement("article");
  card.className = "result-card";

  const heading = document.createElement("h3");
  heading.textContent = `추천 세트 ${index + 1}`;
  card.appendChild(heading);

  const list = document.createElement("div");
  list.className = "number-list";

  lottoNumbers.forEach((number) => {
    const item = document.createElement("div");
    item.className = "number-item";
    item.textContent = number;
    list.appendChild(item);
  });

  card.appendChild(list);
  return card;
}

function generateNumbers() {
  const count = Number(countInput.value) || 1;
  results.innerHTML = "";

  for (let i = 0; i < count; i += 1) {
    const lottoNumbers = pickLottoNumbers();
    const card = renderSet(i, lottoNumbers);
    results.appendChild(card);
  }
}

function reset() {
  results.innerHTML = "";
  countInput.value = "1";
}

generateBtn.addEventListener("click", generateNumbers);
resetBtn.addEventListener("click", reset);
