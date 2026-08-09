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

partnerForm.addEventListener("submit", submitPartnerForm);
