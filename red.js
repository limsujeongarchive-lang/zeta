const MODEL_URL = "https://teachablemachine.withgoogle.com/models/yTdKqJotd/";

const tabCam = document.getElementById("tabCam");
const tabFile = document.getElementById("tabFile");
const camPane = document.getElementById("camPane");
const filePane = document.getElementById("filePane");

const stage = document.getElementById("stage");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");

const dropZone = document.getElementById("dropZone");
const dropText = document.getElementById("dropText");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

const gauge = document.getElementById("gauge");
const scoreEl = document.getElementById("score");
const verdictEl = document.getElementById("verdict");
const barsEl = document.getElementById("bars");

let model = null;
let webcam = null;
let rafId = null;
let redIndex = -1;
let barFills = [];

function setStatus(text, type = "info") {
  statusEl.textContent = text;
  statusEl.dataset.type = type;
}

async function loadModel() {
  if (model) return model;
  setStatus("모델을 불러오는 중입니다...");
  model = await tmImage.load(`${MODEL_URL}model.json`, `${MODEL_URL}metadata.json`);

  const labels = model.getClassLabels();
  redIndex = labels.findIndex((label) => label.includes("있음"));
  if (redIndex === -1) redIndex = labels.length - 1;
  buildBars(labels);

  setStatus("모델 준비 완료.");
  return model;
}

function buildBars(labels) {
  barsEl.innerHTML = "";
  barFills = labels.map((label, index) => {
    const row = document.createElement("div");
    row.className = index === redIndex ? "bar-row is-red" : "bar-row";

    const head = document.createElement("div");
    head.className = "bar-head";
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("b");
    value.textContent = "0.0%";
    head.append(name, value);

    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    track.appendChild(fill);

    row.append(head, track);
    barsEl.appendChild(row);
    return { fill, value };
  });
}

function render(predictions) {
  predictions.forEach((prediction, index) => {
    const percent = prediction.probability * 100;
    const bar = barFills[index];
    if (!bar) return;
    bar.fill.style.width = `${percent}%`;
    bar.value.textContent = `${percent.toFixed(1)}%`;
  });

  const red = (predictions[redIndex]?.probability ?? 0) * 100;
  gauge.style.setProperty("--p", red.toFixed(1));
  scoreEl.textContent = `${Math.round(red)}%`;

  if (red >= 70) {
    verdictEl.textContent = "빨강 있음";
    verdictEl.dataset.level = "high";
  } else if (red >= 40) {
    verdictEl.textContent = "빨강인지 애매함";
    verdictEl.dataset.level = "mid";
  } else {
    verdictEl.textContent = "빨강 없음";
    verdictEl.dataset.level = "low";
  }
}

async function predictOnce(source) {
  const predictions = await model.predict(source);
  render(predictions);
}

async function loop() {
  webcam.update();
  await predictOnce(webcam.canvas);
  rafId = window.requestAnimationFrame(loop);
}

async function startCamera() {
  startBtn.disabled = true;
  try {
    await loadModel();

    webcam = new tmImage.Webcam(360, 360, true);
    await webcam.setup();
    await webcam.play();

    stage.innerHTML = "";
    stage.appendChild(webcam.canvas);
    stopBtn.disabled = false;
    setStatus("실시간으로 측정 중입니다.");
    rafId = window.requestAnimationFrame(loop);
  } catch (error) {
    startBtn.disabled = false;
    if (error?.name === "NotAllowedError") {
      setStatus("카메라 권한이 거부되었습니다. 브라우저 주소창의 카메라 아이콘에서 허용해 주세요.", "error");
    } else if (error?.name === "NotFoundError") {
      setStatus("사용할 수 있는 카메라를 찾지 못했습니다.", "error");
    } else {
      setStatus("카메라를 시작하지 못했습니다. 사진으로 측정해 보세요.", "error");
    }
    console.error(error);
  }
}

function stopCamera() {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (webcam) {
    webcam.stop();
    webcam = null;
  }
  stage.innerHTML = '<p class="stage-empty">카메라를 켜면 실시간으로 측정합니다.</p>';
  startBtn.disabled = false;
  stopBtn.disabled = true;
  setStatus("측정을 중지했습니다.");
}

async function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("이미지 파일만 측정할 수 있습니다.", "error");
    return;
  }

  try {
    await loadModel();
  } catch (error) {
    setStatus("모델을 불러오지 못했습니다. 네트워크를 확인해 주세요.", "error");
    console.error(error);
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  preview.onload = async () => {
    try {
      await predictOnce(preview);
      setStatus(`측정 완료: ${file.name}`);
    } catch (error) {
      setStatus("이미지를 측정하지 못했습니다.", "error");
      console.error(error);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };
  preview.onerror = () => {
    setStatus("이미지를 읽지 못했습니다.", "error");
    URL.revokeObjectURL(objectUrl);
  };

  preview.src = objectUrl;
  preview.hidden = false;
  dropText.hidden = true;
  setStatus("측정 중입니다...");
}

function switchMode(mode) {
  const isCam = mode === "cam";
  tabCam.setAttribute("aria-selected", String(isCam));
  tabFile.setAttribute("aria-selected", String(!isCam));
  camPane.hidden = !isCam;
  filePane.hidden = isCam;
  if (!isCam && webcam) stopCamera();
  else setStatus("");
}

tabCam.addEventListener("click", () => switchMode("cam"));
tabFile.addEventListener("click", () => switchMode("file"));
startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);

fileInput.addEventListener("change", (event) => handleFile(event.target.files[0]));

["dragenter", "dragover"].forEach((type) => {
  dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((type) => {
  dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
});

dropZone.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));

window.addEventListener("beforeunload", () => {
  if (webcam) webcam.stop();
});
