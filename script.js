const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 48);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Deschide meniul' : 'Închide meniul');
  nav.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Deschide meniul');
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
}));

if (!reduceMotion) {
  document.querySelectorAll('.hero .reveal').forEach((element) => element.classList.add('visible'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  document.querySelectorAll('.reveal:not(.hero .reveal)').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
    observer.observe(element);
  });

  const heroImage = document.querySelector('.hero-image');
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      heroImage.style.transform = `scale(1.02) translateY(${window.scrollY * 0.08}px)`;
    }
  }, { passive: true });
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
}

const slider = document.querySelector('[data-drag-scroll]');
const staticPalette = window.matchMedia('(max-width: 760px)');
let isDown = false;
let lastX = 0;
let lastTime = 0;
let targetScroll = slider.scrollLeft;
let velocity = 0;
let slideFrame = 0;

slider.addEventListener('dragstart', (event) => event.preventDefault());

const maxSliderScroll = () => Math.max(0, slider.scrollWidth - slider.clientWidth);
const clampSliderScroll = (value) => Math.min(maxSliderScroll(), Math.max(0, value));

const animateSlider = () => {
  const distance = targetScroll - slider.scrollLeft;

  if (isDown) {
    slider.scrollLeft += distance * 0.28;
  } else if (!reduceMotion) {
    targetScroll = clampSliderScroll(targetScroll + velocity);
    velocity *= 0.92;
    slider.scrollLeft += (targetScroll - slider.scrollLeft) * 0.22;

    if (targetScroll === 0 || targetScroll === maxSliderScroll()) {
      velocity *= 0.45;
    }
  } else {
    slider.scrollLeft = targetScroll;
    velocity = 0;
  }

  const stillMoving = isDown
    ? Math.abs(targetScroll - slider.scrollLeft) > 0.35
    : Math.abs(velocity) > 0.08 || Math.abs(targetScroll - slider.scrollLeft) > 0.5;

  if (stillMoving) {
    slideFrame = requestAnimationFrame(animateSlider);
  } else {
    slider.scrollLeft = targetScroll;
    slider.classList.remove('gliding');
    slideFrame = 0;
  }
};

const requestSlideFrame = () => {
  if (!slideFrame) slideFrame = requestAnimationFrame(animateSlider);
};

slider.addEventListener('pointerdown', (event) => {
  if (staticPalette.matches) return;
  isDown = true;
  lastX = event.clientX;
  lastTime = performance.now();
  targetScroll = slider.scrollLeft;
  velocity = 0;
  slider.classList.add('dragging');
  slider.classList.remove('gliding');
  slider.setPointerCapture(event.pointerId);
});

slider.addEventListener('pointermove', (event) => {
  if (staticPalette.matches || !isDown) return;

  const now = performance.now();
  const movement = -(event.clientX - lastX) * 1.15;
  const elapsed = Math.max(1, now - lastTime);
  const frameVelocity = movement / elapsed * 16.67;

  targetScroll = clampSliderScroll(targetScroll + movement);
  velocity = velocity * 0.68 + frameVelocity * 0.32;
  lastX = event.clientX;
  lastTime = now;
  requestSlideFrame();
});

const endDrag = () => {
  if (!isDown) return;
  isDown = false;
  slider.classList.remove('dragging');
  slider.classList.add('gliding');
  targetScroll = slider.scrollLeft;
  requestSlideFrame();
};
slider.addEventListener('pointerup', endDrag);
slider.addEventListener('pointercancel', endDrag);

staticPalette.addEventListener('change', (event) => {
  if (!event.matches) return;
  isDown = false;
  velocity = 0;
  targetScroll = 0;
  cancelAnimationFrame(slideFrame);
  slideFrame = 0;
  slider.scrollLeft = 0;
  slider.classList.remove('dragging', 'gliding');
});

const form = document.querySelector('[data-form]');
const formStatus = document.querySelector('[data-form-status]');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.textContent = 'Mulțumim! Solicitarea este pregătită. Conectează formularul la serviciul tău de email pentru trimitere.';
  form.reset();
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
