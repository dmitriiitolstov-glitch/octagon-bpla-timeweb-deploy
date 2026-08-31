const c2MenuButton = document.querySelector('[data-c2-menu]');
const c2MobileNav = document.querySelector('[data-c2-mobile-nav]');

c2MenuButton?.addEventListener('click', () => {
  const open = c2MobileNav?.classList.toggle('is-open');
  c2MenuButton.setAttribute('aria-expanded', String(Boolean(open)));
  c2MobileNav?.setAttribute('aria-hidden', String(!open));
});

c2MobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  c2MobileNav.classList.remove('is-open');
  c2MenuButton?.setAttribute('aria-expanded', 'false');
  c2MobileNav.setAttribute('aria-hidden', 'true');
}));

const c2ContactButton = document.querySelector('[data-c2-contact-button]');
const c2ContactPanel = document.querySelector('[data-c2-contact-panel]');

c2ContactButton?.addEventListener('click', () => {
  const open = c2ContactPanel?.classList.toggle('is-open');
  c2ContactButton.setAttribute('aria-expanded', String(Boolean(open)));
  c2ContactPanel?.setAttribute('aria-hidden', String(!open));
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Node)) return;
  if (!c2ContactPanel?.contains(event.target) && !c2ContactButton?.contains(event.target)) {
    c2ContactPanel?.classList.remove('is-open');
    c2ContactButton?.setAttribute('aria-expanded', 'false');
    c2ContactPanel?.setAttribute('aria-hidden', 'true');
  }
});

const c2RevealItems = document.querySelectorAll('[data-c2-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('c2-motion');
  const c2Observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        c2Observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -5% 0px' });
  c2RevealItems.forEach((item) => c2Observer.observe(item));
}

const c2Form = document.querySelector('[data-c2-form]');
c2Form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = c2Form.querySelector('button[type="submit"]');
  const note = c2Form.querySelector('[data-c2-form-note]');
  if (button) button.innerHTML = 'Запрос подготовлен <span>✓</span>';
  if (note) note.textContent = 'Это прототип: после согласования подключим реальную передачу заявки.';
});
