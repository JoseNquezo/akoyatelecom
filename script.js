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
const siteFooter = document.querySelector('.site-footer');
const footerBrandVisible = () => {
  if (!siteFooter) return;
  const footerTop = siteFooter.getBoundingClientRect().top;
  const footerVisible = footerTop <= window.innerHeight - 24;
  siteHeader?.classList.toggle('footer-visible', footerVisible);
  document.body.classList.toggle('footer-visible', footerVisible);
};
const updateHeader = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle('scrolled', window.scrollY > 24);
  footerBrandVisible();
};
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', footerBrandVisible, { passive: true });
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
      <svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="geometricPrecision"><path d="M12 2a10 10 0 0 0-8.49 15.27L2.1 22l4.86-1.27A10 10 0 1 0 12 2Zm0 18.1a8.07 8.07 0 0 1-4.11-1.13l-.3-.18-2.89.76.77-2.82-.19-.29A8.1 8.1 0 1 1 12 20.1Zm4.16-5.99c-.23-.12-1.35-.67-1.56-.74-.21-.08-.36-.12-.52.12-.15.23-.59.74-.72.89-.13.15-.27.17-.5.06-.23-.12-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.13-.23-.01-.35.1-.47.1-.1.23-.27.34-.4.11-.13.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.12-.52-1.24-.71-1.69-.19-.44-.38-.38-.52-.39h-.44c-.15 0-.4.06-.61.29-.21.23-.8.78-.8 1.9s.82 2.21.93 2.36c.12.15 1.61 2.46 3.91 3.45.55.24.98.38 1.31.48.55.17 1.05.15 1.44.09.44-.07 1.35-.55 1.54-1.08.19-.53.19-.98.13-1.08-.06-.1-.21-.15-.44-.27Z"/></svg>
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
