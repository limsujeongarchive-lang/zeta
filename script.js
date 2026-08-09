const countInput = document.getElementById("count");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const results = document.getElementById("results");

const claudeKeyInput = document.getElementById("claudeKey");
const claudePromptInput = document.getElementById("claudePrompt");
const claudeBtn = document.getElementById("claudeBtn");
const clearClaudeBtn = document.getElementById("clearClaudeBtn");
const claudeResponse = document.getElementById("claudeResponse");

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

function renderClaudeMessage(text, type = "info") {
  claudeResponse.textContent = text;
  claudeResponse.dataset.type = type;
}

async function queryClaude() {
  const apiKey = claudeKeyInput.value.trim();
  const prompt = claudePromptInput.value.trim();

  if (!apiKey) {
    renderClaudeMessage("Claude API 키를 입력해 주세요.", "error");
    claudeKeyInput.focus();
    return;
  }

  if (!prompt) {
    renderClaudeMessage("질문을 입력해 주세요.", "error");
    claudePromptInput.focus();
    return;
  }

  renderClaudeMessage("Claude에 요청 중입니다...", "info");

  try {
    const response = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "claude-3.5",
        prompt: `Please answer in Korean.\n\n${prompt}\n\nAssistant:`,
        max_tokens_to_generate: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      renderClaudeMessage(`Claude 요청 실패: ${response.status} ${response.statusText}`);
      console.error("Claude error response:", errorText);
      return;
    }

    const data = await response.json();
    const completion = data.completion?.trim() || "Claude로부터 응답을 받을 수 없습니다.";
    renderClaudeMessage(completion, "success");
  } catch (error) {
    renderClaudeMessage("Claude 요청 중 오류가 발생했습니다.", "error");
    console.error(error);
  }
}

function clearClaude() {
  claudeResponse.textContent = "";
  claudeResponse.dataset.type = "info";
  claudePromptInput.value = "";
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

  // Formspree에서 발급받은 폼 ID로 index.html의 action 값을 교체해야 동작합니다.
  if (partnerForm.action.includes("YOUR_FORM_ID")) {
    renderPartnerMessage("폼이 아직 연결되지 않았습니다. Formspree 폼 ID를 설정해 주세요.", "error");
    return;
  }

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
claudeBtn.addEventListener("click", queryClaude);
clearClaudeBtn.addEventListener("click", clearClaude);
partnerForm.addEventListener("submit", submitPartnerForm);
