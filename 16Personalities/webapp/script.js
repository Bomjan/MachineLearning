let questions = [];
let currentPage = 0;
const pageSize = 5;
const ip_addr = "10.9.84.180";
async function loadQuestions() {
  const res = await fetch(`http://${ip_addr}:8000/columns`);
  const data = await res.json();
  questions = data.columns;

  const formDiv = document.getElementById("form");
  formDiv.innerHTML = "";

  questions.forEach((q, i) => {
    formDiv.innerHTML += `
      <div class="question-card" id="qcard${i}">
        <label class="question-text">${q}</label>
        <div class="slider-labels">
          <span>Strongly Disagree</span>
          <span>Disagree</span>
          <span>Neutral</span>
          <span>Agree</span>
          <span>Strongly Agree</span>
        </div>
        <div class="slider-container">
          <input type="range" min="-2" max="2" value="0" step="1" id="q${i}">
          <span class="slider-value" id="q${i}-val">0</span>
        </div>
      </div>
    `;

    const slider = document.getElementById(`q${i}`);
    const display = document.getElementById(`q${i}-val`);
    slider.addEventListener("input", () => {
      display.textContent = slider.value;
      updateSliderColor(slider);
    });
    updateSliderColor(slider);
  });

  showPage(currentPage);
  updateProgress();
}

function updateSliderColor(slider) {
  const val = slider.value;
  if (val < 0) slider.style.background = "#e74c3c";
  else if (val == 0) slider.style.background = "#f1c40f";
  else slider.style.background = "#2ecc71";
}

function showPage(page) {
  const start = page * pageSize;
  const end = Math.min(start + pageSize, questions.length);

  questions.forEach((_, i) => {
    const card = document.getElementById(`qcard${i}`);
    if (i >= start && i < end) card.classList.add("active");
    else card.classList.remove("active");
  });

  document.getElementById("prevBtn").style.display =
    page === 0 ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display =
    end === questions.length ? "none" : "inline-block";
  document.getElementById("predictBtn").style.display =
    end === questions.length ? "block" : "none";

  updateProgress();
}

function updateProgress() {
  const progress = Math.min(
    ((currentPage * pageSize + pageSize) / questions.length) * 100,
    100
  );
  document.getElementById("progress-bar").style.width = progress + "%";
}

document.getElementById("nextBtn").addEventListener("click", () => {
  currentPage++;
  showPage(currentPage);
});

document.getElementById("prevBtn").addEventListener("click", () => {
  currentPage--;
  showPage(currentPage);
});

document.getElementById("predictBtn").addEventListener("click", async () => {
  const data = {};
  questions.forEach((q, i) => {
    data[q] = Number(document.getElementById(`q${i}`).value);
  });

  const response = await fetch(`http://${ip_addr}:8000/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  const result = await response.json();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Predicted MBTI: <b>" + result.personality + "</b>";
  resultDiv.style.display = "block";
});

loadQuestions();
