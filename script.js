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

const partnerForm = document.getElementById("partnerForm");
const partnerSubmitBtn = document.getElementById("partnerSubmitBtn");
const partnerStatus = document.getElementById("partnerStatus");

function renderPartnerMessage(text, type = "info") {
  partnerStatus.textContent = text;
  partnerStatus.dataset.type = type;
}

async function submitPartnerForm(event) {
  event.preventDefault();

  partnerSubmitBtn.disabled = true;
  renderPartnerMessage("문의를 전송하는 중입니다...", "info");

  try {
    const response = await fetch(partnerForm.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(partnerForm),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const detail = data?.errors?.map((item) => item.message).join(" ");
      renderPartnerMessage(detail || "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.", "error");
      return;
    }

    partnerForm.reset();
    renderPartnerMessage("문의가 접수되었습니다. 확인 후 회신드리겠습니다.", "success");
  } catch (error) {
    renderPartnerMessage("네트워크 오류로 전송하지 못했습니다.", "error");
    console.error(error);
  } finally {
    partnerSubmitBtn.disabled = false;
  }
}

function reset() {
  results.innerHTML = "";
  countInput.value = "1";
}

generateBtn.addEventListener("click", generateNumbers);
resetBtn.addEventListener("click", reset);
partnerForm.addEventListener("submit", submitPartnerForm);
