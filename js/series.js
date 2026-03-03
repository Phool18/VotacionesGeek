/* =====================
   ESTADO GLOBAL
===================== */
let candidates = JSON.parse(localStorage.getItem("serie")) || [];

/* =====================
   ELEMENTOS DEL DOM
===================== */
const list = document.getElementById("serieList");
const form = document.getElementById("serieForm");
const nameInput = document.getElementById("name");
const typeSelect = document.getElementById("type");
const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("fileName");

uploadBtn.addEventListener("click", () => {
  imageInput.click(); // abre el selector de archivos
});

imageInput.addEventListener("change", () => {
  if (imageInput.files[0]) {
    fileName.textContent = imageInput.files[0].name; // muestra el nombre
  } else {
    fileName.textContent = "Ninguna imagen seleccionada";
  }
});


/* =====================
   RENDER LIST
===================== */
function renderList() {
  list.innerHTML = "";

  candidates.forEach((c, index) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${c.image}" alt="${c.name}">
      <strong>${c.name}</strong><br>
      <small>${c.type}</small><br>
      ⭐ <span class="score-text">${c.score}</span>
      <input type="range" min="1" max="10" value="${c.score}">
    `;

    const slider = card.querySelector("input");
    const scoreText = card.querySelector(".score-text");

    slider.addEventListener("input", () => {
      c.score = Number(slider.value);
      scoreText.textContent = c.score;
      localStorage.setItem("candidates", JSON.stringify(candidates));
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
    alert("Por favor selecciona o pega una imagen");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const candidate = {
      name: nameInput.value.trim(),
      type: typeSelect.value,
      image: reader.result,
      score: 1
    };
    candidates.push(candidate);
    localStorage.setItem("candidates", JSON.stringify(candidates));
    renderList();
    form.reset();
  };
  reader.readAsDataURL(imageInput.files[0]);
});

form.addEventListener("paste", (e) => {
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const file = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = () => {
        const candidate = {
          name: nameInput.value.trim() || "Sin nombre",
          type: typeSelect.value,
          image: reader.result,
          score: 1
        };
        candidates.push(candidate);
        localStorage.setItem("candidates", JSON.stringify(candidates));
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

  const ranking = [...candidates].sort((a,b) => b.score - a.score);
  const maxScore = ranking[0]?.score || 1;
  const maxWidth = 500; 
  const emojis = ["🥇","🥈","🥉","4️⃣","5️⃣"];

  for (let i = 0; i < 5; i++) {
    const row = document.createElement("div");
    row.className = "podium-row";

    const place = document.createElement("div");
    place.className = "place";
    place.textContent = emojis[i];

    const podium = document.createElement("div");
    podium.className = "podium";

    if (ranking[i]) {
      // ancho proporcional al score
      podium.style.width = `${(ranking[i].score / maxScore) * maxWidth}px`;

      // color según lugar
      if(i === 0) podium.style.background = "gold";
      else if(i === 1) podium.style.background = "silver";
      else if(i === 2) podium.style.background = "#cd7f32";
      else if(i === 3) podium.style.background = "#00c6ff";
      else podium.style.background = "hotpink";

      podium.textContent = `${ranking[i].name} (${ranking[i].score} pts)`;
    } else {
      podium.style.width = "50px";
      podium.style.background = "gray";
      podium.textContent = "— 0 pts";
    }

    row.appendChild(place);
    row.appendChild(podium);
    container.appendChild(row);
  }
}

/* =====================
   INIT
===================== */
renderList();
updatePodium();

