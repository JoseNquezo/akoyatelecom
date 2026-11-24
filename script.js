document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

function setMenu(open) {
  if (!menuToggle || !mainNav) return;
  mainNav.classList.toggle('open', open);
  menuToggle.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mainNav?.classList.contains('open')) {
    setMenu(false);
    menuToggle?.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!mainNav?.classList.contains('open')) return;
  if (!mainNav.contains(event.target) && !menuToggle?.contains(event.target)) setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 850) setMenu(false);
});

const siteHeader = document.querySelector('.site-header');
const updateHeader = () => siteHeader?.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.count);
      const duration = 900;
      const start = performance.now();
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = String(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      observer.unobserve(counter);
    });
  }, { threshold: 0.8 });

  document.querySelectorAll('[data-count]').forEach((counter) => counterObserver.observe(counter));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
}

const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = String(new Date().getFullYear());

document.querySelectorAll('[data-back-to-top]').forEach((button) => {
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });
});

if (!document.querySelector('.whatsapp-float')) {
  const whatsappLink = document.createElement('a');
  whatsappLink.className = 'whatsapp-float';
  whatsappLink.href = 'https://wa.me/244934049618?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20solu%C3%A7%C3%B5es%20da%20Akoya%20Telecomunica%C3%A7%C3%B5es.';
  whatsappLink.target = '_blank';
  whatsappLink.rel = 'noopener noreferrer';
  whatsappLink.setAttribute('aria-label', 'Conversar com a Akoya Telecomunicações pelo WhatsApp');
  whatsappLink.innerHTML = `
    <span class="whatsapp-float-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32"><path d="M16.04 3C8.86 3 3.02 8.84 3.02 16c0 2.29.6 4.52 1.74 6.48L3 29l6.68-1.75A13 13 0 1 0 16.04 3Zm0 23.62a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-3.96 1.04 1.06-3.86-.25-.39A10.72 10.72 0 1 1 16.04 26.62Zm5.91-8.01c-.32-.16-1.9-.94-2.19-1.05-.29-.11-.51-.16-.73.16-.22.32-.83 1.05-1.02 1.26-.19.22-.38.24-.7.08-.32-.16-1.37-.5-2.61-1.61-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.57.16-.19.22-.32.32-.54.11-.22.05-.4-.03-.57-.08-.16-.73-1.75-.99-2.4-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67 0 1.58 1.15 3.1 1.31 3.31.16.22 2.26 3.45 5.47 4.84.76.33 1.36.53 1.82.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z"/></svg>
    </span>
  `;
  document.body.appendChild(whatsappLink);
}

const heroSlides = [...document.querySelectorAll('[data-hero-slide]')];
const heroButtons = [...document.querySelectorAll('[data-hero-to]')];
const heroSlider = document.querySelector('.hero-slider');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let autoplayEnabled = !reducedMotionQuery.matches;
let autoplayPausedForInteraction = false;
let autoplayTimer;

function stopHeroAutoplay() {
  window.clearInterval(autoplayTimer);
  autoplayTimer = undefined;
}

function syncHeroAutoplay() {
  stopHeroAutoplay();
  heroSlider?.setAttribute('aria-live', autoplayEnabled ? 'off' : 'polite');
  if (!heroSlider || heroSlides.length < 2 || !autoplayEnabled || autoplayPausedForInteraction || document.hidden) return;

  autoplayTimer = window.setInterval(() => {
    const activeIndex = heroSlides.findIndex((slide) => !slide.hidden);
    showHeroSlide((activeIndex + 1) % heroSlides.length, false);
  }, 7000);
}

function showHeroSlide(index, restartAutoplay = true) {
  if (!Number.isInteger(index) || index < 0 || index >= heroSlides.length) return;
  heroSlides.forEach((slide, slideIndex) => {
    const active = slideIndex === index;
    slide.hidden = !active;
    slide.classList.toggle('is-active', active);
    heroButtons[slideIndex]?.setAttribute('aria-pressed', String(active));
  });
  if (restartAutoplay) syncHeroAutoplay();
}

heroButtons.forEach((button) => {
  button.addEventListener('click', () => showHeroSlide(Number(button.dataset.heroTo)));
});

heroSlider?.addEventListener('mouseenter', () => {
  autoplayPausedForInteraction = true;
  syncHeroAutoplay();
});
heroSlider?.addEventListener('mouseleave', () => {
  autoplayPausedForInteraction = false;
  syncHeroAutoplay();
});
heroSlider?.addEventListener('focusin', () => {
  autoplayPausedForInteraction = true;
  syncHeroAutoplay();
});
heroSlider?.addEventListener('focusout', (event) => {
  if (!heroSlider.contains(event.relatedTarget)) {
    autoplayPausedForInteraction = false;
    syncHeroAutoplay();
  }
});

document.addEventListener('visibilitychange', syncHeroAutoplay);
reducedMotionQuery.addEventListener('change', (event) => {
  autoplayEnabled = !event.matches;
  syncHeroAutoplay();
});
syncHeroAutoplay();

const serviceTabs = [...document.querySelectorAll('[data-service-tab]')];

function activateServiceTab(tab, moveFocus) {
  serviceTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    if (panel) {
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    }
  });
  if (moveFocus) tab.focus();
}

serviceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateServiceTab(tab, false));
  tab.addEventListener('keydown', (event) => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % serviceTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + serviceTabs.length) % serviceTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = serviceTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    activateServiceTab(serviceTabs[nextIndex], true);
  });
});

if (serviceTabs.length) {
  const hash = window.location.hash.slice(1);
  const initialTab = serviceTabs.find((tab) =>
    tab.dataset.serviceTab === hash || tab.getAttribute('aria-controls') === hash
  );
  if (initialTab) activateServiceTab(initialTab, false);
}

const contactForm = document.getElementById('contact-form');
const formStatus = document.querySelector('.form-status');

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!formStatus) return;

  const formData = new FormData(contactForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message) {
    formStatus.textContent = 'Preencha todos os campos para continuar.';
    return;
  }

  const subject = encodeURIComponent(`Pedido de contacto — ${name}`);
  const body = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`);
  formStatus.textContent = 'A abrir o seu cliente de email...';
  window.location.href = `mailto:geral@akoyatelecom.com?subject=${subject}&body=${body}`;
});
