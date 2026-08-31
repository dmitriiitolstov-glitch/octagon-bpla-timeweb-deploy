const body = document.body;
const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');

menuButton?.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  mobileNav?.setAttribute('aria-hidden', String(!open));
});

document.querySelectorAll('[data-mobile-nav] a').forEach((link) => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileNav?.setAttribute('aria-hidden', 'true');
  });
});

const contactButton = document.querySelector('[data-contact-button]');
const contactPanel = document.querySelector('[data-contact-panel]');
const contactDock = document.querySelector('.contact-dock');
contactButton?.addEventListener('click', () => {
  const open = contactPanel?.classList.toggle('is-open');
  contactButton.setAttribute('aria-expanded', String(Boolean(open)));
  contactPanel?.setAttribute('aria-hidden', String(!open));
});

const requestForm = document.querySelector('.request-form');
if (requestForm && contactDock && 'IntersectionObserver' in window) {
  const formObserver = new IntersectionObserver(([entry]) => {
    contactDock.classList.toggle('is-obscured', entry.isIntersecting);
  }, { threshold: 0.25 });
  formObserver.observe(requestForm);
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!contactPanel?.contains(target) && !contactButton?.contains(target)) {
    contactPanel?.classList.remove('is-open');
    contactButton?.setAttribute('aria-expanded', 'false');
    contactPanel?.setAttribute('aria-hidden', 'true');
  }
});

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('has-motion');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach((item) => observer.observe(item));
}

const demoForm = document.querySelector('[data-demo-form]');
demoForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const submit = demoForm.querySelector('button[type="submit"]');
  if (submit) submit.textContent = 'Заявка подготовлена';
  const note = demoForm.querySelector('[data-form-note]');
  if (note) note.textContent = 'Прототип: на следующем этапе подключим отправку в CRM.';
});
