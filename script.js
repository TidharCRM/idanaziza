// =====================================================
// עידן עזיזה - Landing Page Interactions
// =====================================================

(() => {
  'use strict';

  // ----- page loader (1s logo intro) -----
  document.body.classList.add('is-loading');
  const loader = document.getElementById('pageLoader');
  const loaderStart = performance.now();
  const dismissLoader = () => {
    if (!loader) {
      document.body.classList.remove('is-loading');
      return;
    }
    const elapsed = performance.now() - loaderStart;
    const wait = Math.max(0, 1000 - elapsed);
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, wait);
  };
  if (document.readyState === 'complete') {
    dismissLoader();
  } else {
    window.addEventListener('load', dismissLoader, { once: true });
    // safety: don't get stuck if load never fires (e.g., a hung resource)
    setTimeout(dismissLoader, 4000);
  }

  // ----- year in footer -----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- header scroll state -----
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- mobile nav toggle -----
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ----- expandable cards (audience / method / process) -----
  const expandableSelector = '.audience-card, .method-card, .process-step';
  document.querySelectorAll(expandableSelector).forEach(card => {
    const para = card.querySelector('p');
    if (!para) return;

    // wrap the existing <p> as the truncated body
    const body = document.createElement('div');
    body.className = 'card-body';
    para.parentNode.insertBefore(body, para);
    body.appendChild(para);

    // append the toggle indicator
    const toggle = document.createElement('span');
    toggle.className = 'card-toggle';
    const label = document.createElement('span');
    label.className = 'card-toggle-label';
    label.textContent = 'קרא עוד';
    toggle.appendChild(label);
    card.appendChild(toggle);

    card.classList.add('card-expandable');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');

    const toggleCard = () => {
      const expanded = card.classList.toggle('is-expanded');
      card.setAttribute('aria-expanded', String(expanded));
      label.textContent = expanded ? 'הצג פחות' : 'קרא עוד';
    };
    card.addEventListener('click', (e) => {
      // don't trigger when clicking links/buttons inside the card (none currently, but future-proof)
      if (e.target.closest('a, button')) return;
      toggleCard();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard();
      }
    });
  });

  // ----- FAQ accordion -----
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        a.style.maxHeight = a.scrollHeight + 'px';
      } else {
        a.style.maxHeight = '0';
      }
    });
  });

  // recompute open FAQ height on resize (in case content reflows)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('.faq-item.is-open .faq-a').forEach(a => {
        a.style.maxHeight = a.scrollHeight + 'px';
      });
    }, 120);
  });

  // ----- contact form (no backend - just UX) -----
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      // basic native validation hook
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      // optional: build a wa.me deep-link as a fallback so the message goes somewhere
      const data = new FormData(form);
      const lines = [
        `שלום עידן, פנייה מהאתר:`,
        `שם: ${data.get('name') || ''}`,
        `טלפון: ${data.get('phone') || ''}`,
        data.get('email') ? `אימייל: ${data.get('email')}` : null,
        `נושא: ${data.get('topic') || ''}`,
        data.get('message') ? `הודעה: ${data.get('message')}` : null,
      ].filter(Boolean);
      const waUrl = `https://wa.me/972500000000?text=${encodeURIComponent(lines.join('\n'))}`;

      if (success) {
        success.hidden = false;
      }
      form.reset();
      // open WhatsApp with prefilled message in a new tab
      window.open(waUrl, '_blank', 'noopener');
    });
  }

  // ----- reveal-on-scroll -----
  const revealTargets = document.querySelectorAll(
    '.section-head, .method-card, .audience-card, .process-step, .testimonial, .about-copy, .about-visual, .contact-info, .contact-form, .trust-item'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  // ----- smooth-scroll offset for sticky header on hash links -----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
