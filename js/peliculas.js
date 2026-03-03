/* =====================
   ESTADO GLOBAL
===================== */
let movies = JSON.parse(localStorage.getItem("moviesRanking")) || [];

/* =====================
   ELEMENTOS DOM
===================== */
const list = document.getElementById("candidateList");
const form = document.getElementById("candidateForm");
const nameInput = document.getElementById("name");
const typeSelect = document.getElementById("type");
const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("fileName");

/* =====================
   IMAGEN (CLICK + NOMBRE)
===================== */
uploadBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
  fileName.textContent = imageInput.files[0]
    ? imageInput.files[0].name
    : "Ninguna imagen seleccionada";
});

/* =====================
   RENDER LIST
===================== */
function renderList() {
  list.innerHTML = "";

  movies.forEach((m) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${m.image}" alt="${m.name}">
      <strong>${m.name}</strong><br>
      <small>${m.type}</small><br>
      ⭐ <span class="score-text">${m.score}</span>
      <input type="range" min="1" max="10" value="${m.score}">
    `;

    const slider = card.querySelector("input");
    const scoreText = card.querySelector(".score-text");

    slider.addEventListener("input", () => {
      m.score = Number(slider.value);
      scoreText.textContent = m.score;
      localStorage.setItem("moviesRanking", JSON.stringify(movies));
    });

    list.appendChild(card);
  });
}

/* =====================
   FORM SUBMIT
===================== */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!imageInput.files[0]) {
    alert("Sube o pega una imagen");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    movies.push({
      name: nameInput.value.trim() || "Sin título",
      type: typeSelect.value,
      image: reader.result,
      score: 1
    });

    localStorage.setItem("moviesRanking", JSON.stringify(movies));
    renderList();

    form.reset();
    fileName.textContent = "Ninguna imagen seleccionada";
  };
  reader.readAsDataURL(imageInput.files[0]);
});

/* =====================
   PEGAR IMAGEN (CTRL+V)
===================== */
form.addEventListener("paste", (e) => {
  const items = e.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.includes("image")) {
      const file = items[i].getAsFile();
      const reader = new FileReader();

      reader.onload = () => {
        movies.push({
          name: nameInput.value.trim() || "Sin título",
          type: typeSelect.value,
          image: reader.result,
          score: 1
        });

        localStorage.setItem("moviesRanking", JSON.stringify(movies));
        renderList();
        form.reset();
      };

      reader.readAsDataURL(file);
      e.preventDefault();
      break;
    }
  }
});

/* =====================
   PODIUM UPDATE
===================== */
function updatePodium() {
  const container = document.querySelector(".podium-container");
  container.innerHTML = "";

  const ranking = [...movies].sort((a, b) => b.score - a.score);
  const maxScore = ranking[0]?.score || 1;
  const maxWidth = 500;
  const emojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  for (let i = 0; i < 5; i++) {
    const row = document.createElement("div");
    row.className = "podium-row";

    const place = document.createElement("div");
    place.className = "place";
    place.textContent = emojis[i];

    const bar = document.createElement("div");
    bar.className = "podium";

    if (ranking[i]) {
      bar.style.width = `${(ranking[i].score / maxScore) * maxWidth}px`;

      if (i === 0) bar.style.background = "gold";
      else if (i === 1) bar.style.background = "silver";
      else if (i === 2) bar.style.background = "#cd7f32";
      else if (i === 3) bar.style.background = "#00c6ff";
      else bar.style.background = "hotpink";

      bar.textContent = `${ranking[i].name} (${ranking[i].score} pts)`;
    } else {
      bar.style.width = "50px";
      bar.style.background = "gray";
      bar.textContent = "— 0 pts";
    }

    row.append(place, bar);
    container.appendChild(row);
  }
}

/* =====================
   INIT
===================== */
renderList();
updatePodium();
