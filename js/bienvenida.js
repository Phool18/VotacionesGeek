/* ===============================
   SELECTORES Y VARIABLES
================================ */
const wheel = document.getElementById('wheel');
const addOptionBtn = document.getElementById('addOption');
const newOptionInput = document.getElementById('newOption');
const spinButton = document.getElementById('spinButton');
const winnerDisplay = document.getElementById('winner');
const prizeImageContainer = document.getElementById('prize-image-container');

const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');

let options = [];
let currentRotation = 0;

const colors = [
  '#f39c12', '#e74c3c', '#9b59b6', '#3498db',
  '#2ecc71', '#1abc9c', '#d35400', '#c0392b'
];

/* ===============================
   CONTADORES
================================ */
function startCounters() {
  document.querySelectorAll('.counter').forEach(counter => {
    counter.innerText = '0';
    const target = +counter.dataset.target;
    const step = target / 100;

    const update = () => {
      const val = +counter.innerText;
      if (val < target) {
        counter.innerText = Math.ceil(val + step);
        setTimeout(update, 25);
      } else {
        counter.innerText = target;
      }
    };
    update();
  });
}

// Ejecutar contadores al cargar la página
window.addEventListener('DOMContentLoaded', startCounters);

/* ===============================
   DIBUJAR RULETA
================================ */
function drawWheel() {
  wheel.innerHTML = '';
  const n = options.length;

  if (!n) {
    wheel.style.background = '#222';
    return;
  }

  const angle = 360 / n;
  let gradient = 'conic-gradient(';

  options.forEach((opt, i) => {
    const start = i * angle;
    const end = start + angle;
    const middle = start + angle / 2;
    const color = colors[i % colors.length];

    gradient += `${color} ${start}deg ${end}deg${i < n - 1 ? ',' : ''}`;

    const label = document.createElement('div');
    label.className = 'wheel-label';
    label.textContent = opt;
    label.style.transform = `rotate(${middle}deg) translateY(-42%) rotate(-90deg)`;

    wheel.appendChild(label);
  });

  wheel.style.background = gradient + ')';
}

/* ===============================
   SONIDO TICK
================================ */
function playTick(rotation, duration) {
  if (options.length < 2) return;

  const step = 360 / options.length;
  let last = 0;
  const start = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const angle = currentRotation + rotation * eased;

    if (Math.abs(angle - last) >= step) {
      clickSound.currentTime = 0;
      clickSound.play().catch(() => {});
      last = angle;
    }
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ===============================
   GIRO PRINCIPAL
================================ */
spinButton.addEventListener('click', async () => {
  const spins = parseInt(document.getElementById('deleteCount').value) || 1;

  if (!options.length) return alert('Agrega premios primero');
  if (spins > options.length) return alert('No puedes eliminar más de los que hay');

  spinButton.disabled = true;

  for (let i = 1; i <= spins; i++) {
    await spinOnce(i === spins);
  }

  spinButton.disabled = false;
});

function spinOnce(finalSpin) {
  return new Promise(resolve => {
    prizeImageContainer.classList.add('hidden');
    winnerDisplay.innerText = finalSpin ? '🎯 GIRO FINAL' : '❌ Eliminando...';

    const n = options.length;
    const index = Math.floor(Math.random() * n);
    const angle = 360 / n;

    const extra = 360 * 5;
    const target = 360 - (index * angle + angle / 2);
    const normalized = ((target - currentRotation) % 360 + 360) % 360;

    const rotateBy = extra + normalized;
    currentRotation += rotateBy;

    playTick(rotateBy, 4000);
    wheel.style.transition = 'transform 4s cubic-bezier(0.15,0,0.15,1)';
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
      const result = options[index];

      if (!finalSpin) {
        options.splice(index, 1);
        winnerDisplay.innerText = `❌ Eliminado: ${result}`;

        setTimeout(() => {
          drawWheel();
          wheel.style.transition = 'none';
          wheel.style.transform = `rotate(${currentRotation}deg)`;
          resolve();
        }, 800);

      } else {
        winSound.play().catch(() => {});
        winnerDisplay.innerText = `🎉 GANASTE: ${result}`;
        prizeImageContainer.classList.remove('hidden');
        resolve();
      }
    }, 4200);
  });
}

/* ===============================
   AGREGAR OPCIONES
================================ */
addOptionBtn.addEventListener('click', () => {
  const val = newOptionInput.value.trim();
  if (!val) return;

  options.push(val);
  newOptionInput.value = '';
  drawWheel();
});

newOptionInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addOptionBtn.click();
});
