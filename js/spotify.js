/* =====================
   ESTADO GLOBAL
===================== */
let songs = JSON.parse(localStorage.getItem("spotifySongs")) || [];
let pendingScores = {};

/* =====================
   ELEMENTOS DEL DOM
===================== */
const list = document.getElementById("topList");
const form = document.getElementById("spotifyForm");
const linkInput = document.getElementById("spotifyLink");
const titleInput = document.getElementById("title");
const preview = document.getElementById("preview");
const updateBtn = document.getElementById("updateRankingBtn");
const podiumContainer = document.querySelector(".podium-container");

/* =====================
   FUNCIONES AUXILIARES
===================== */
function getSpotifyID(url) {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function fetchSpotifyTitle(id) {
  try {
    const response = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${id}`);
    const data = await response.json();
    return data.title || id;
  } catch (err) {
    console.error("No se pudo obtener el nombre de la canción:", err);
    return id;
  }
}

/* =====================
   PREVIEW + AUTOFILL
===================== */
linkInput.addEventListener("input", async () => {
  const id = getSpotifyID(linkInput.value);
  if (!id) return;

  preview.innerHTML = `
    <iframe 
      src="https://open.spotify.com/embed/track/${id}"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
    </iframe>
  `;

  const songName = await fetchSpotifyTitle(id);
  titleInput.value = songName;
});

/* =====================
   BOTÓN AGREGAR AL TOP
===================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = getSpotifyID(linkInput.value);
  if (!id) return alert("Link inválido");

  let name = titleInput.value.trim();
  if (!name) {
    name = await fetchSpotifyTitle(id);
  }

  // Agregar solo al array y al listado, NO actualizar podio
  songs.push({
    name,
    id,
    score: 5
  });

  localStorage.setItem("spotifySongs", JSON.stringify(songs));

  // Limpiar formulario y preview
  form.reset();
  preview.innerHTML = "";

  // Renderizar lista (solo topList, no podio)
  renderList();
});

/* =====================
   BOTÓN ACTUALIZAR RANKING
===================== */
updateBtn.addEventListener("click", () => {
  // Actualizar scores según sliders
  Object.keys(pendingScores).forEach(index => {
    songs[index].score = pendingScores[index];
  });

  localStorage.setItem("spotifySongs", JSON.stringify(songs));

  // Actualizar podio
  updatePodium();
});

/* =====================
   RENDER LIST
===================== */
function renderList() {
  list.innerHTML = "";

  songs.forEach((s, index) => {
    // ✅ Solo asignar score si aún no existe
    if (pendingScores[index] === undefined) {
      pendingScores[index] = s.score;
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <iframe src="https://open.spotify.com/embed/track/${s.id}"></iframe>
      <strong>${s.name}</strong><br>
      ⭐ <span class="score-text">${pendingScores[index]}</span>
      <input type="range" min="1" max="10" value="${pendingScores[index]}">
    `;

    const slider = card.querySelector("input");
    const scoreText = card.querySelector(".score-text");

    slider.addEventListener("input", () => {
      pendingScores[index] = Number(slider.value);
      scoreText.textContent = pendingScores[index];
    });

    list.appendChild(card);
  });
}

/* =====================
   PODIO (TOP 5)
===================== */
function updatePodium() {
  podiumContainer.innerHTML = "";

  const ranking = [...songs].sort((a, b) => b.score - a.score);
  const maxScore = ranking[0]?.score || 1;
  const maxWidth = 500;
  const emojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  for (let i = 0; i < 5; i++) {
    const row = document.createElement("div");
    row.className = "podium-row";

    const place = document.createElement("div");
    place.className = "place";
    place.textContent = emojis[i];

    const podium = document.createElement("div");
    podium.className = "podium";

    if (ranking[i]) {
      podium.style.width = `${(ranking[i].score / maxScore) * maxWidth}px`;

      if (i === 0) podium.style.background = "gold";
      else if (i === 1) podium.style.background = "silver";
      else if (i === 2) podium.style.background = "#cd7f32";
      else if (i === 3) podium.style.background = "#00c6ff";
      else podium.style.background = "hotpink";

      podium.textContent = `${ranking[i].name} (${ranking[i].score} pts)`;
    } else {
      podium.style.width = "50px";
      podium.style.background = "gray";
      podium.textContent = "— 0 pts";
    }

    row.appendChild(place);
    row.appendChild(podium);
    podiumContainer.appendChild(row);
  }
}

/* =====================
   INICIALIZACIÓN
===================== */
renderList();
updatePodium();
