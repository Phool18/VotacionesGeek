
// ─── State ───────────────────────────────────────────────────
let lang = localStorage.getItem('lang') || 'es';

// ─── DOM refs ────────────────────────────────────────────────
const langBtnDesktop = document.getElementById('langBtn');
const langBtnMobile  = document.getElementById('langBtnMobile');
const hamburger      = document.getElementById('hamburger');
const navDrawer      = document.getElementById('navDrawer');
const navbar         = document.getElementById('navbar');

// ─── Apply translations ───────────────────────────────────────
function applyLang(l) {
  const t = translations[l];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  // Update lang buttons
  langBtnDesktop.innerHTML = `<span class="lang-flag">${l === 'es' ? 'en' : '🇵🇪'}</span> ${l === 'es' ? 'EN' : 'ES'}`;
  langBtnMobile.innerHTML  = langBtnDesktop.innerHTML;
  document.documentElement.lang = l;
}

function toggleLang() {
  lang = lang === 'es' ? 'en' : 'es';
  localStorage.setItem('lang', lang);
  applyLang(lang);
  renderProjects();
}

langBtnDesktop.addEventListener('click', toggleLang);
langBtnMobile.addEventListener('click',  toggleLang);

// ─── Hamburger ───────────────────────────────────────────────
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navDrawer.classList.toggle('open');
});

// Close drawer on link click
navDrawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navDrawer.classList.remove('open');
  });
});

// ─── Navbar shadow on scroll ─────────────────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ─── Fade-up Intersection Observer ──────────────────────────
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

function observeFadeEls() {
  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));
}

// ─── Skill bars ───────────────────────────────────────────────
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('#skills').forEach(el => barObserver.observe(el));
// Init bars at 0
document.querySelectorAll('.skill-fill').forEach(bar => bar.style.width = '0%');

// ─── Projects renderer ───────────────────────────────────────
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  const t = translations[lang];

  if (!projects || projects.length === 0) {
    grid.innerHTML = `
      <div class="projects-empty fade-up">
        <div class="empty-icon">🚧</div>
        <h3 data-i18n="proj_empty_h">${t.proj_empty_h}</h3>
        <p data-i18n="proj_empty_p">${t.proj_empty_p}</p>
        <a href="https://github.com/Phool18" target="_blank" class="btn-outline">
          🐙 <span data-i18n="proj_empty_btn">${t.proj_empty_btn}</span>
        </a>
      </div>`;
    observeFadeEls();
    return;
  }

  grid.innerHTML = projects.map(p => `
    <article class="project-card fade-up">
      <div class="project-thumb">
        ${p.image ? `<img src="${p.image}" alt="${lang === 'es' ? p.title_es : p.title_en}" loading="lazy" />` : `<span>${p.emoji || '💻'}</span>`}
      </div>
      <div class="project-body">
        <div class="project-tags">${p.tags.map(tg => `<span class="tag">${tg}</span>`).join('')}</div>
        <h3 class="project-title">${lang === 'es' ? p.title_es : p.title_en}</h3>
        <p class="project-desc">${lang === 'es' ? p.desc_es : p.desc_en}</p>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank" class="project-link">🐙 ${t.proj_github}</a>` : ''}
          ${p.demo   ? `<a href="${p.demo}"   target="_blank" class="project-link">🌐 ${t.proj_demo}</a>`   : ''}
        </div>
      </div>
    </article>`).join('');

  observeFadeEls();
}
// ─── Init ─────────────────────────────────────────────────────
applyLang(lang);
renderProjects();
observeFadeEls();
