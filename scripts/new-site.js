(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const megaTriggers = [...document.querySelectorAll('[data-mega-trigger]')];
  const megaPanels = [...document.querySelectorAll('[data-mega]')];
  const mobileTrigger = document.querySelector('[data-mobile-trigger]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const menuScrim = document.querySelector('[data-menu-scrim]');
  const menuClose = document.querySelector('[data-menu-close]');
  const drawerLinks = [...document.querySelectorAll('[data-mobile-menu] a')];
  const drawerBody = document.querySelector('[data-drawer-body]');
  const drawerViews = [...document.querySelectorAll('[data-drawer-view]')];
  const drawerPhonesOpen = document.querySelector('[data-drawer-phones-open]');
  const drawerPhonesBack = document.querySelector('[data-drawer-phones-back]');
  const contactTrigger = document.querySelector('[data-contact-trigger]');
  const contactMenu = document.querySelector('[data-contact-menu]');
  const heroSlider = document.querySelector('[data-hero-slider]');
  const heroSlides = [...document.querySelectorAll('[data-hero-slide]')];
  const heroPrev = document.querySelector('[data-hero-prev]');
  const heroNext = document.querySelector('[data-hero-next]');
  const heroDots = [...document.querySelectorAll('[data-hero-dot]')];
  const heroCurrent = document.querySelector('[data-hero-current]');
  const scrollDock = document.querySelector('[data-scroll-dock]');
  const utilityDisclosures = [...document.querySelectorAll('[data-utility-disclosure]')];
  const accessibilityToggles = [...document.querySelectorAll('[data-accessibility-toggle]')];
  const accessibilityStorageKey = 'octagon-accessibility-mode';
  const hoverNavigation = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let megaCloseTimer;
  const menuBackgroundElements = new Set();

  const setMenuBackgroundInert = (inert) => {
    if (inert) {
      [...body.children].forEach((element) => {
        if (element === mobileMenu || element === menuScrim || element.hasAttribute('inert')) return;
        element.setAttribute('inert', '');
        menuBackgroundElements.add(element);
      });
      return;
    }

    menuBackgroundElements.forEach((element) => element.removeAttribute('inert'));
    menuBackgroundElements.clear();
  };

  const getMenuFocusable = () => {
    if (!mobileMenu) return [];
    return [...mobileMenu.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.closest('[inert]') && element.getClientRects().length > 0);
  };

  const setAccessibilityMode = (enabled) => {
    document.documentElement.dataset.accessibilityMode = String(enabled);
    accessibilityToggles.forEach((toggle) => {
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.setAttribute('aria-label', enabled
        ? 'Выключить версию для слабовидящих'
        : 'Включить версию для слабовидящих');
      toggle.setAttribute('title', enabled ? 'Обычная версия' : 'Версия для слабовидящих');
    });
  };

  try {
    setAccessibilityMode(window.localStorage.getItem(accessibilityStorageKey) === 'true');
  } catch {
    setAccessibilityMode(false);
  }

  utilityDisclosures.forEach((disclosure) => {
    disclosure.addEventListener('toggle', () => {
      if (!disclosure.open) return;
      utilityDisclosures.forEach((other) => {
        if (other !== disclosure) other.open = false;
      });
    });
  });

  accessibilityToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const enabled = document.documentElement.dataset.accessibilityMode !== 'true';
      setAccessibilityMode(enabled);
      try {
        window.localStorage.setItem(accessibilityStorageKey, String(enabled));
      } catch {
        // The mode still works for the current page when storage is unavailable.
      }
    });
  });

  const closeMegas = () => {
    window.clearTimeout(megaCloseTimer);
    megaTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    megaPanels.forEach((panel) => panel.setAttribute('aria-hidden', 'true'));
  };

  const setDrawerView = (name, { moveFocus = true } = {}) => {
    if (!drawerBody) return;
    drawerBody.dataset.view = name;
    drawerPhonesOpen?.setAttribute('aria-expanded', String(name === 'phones'));

    drawerViews.forEach((view) => {
      const active = view.dataset.drawerView === name;
      view.setAttribute('aria-hidden', String(!active));
      if (active) view.removeAttribute('inert');
      else view.setAttribute('inert', '');
    });

    const nextView = drawerViews.find((view) => view.dataset.drawerView === name);
    if (name === 'phones' && nextView) nextView.scrollTop = 0;

    if (!moveFocus) return;
    const focusTarget = name === 'phones' ? drawerPhonesBack : drawerPhonesOpen;
    requestAnimationFrame(() => focusTarget?.focus());
  };

  const setMenuOpen = (open, { moveFocus = true } = {}) => {
    mobileTrigger?.setAttribute('aria-expanded', String(open));
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    mobileMenu?.toggleAttribute('inert', !open);
    menuScrim?.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
    setMenuBackgroundInert(open);
    if (open) {
      setDrawerView('main', { moveFocus: false });
      const mainView = drawerViews.find((view) => view.dataset.drawerView === 'main');
      if (mainView) mainView.scrollTop = 0;
      closeMegas();
      utilityDisclosures.forEach((disclosure) => { disclosure.open = false; });
      setContactOpen(false);
      if (moveFocus) requestAnimationFrame(() => menuClose?.focus());
    } else {
      setDrawerView('main', { moveFocus: false });
    }
  };

  const setContactOpen = (open) => {
    contactTrigger?.setAttribute('aria-expanded', String(open));
    contactMenu?.setAttribute('aria-hidden', String(!open));
  };

  const openMega = (trigger) => {
    const name = trigger.dataset.megaTrigger;
    const panel = document.querySelector(`[data-mega="${name}"]`);
    if (!panel) return;
    closeMegas();
    trigger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
  };

  const cancelMegaClose = () => window.clearTimeout(megaCloseTimer);
  const scheduleMegaClose = () => {
    window.clearTimeout(megaCloseTimer);
    megaCloseTimer = window.setTimeout(closeMegas, 140);
  };

  megaTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (hoverNavigation.matches && event.detail > 0) {
        openMega(trigger);
        return;
      }
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      closeMegas();
      if (willOpen) openMega(trigger);
    });
    trigger.addEventListener('pointerenter', () => {
      if (!hoverNavigation.matches) return;
      cancelMegaClose();
      openMega(trigger);
    });
    trigger.addEventListener('pointerleave', () => {
      if (hoverNavigation.matches) scheduleMegaClose();
    });
    trigger.addEventListener('focus', () => openMega(trigger));
  });

  megaPanels.forEach((panel) => {
    panel.addEventListener('pointerenter', cancelMegaClose);
    panel.addEventListener('pointerleave', () => {
      if (hoverNavigation.matches) scheduleMegaClose();
    });
    panel.addEventListener('focusin', cancelMegaClose);
    panel.addEventListener('focusout', (event) => {
      const next = event.relatedTarget;
      if (!(next instanceof Element) || (!next.closest('[data-mega]') && !next.closest('[data-mega-trigger]'))) {
        scheduleMegaClose();
      }
    });
  });

  mobileTrigger?.addEventListener('click', () => {
    const willOpen = mobileTrigger.getAttribute('aria-expanded') !== 'true';
    setMenuOpen(willOpen);
  });
  mobileTrigger?.addEventListener('pointerenter', () => {
    if (!hoverNavigation.matches || mobileTrigger.getAttribute('aria-expanded') === 'true') return;
    setMenuOpen(true, { moveFocus: false });
  });

  menuClose?.addEventListener('click', () => {
    setMenuOpen(false);
    mobileTrigger?.focus();
  });
  menuScrim?.addEventListener('click', () => {
    setMenuOpen(false);
    mobileTrigger?.focus();
  });
  drawerLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
  drawerPhonesOpen?.addEventListener('click', () => setDrawerView('phones'));
  drawerPhonesBack?.addEventListener('click', () => setDrawerView('main'));

  contactTrigger?.addEventListener('click', () => {
    const willOpen = contactTrigger.getAttribute('aria-expanded') !== 'true';
    setContactOpen(willOpen);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    utilityDisclosures.forEach((disclosure) => {
      if (!disclosure.contains(target)) disclosure.open = false;
    });
    if (!target.closest('[data-mega]') && !target.closest('[data-mega-trigger]')) closeMegas();
    if (!target.closest('[data-contact-dock]')) {
      setContactOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    const menuWasOpen = mobileTrigger?.getAttribute('aria-expanded') === 'true';
    if (event.key === 'Tab' && menuWasOpen) {
      const focusable = getMenuFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (!mobileMenu?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (event.key !== 'Escape') return;
    utilityDisclosures.forEach((disclosure) => { disclosure.open = false; });
    closeMegas();
    if (menuWasOpen && drawerBody?.dataset.view === 'phones') {
      setDrawerView('main');
      setContactOpen(false);
      return;
    }
    setMenuOpen(false);
    setContactOpen(false);
    if (menuWasOpen) mobileTrigger?.focus();
  });

  const updateChrome = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    if (!scrollDock) return;
    const hero = document.querySelector('.n-home-hero');
    const threshold = hero ? Math.max(260, hero.getBoundingClientRect().height * .62) : 220;
    const visible = window.scrollY > threshold;
    scrollDock.classList.toggle('is-visible', visible);
    scrollDock.setAttribute('aria-hidden', String(!visible));
  };
  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((item) => observer.observe(item));
    body.classList.add('js-ready');
    requestAnimationFrame(() => revealItems.filter((item) => item.getBoundingClientRect().top < innerHeight).forEach((item) => item.classList.add('is-inview')));
  }

  const heroDecodeRuns = new WeakMap();
  const decodeHeading = (decodeTitle) => {
    if (!decodeTitle) return;
    const lines = [...decodeTitle.querySelectorAll('[data-decode-line]')];
    const glyphs = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789<>/+-=[]{}';
    const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];
    const setFinalText = () => lines.forEach((line) => { line.textContent = line.dataset.text || ''; });

    if (reduceMotion) {
      setFinalText();
      return;
    }

    const run = {};
    heroDecodeRuns.set(decodeTitle, run);
    decodeTitle.classList.add('is-decoding');
    const duration = 1080;
    const lineDelay = 72;
    const noiseInterval = 42;
    const startedAt = performance.now();
    let lastNoiseAt = -Infinity;

    const renderDecode = (now) => {
      if (heroDecodeRuns.get(decodeTitle) !== run) return;
      if (now - lastNoiseAt >= noiseInterval) {
        lines.forEach((line, lineIndex) => {
          const finalText = line.dataset.text || '';
          const elapsed = Math.max(0, now - startedAt - lineIndex * lineDelay);
          const progress = Math.min(1, elapsed / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const resolved = Math.floor(finalText.length * eased);
          const visibility = .08 + progress * .92;

          line.textContent = [...finalText].map((character, index) => {
            if (character === ' ') return ' ';
            if (index < resolved) return character;
            return Math.random() < visibility ? randomGlyph() : '\u00a0';
          }).join('');
        });
        lastNoiseAt = now;
      }

      const totalDuration = duration + (lines.length - 1) * lineDelay;
      if (now - startedAt < totalDuration) {
        requestAnimationFrame(renderDecode);
      } else {
        setFinalText();
        decodeTitle.classList.remove('is-decoding');
        heroDecodeRuns.delete(decodeTitle);
      }
    };

    requestAnimationFrame(renderDecode);
  };

  if (heroSlider && heroSlides.length) {
    let activeHeroIndex = Math.max(0, heroSlides.findIndex((slide) => slide.classList.contains('is-active')));

    const showHero = (index, focusDot = false) => {
      const nextIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, slideIndex) => {
        const active = slideIndex === nextIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      heroDots.forEach((dot, dotIndex) => {
        const active = dotIndex === nextIndex;
        dot.setAttribute('aria-selected', String(active));
        dot.tabIndex = active ? 0 : -1;
      });
      if (heroCurrent) heroCurrent.textContent = String(nextIndex + 1).padStart(2, '0');
      activeHeroIndex = nextIndex;
      decodeHeading(heroSlides[nextIndex]?.querySelector('[data-decode-title]'));
      if (focusDot) heroDots[nextIndex]?.focus();
    };

    heroPrev?.addEventListener('click', () => showHero(activeHeroIndex - 1));
    heroNext?.addEventListener('click', () => showHero(activeHeroIndex + 1));
    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => showHero(index));
      dot.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') showHero(0, true);
        else if (event.key === 'End') showHero(heroSlides.length - 1, true);
        else showHero(index + (event.key === 'ArrowRight' ? 1 : -1), true);
      });
    });
    showHero(activeHeroIndex);
  }

  const cardDecodeTargets = [...document.querySelectorAll('[data-card-decode]')];
  if (cardDecodeTargets.length) {
    const glyphs = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789<>/+-=[]{}';
    const activeRuns = new WeakMap();
    const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];

    const decodeCardText = (target) => {
      const finalText = target.dataset.text || '';
      if (reduceMotion) {
        target.textContent = finalText;
        return;
      }

      const run = {};
      activeRuns.set(target, run);
      const duration = 560;
      const noiseInterval = 38;
      const startedAt = performance.now();
      let lastNoiseAt = -Infinity;

      const renderDecode = (now) => {
        if (activeRuns.get(target) !== run) return;

        if (now - lastNoiseAt >= noiseInterval) {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const resolved = Math.floor(finalText.length * eased);
          const visibility = .12 + progress * .88;

          target.textContent = [...finalText].map((character, index) => {
            if (character === ' ') return ' ';
            if (index < resolved) return character;
            return Math.random() < visibility ? randomGlyph() : '\u00a0';
          }).join('');
          lastNoiseAt = now;
        }

        if (now - startedAt < duration) {
          requestAnimationFrame(renderDecode);
        } else {
          target.textContent = finalText;
          activeRuns.delete(target);
        }
      };

      requestAnimationFrame(renderDecode);
    };

    cardDecodeTargets.forEach((target) => {
      const card = target.closest('.n-path');
      if (!card) return;
      card.addEventListener('pointerenter', () => {
        if (hoverNavigation.matches) decodeCardText(target);
      });
      card.addEventListener('focus', () => decodeCardText(target));
    });
  }

  const trainingSnap = document.querySelector('[data-training-snap]');
  const compactTrainingViewport = window.matchMedia('(max-height: 620px)');
  if (trainingSnap && !reduceMotion) {
    const snapWindow = trainingSnap.querySelector('[data-training-window]');
    const snapItems = [...trainingSnap.querySelectorAll('[data-training-item]')];
    const snapCounter = trainingSnap.querySelector('[data-training-counter]');
    const snapProgress = trainingSnap.querySelector('[data-training-progress]');
    let activeIndex = -1;
    let snapScheduled = false;

    const showStaticOffers = () => {
      trainingSnap.classList.remove('is-enhanced');
      activeIndex = -1;
      snapItems.forEach((item) => {
        item.style.removeProperty('--snap-title-size');
        item.classList.remove('is-active');
        item.removeAttribute('aria-hidden');
        item.removeAttribute('tabindex');
      });
      if (snapCounter) snapCounter.textContent = '01';
    };

    const fitSnapItems = () => {
      if (!snapWindow || !snapItems.length || compactTrainingViewport.matches) {
        showStaticOffers();
        return;
      }

      trainingSnap.classList.add('is-enhanced');
      // Keep the entire active offer inside the opaque part of the edge mask.
      const heightBudget = Math.floor(snapWindow.clientHeight * .72);
      let allFit = true;
      snapItems.forEach((item) => {
        item.style.removeProperty('--snap-title-size');
        const title = item.querySelector('strong');
        if (!title) return;
        const baseSize = parseFloat(getComputedStyle(title).fontSize);
        if (item.offsetHeight <= heightBudget) return;

        let low = Math.min(26, baseSize);
        let high = baseSize;
        item.style.setProperty('--snap-title-size', `${low}px`);
        if (item.offsetHeight > heightBudget) {
          allFit = false;
          return;
        }
        for (let step = 0; step < 7; step += 1) {
          const candidate = (low + high) / 2;
          item.style.setProperty('--snap-title-size', `${candidate}px`);
          if (item.offsetHeight <= heightBudget) low = candidate;
          else high = candidate;
        }
        item.style.setProperty('--snap-title-size', `${Math.floor(low * 10) / 10}px`);
      });
      if (!allFit) showStaticOffers();
    };

    const positionSnapItems = (nextIndex) => {
      if (!snapWindow || !snapItems.length) return;
      const scaleForDistance = (distance) => distance === 0 ? 1 : distance === 1 ? .7 : .58;
      const opacityForDistance = (distance) => distance === 0 ? 1 : distance === 1 ? .28 : distance === 2 ? .08 : 0;
      const gap = Math.max(22, Math.min(36, snapWindow.clientHeight * .075));
      const visualHeights = snapItems.map((item, index) => {
        const distance = Math.abs(index - nextIndex);
        return item.offsetHeight * scaleForDistance(distance);
      });
      const positions = new Array(snapItems.length).fill(0);

      for (let index = nextIndex - 1; index >= 0; index -= 1) {
        positions[index] = positions[index + 1]
          - visualHeights[index + 1] / 2
          - visualHeights[index] / 2
          - gap;
      }

      for (let index = nextIndex + 1; index < snapItems.length; index += 1) {
        positions[index] = positions[index - 1]
          + visualHeights[index - 1] / 2
          + visualHeights[index] / 2
          + gap;
      }

      snapItems.forEach((item, index) => {
        const delta = index - nextIndex;
        const distance = Math.abs(delta);
        const isActive = distance === 0;
        item.style.setProperty('--snap-y', `${positions[index]}px`);
        item.style.setProperty('--snap-x', `${Math.min(distance, 2) * 20}px`);
        item.style.setProperty('--snap-scale', String(scaleForDistance(distance)));
        item.style.setProperty('--snap-opacity', String(opacityForDistance(distance)));
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-hidden', String(!isActive));
        item.tabIndex = isActive ? 0 : -1;
      });
    };

    const renderTrainingSnap = () => {
      if (!trainingSnap.classList.contains('is-enhanced')) {
        snapScheduled = false;
        return;
      }
      const start = trainingSnap.offsetTop;
      const distance = Math.max(1, trainingSnap.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      const nextIndex = Math.round(progress * (snapItems.length - 1));

      if (snapProgress) snapProgress.style.setProperty('--snap-progress', String((nextIndex + 1) / snapItems.length));
      if (nextIndex !== activeIndex) {
        activeIndex = nextIndex;
        if (snapCounter) snapCounter.textContent = String(nextIndex + 1).padStart(2, '0');
        positionSnapItems(nextIndex);
      }
      snapScheduled = false;
    };

    const scheduleTrainingSnap = () => {
      if (snapScheduled) return;
      snapScheduled = true;
      requestAnimationFrame(renderTrainingSnap);
    };

    const layoutTrainingSnap = () => {
      fitSnapItems();
      activeIndex = -1;
      renderTrainingSnap();
    };

    layoutTrainingSnap();
    window.addEventListener('scroll', scheduleTrainingSnap, { passive: true });
    window.addEventListener('resize', () => {
      requestAnimationFrame(layoutTrainingSnap);
    });
    document.fonts?.ready.then(layoutTrainingSnap);
  }

  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      const note = form.querySelector('[data-form-note]');
      if (button) button.textContent = 'Заявка принята';
      if (note) note.textContent = 'Демонстрация: после интеграции данные будут передаваться менеджеру.';
      form.reset();
    });
  });
})();
