// Nexora interactions: mobile navigation, reveal motion, counters, and demo forms.
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    });
    const closeMenu = () => {
      nav.classList.remove('nav-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 850) closeMenu();
    });
  }


  // Subtle premium polish: scroll progress and an accessible back-to-top control.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const topButton = document.createElement('button');
  topButton.className = 'back-to-top';
  topButton.type = 'button';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.innerHTML = '↑';
  document.body.appendChild(topButton);
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  let scrollTicking = false;
  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${percent}%`;
    topButton.classList.toggle('is-visible', window.scrollY > 520);
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  // Gentle cursor-position highlight on larger interactive cards.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.feature-card, .usecase-card, .price-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else revealEls.forEach(el => el.classList.add('is-visible'));

  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target, target = Number(el.dataset.count);
        const start = performance.now(), duration = 900;
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick); counterObserver.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterObserver.observe(el));
  } else counters.forEach(el => el.textContent = el.dataset.count);

  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const msg = form.parentElement.querySelector('.form-message');
      if (msg) msg.textContent = 'Thanks for your interest! This demo form is not connected to a mailing list.';
      form.reset();
    });
  });

  const contact = document.querySelector('#contact-form');
  if (contact) contact.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.querySelector('#contact-message');
    if (message) message.textContent = 'Thanks! This is a front-end demo, so your message was not sent or stored.';
    contact.reset();
  });

  // Pricing toggle updates the illustrative prices; no billing or checkout is connected.
  const billing = document.querySelector('.billing-toggle');
  if (billing) {
    const options = [...billing.querySelectorAll('span')];
    const prices = [...document.querySelectorAll('.price strong')].filter(el => el.textContent.includes('₹'));
    const monthlyValues = ['799', '1,999'];
    const yearlyValues = ['639', '1,599'];
    const setBilling = yearly => {
      options.forEach((item, index) => {
        item.classList.toggle('billing-active', index === (yearly ? 1 : 0));
        item.setAttribute('aria-pressed', String(index === (yearly ? 1 : 0)));
      });
      prices.forEach((el, index) => {
        if (index < 2) el.textContent = `₹${(yearly ? yearlyValues : monthlyValues)[index]}`;
      });
      document.querySelectorAll('.price span').forEach(el => { el.textContent = yearly ? '/ month, billed yearly' : '/ month'; });
    };
    options.forEach((option, index) => {
      option.setAttribute('role', 'button');
      option.setAttribute('tabindex', '0');
      option.addEventListener('click', () => setBilling(index === 1));
      option.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setBilling(index === 1); }
      });
    });
    setBilling(false);
  }
})();