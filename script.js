/* ============================================================
   AVIATE GYM — script.js
   Covers:
   1.  Preloader
   2.  Header scroll state + active nav link
   3.  Mobile navigation
   4.  Smooth scrolling
   5.  Scroll reveal animations
   6.  Hero video autoplay safeguard
   7.  Showcase Swiper slider
   8.  Gallery lightbox
   9.  Video player (360 tour)
   10. Booking form validation
   11. Online coaching AI survey
   12. Coaching form + WhatsApp export
   13. Footer year
============================================================ */

'use strict';

/* ============================================================
   UTILITY
============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const pad = n => String(n).padStart(2, '0');


/* ============================================================
   1. PRELOADER — Cinematic split-panel exit
   Timeline:
     0.5s  → "GOKUL SRINIVASAN'S" slides up
     1.1s  → divider line draws in
     1.25s → logo scales in with blur
     2.0s  → progress bar appears
     2.1s  → fill runs 1s → done at 3.1s
     3.3s  → split panels fly apart
============================================================ */
(function initPreloader() {
  const preloader  = document.getElementById('preloader');
  if (!preloader) return;

  const percentEl = document.getElementById('pl-percent');
  const MIN_SHOW  = 3300; // ms — enough for all animations
  const startTime = Date.now();

  // Animated percentage counter 0→100
  let pct = 0;
  const pctInterval = setInterval(() => {
    // Ease-out style: faster at start, slow at end
    const elapsed = Date.now() - startTime;
    pct = Math.min(100, Math.round((elapsed / MIN_SHOW) * 100 * 1.05));
    if (percentEl) percentEl.textContent = pct + '%';
    if (pct >= 100) clearInterval(pctInterval);
  }, 40);

  function hidePreloader() {
    clearInterval(pctInterval);
    if (percentEl) percentEl.textContent = '100%';

    // Trigger split-panel exit
    preloader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');

    // Remove from DOM after panels have flown away (~1s)
    setTimeout(() => {
      if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }, 1100);
  }

  const elapsed = () => Date.now() - startTime;

  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, Math.max(0, MIN_SHOW - elapsed()));
  } else {
    window.addEventListener('load', () => {
      setTimeout(hidePreloader, Math.max(0, MIN_SHOW - elapsed()));
    });
  }
})();


/* ============================================================
   2. HEADER SCROLL STATE + ACTIVE NAV LINK
============================================================ */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const THRESHOLD = 64;

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mark active page link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav__link, .site-footer__nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.classList.add('is-active');
    }
  });
})();


/* ============================================================
   3. MOBILE NAVIGATION
============================================================ */
(function initMobileNav() {
  const hamburger  = $('.nav__hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const open = () => {
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () =>
    hamburger.getAttribute('aria-expanded') === 'true' ? close() : open()
  );

  $$('.mobile-menu__link').forEach(link => link.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      close();
      hamburger.focus();
    }
  });
})();


/* ============================================================
   4. SMOOTH SCROLLING (anchor links only)
============================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (document.getElementById('site-header')?.offsetHeight ?? 78);
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
})();


/* ============================================================
   5. SCROLL REVEAL
============================================================ */
(function initScrollReveal() {
  const els = $$('.reveal, .reveal-stagger');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();


/* ============================================================
   6. HERO VIDEO AUTOPLAY SAFEGUARD
============================================================ */
(function initHeroVideo() {
  const video = $('.hero__video');
  if (!video) return;

  video.muted = true;
  video.play().catch(() => {
    document.addEventListener('pointerdown', () => video.play().catch(() => {}), { once: true });
  });

  const hero = $('.hero');
  if (!hero) return;

  new IntersectionObserver(([entry]) => {
    entry.isIntersecting ? video.play().catch(() => {}) : video.pause();
  }, { threshold: 0.05 }).observe(hero);
})();


/* ============================================================
   7. SHOWCASE SWIPER SLIDER
============================================================ */
(function initShowcaseSwiper() {
  const swiperEl = document.querySelector('.showcase-swiper');
  if (!swiperEl || typeof Swiper === 'undefined') return;

  const currentEl = document.getElementById('showcase-current');
  const totalEl   = swiperEl.querySelector('.showcase-counter__total');

  const swiper = new Swiper('.showcase-swiper', {
    loop: true,
    speed: 900,
    grabCursor: true,
    effect: 'slide',

    // Fade between slide images via CSS class + JS
    on: {
      slideChange() {
        if (currentEl) {
          currentEl.textContent = pad(this.realIndex + 1);
        }
      },
      init() {
        if (currentEl) currentEl.textContent = '01';
        if (totalEl)   totalEl.textContent = pad(this.slides.length - (this.loopedSlides * 2 || 0));
      }
    },

    pagination: {
      el: '.showcase-pagination',
      clickable: true,
    },

    navigation: {
      prevEl: '.showcase-btn-prev',
      nextEl: '.showcase-btn-next',
    },

    keyboard: { enabled: true },

    autoplay: {
      delay: 5500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    a11y: {
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
    },
  });

  // Pause autoplay when tab not visible
  document.addEventListener('visibilitychange', () => {
    document.hidden ? swiper.autoplay.stop() : swiper.autoplay.start();
  });
})();


/* ============================================================
   8. GALLERY LIGHTBOX
============================================================ */
(function initLightbox() {
  // Build overlay
  const overlay  = document.createElement('div');
  overlay.id     = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Photo lightbox');

  const img = document.createElement('img');
  img.id    = 'lb-img';
  img.alt   = '';

  const closeBtn = document.createElement('button');
  closeBtn.id        = 'lb-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close lightbox');

  overlay.appendChild(closeBtn);
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt || 'Gallery photo';
    overlay.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    overlay.classList.remove('lb-open');
    img.src = '';
    document.body.style.overflow = '';
  };

  // Attach to all gallery images
  const selectors = [
    '.gallery-spotlight',
    '.gallery-item',
    '.gallery-featured',
    '.gallery-page__item',
    '.showcase-slide__img'
  ];

  selectors.forEach(sel => {
    $$(sel).forEach(el => {
      const imgEl = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!imgEl) return;
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', () => open(imgEl.src, imgEl.alt));
    });
  });

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('lb-open')) close();
  });
})();


/* ============================================================
   9. VIDEO PLAYER (360 gym tour / showcase)
============================================================ */
(function initVideoPlayer() {
  $$('.video-player').forEach(player => {
    const video   = player.querySelector('.video-player__media');
    const playBtn = player.querySelector('.video-player__play-btn');
    if (!video || !playBtn) return;

    playBtn.addEventListener('click', () => {
      video.play();
      player.classList.add('is-playing');
    });

    video.addEventListener('click', () => {
      if (!video.paused) {
        video.pause();
        player.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', () => player.classList.remove('is-playing'));
  });
})();


/* ============================================================
   10. BOOKING FORM VALIDATION
============================================================ */
(function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const rules = {
    'field-first-name': { required: true,  label: 'First name' },
    'field-last-name':  { required: true,  label: 'Last name' },
    'field-email':      { required: true,  label: 'Email address', email: true },
    'field-phone':      { required: false, label: 'Phone number' },
    'field-program':    { required: true,  label: 'Program' },
    'field-date':       { required: true,  label: 'Preferred date', future: true },
  };

  function getError(el, rule) {
    const val = el.value.trim();
    if (rule.required && !val)       return `${rule.label} is required.`;
    if (rule.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
                                     return 'Please enter a valid email address.';
    if (rule.future && val) {
      const today = new Date(); today.setHours(0,0,0,0);
      if (new Date(val) < today)     return 'Please choose a future date.';
    }
    return '';
  }

  function validateField(el, rule) {
    const errEl = el.closest('.booking-form__field')?.querySelector('.booking-form__error');
    const msg   = getError(el, rule);
    el.classList.toggle('is-invalid', !!msg);
    if (errEl) errEl.textContent = msg;
    return !msg;
  }

  const dateEl = document.getElementById('field-date');
  if (dateEl) dateEl.min = new Date().toISOString().split('T')[0];

  Object.entries(rules).forEach(([id, rule]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => validateField(el, rule));
    el.addEventListener('input', () => el.classList.contains('is-invalid') && validateField(el, rule));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    Object.entries(rules).forEach(([id, rule]) => {
      const el = document.getElementById(id);
      if (el && !validateField(el, rule)) valid = false;
    });

    if (!valid) {
      form.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const wrap = form.closest('.booking__form-wrap') || form.parentElement;
    wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:1.25rem;
                  padding:3.5rem 2rem;border:1px solid #e2dfd9;background:#fff;text-align:center;">
        <p style="font-family:'Rajdhani',sans-serif;font-size:0.65rem;letter-spacing:0.35em;
                  text-transform:uppercase;color:#c9a96e;">Session Requested</p>
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:2.6rem;
                  font-weight:300;line-height:1.1;color:#0f0f0f;">
          We'll be in touch<br>shortly.
        </p>
        <p style="font-family:'DM Sans',sans-serif;font-size:0.9375rem;font-weight:300;
                  color:#6b6760;line-height:1.75;max-width:36ch;margin:0 auto;">
          Thank you. A member of the Aviate team will confirm your free session within 24 hours.
        </p>
        <a href="index.html" style="margin-top:1rem;font-family:'Rajdhani',sans-serif;
           font-size:0.7rem;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;
           color:#c9a96e;border-bottom:1px solid #c9a96e;padding-bottom:2px;">
          ← Back to Home
        </a>
      </div>`;
  });
})();


/* ============================================================
   11. ONLINE COACHING — AI SURVEY
   Step flow:
     Step 1: Goal selection (program type)
     Step 2: Gender
     Step 3: Experience level
     Step 4: Timeline / commitment
     → Result: AI recommendation
     → Then: Full intake form
============================================================ */
(function initAISurvey() {
  const surveyCard = document.getElementById('survey-card');
  if (!surveyCard) return;

  // Survey data
  const questions = [
    {
      id: 'goal',
      label: 'Question 1 of 4',
      text: 'What is your primary fitness goal?',
      type: 'options',
      options: [
        { value: 'recomp',   label: 'Lose fat & build lean muscle (Body Recomposition)' },
        { value: 'pcod',     label: 'Fix hormones, burn stubborn fat (PCOD / Thyroid)' },
        { value: 'weightloss', label: 'Drop unwanted fat & boost confidence (Weight Loss)' },
        { value: 'lean',     label: 'Gain lean muscle, look athletic (Lean Gaining)' },
        { value: 'fatloss',  label: 'Rebuild strength, tone & feel energetic (Fat Loss Transformation)' },
      ]
    },
    {
      id: 'gender',
      label: 'Question 2 of 4',
      text: 'What is your gender?',
      type: 'options',
      options: [
        { value: 'male',   label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other',  label: 'Prefer not to say' },
      ]
    },
    {
      id: 'experience',
      label: 'Question 3 of 4',
      text: 'What is your current fitness experience level?',
      type: 'options',
      options: [
        { value: 'beginner',     label: 'Beginner — I\'m just starting out' },
        { value: 'intermediate', label: 'Intermediate — I train occasionally' },
        { value: 'advanced',     label: 'Advanced — I train regularly' },
      ]
    },
    {
      id: 'timeline',
      label: 'Question 4 of 4',
      text: 'How committed are you to your transformation?',
      type: 'options',
      options: [
        { value: '4months',    label: '4 months — I want fast, visible results' },
        { value: '6months',    label: '6 months — I\'m ready for a real transformation' },
        { value: 'ongoing',   label: 'Long-term — I want sustainable, lasting change' },
      ]
    }
  ];

  // Program recommendations engine
  const recommend = answers => {
    const { goal, gender, experience, timeline } = answers;

    const programs = {
      recomp: {
        name: 'Body Recomposition Program',
        duration: '6 Months',
        reason: 'Based on your goal to lose chest fat, build lean muscle and reshape your physique, the Body Recomposition program is your ideal match. It combines strategic nutrition and progressive training to transform your body composition simultaneously.'
      },
      pcod: {
        name: 'PCOD / Thyroid Fat Loss Program',
        duration: '6 Months',
        reason: 'Your goal to fix hormones and burn stubborn fat requires a specialised approach. This program is designed specifically around hormonal health — targeting the root cause, not just symptoms — to get you toned naturally.'
      },
      weightloss: {
        name: timeline === '4months' ? 'Weight Loss Program (4 Months)' : 'Weight Loss Program (6 Months)',
        duration: timeline === '4months' ? '4 Months' : '6 Months',
        reason: 'You want to drop unwanted fat fast and boost your confidence. Our Weight Loss program delivers rapid, visible results through science-backed protocols tailored to your schedule and lifestyle.'
      },
      lean: {
        name: 'Lean Gaining Program',
        duration: '6 Months',
        reason: 'Your goal is to gain lean muscle without unnecessary fat and achieve an athletic, defined look. The Lean Gaining program uses precision nutrition and hypertrophy training to build the physique you envision.'
      },
      fatloss: {
        name: 'Fat Loss Transformation Program',
        duration: '6 Months',
        reason: 'You want to rebuild strength, tone your body and feel confident and full of energy. The Fat Loss Transformation program is built for exactly this — a complete physical and mental overhaul in 6 months.'
      }
    };

    // Override for female + pcod hint
    if (gender === 'female' && (goal === 'weightloss' || goal === 'recomp')) {
      return {
        ...programs[goal],
        reason: programs[goal].reason + ' For women, we additionally factor in hormonal cycles and optimise training phases accordingly.'
      };
    }

    return programs[goal] || programs.recomp;
  };

  // State
  let currentStep = 0;
  const answers   = {};
  const totalSteps = questions.length;

  // DOM refs
  const stepsContainer = surveyCard.querySelector('.survey-steps');
  const questionsWrap  = surveyCard.querySelector('.survey-questions');
  const resultWrap     = surveyCard.querySelector('.survey-result');

  if (!stepsContainer || !questionsWrap || !resultWrap) return;

  // Build step indicators
  stepsContainer.innerHTML = '';
  questions.forEach((_, i) => {
    const step = document.createElement('div');
    step.className = 'survey-step' + (i === 0 ? ' is-active' : '');
    step.setAttribute('aria-label', `Step ${i + 1}`);
    stepsContainer.appendChild(step);
  });

  // Build question elements
  questionsWrap.innerHTML = '';
  questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className  = 'survey-question' + (i === 0 ? ' is-active' : '');
    div.id         = `sq-${q.id}`;
    div.innerHTML  = `
      <p class="survey-q-label">${q.label}</p>
      <h3 class="survey-q-text">${q.text}</h3>
      <div class="survey-options" role="group" aria-label="${q.text}">
        ${q.options.map(opt => `
          <button
            class="survey-option"
            data-value="${opt.value}"
            aria-pressed="false"
            type="button"
          >${opt.label}</button>
        `).join('')}
      </div>
      <div class="survey-nav">
        <button class="survey-nav__back" type="button" ${i === 0 ? 'style="visibility:hidden"' : ''}>
          ← Back
        </button>
        <button class="btn btn--primary survey-nav__next" type="button" disabled>
          ${i === totalSteps - 1 ? 'Get My Recommendation →' : 'Next →'}
        </button>
      </div>`;
    questionsWrap.appendChild(div);
  });

  // Update step indicators
  const updateSteps = () => {
    $$('.survey-step', stepsContainer).forEach((step, i) => {
      step.className = 'survey-step' +
        (i < currentStep ? ' is-done' :
         i === currentStep ? ' is-active' : '');
    });
  };

  // Navigate to step
  const goToStep = stepIndex => {
    $$('.survey-question', questionsWrap).forEach((el, i) => {
      el.classList.toggle('is-active', i === stepIndex);
    });
    currentStep = stepIndex;
    updateSteps();
  };

  // Show result
  const showResult = () => {
    questionsWrap.style.display = 'none';
    stepsContainer.style.display = 'none';
    resultWrap.classList.add('is-active');

    const rec = recommend(answers);

    resultWrap.innerHTML = `
      <p class="survey-result__label">Your AI Recommendation</p>
      <h3 class="survey-result__heading">We've found<br />your perfect program.</h3>
      <div>
        <span class="survey-result__program">${rec.name}</span>
        <span style="display:block;margin-top:0.5rem;font-family:'Rajdhani',sans-serif;
          font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;
          color:rgba(255,255,255,0.35);">Duration: ${rec.duration}</span>
      </div>
      <p class="survey-result__reason">${rec.reason}</p>
      <div class="survey-result__actions">
        <a href="#coaching-form-section"
           class="btn btn--gold btn--large"
           onclick="document.getElementById('coaching-form-section').scrollIntoView({behavior:'smooth'});
                    document.getElementById('cf-program').value='${rec.name}';
                    return false;">
          Start My ${rec.duration} Journey →
        </a>
        <button class="btn btn--outline-light" type="button" onclick="location.reload()">
          Retake Survey
        </button>
      </div>
      <p style="margin-top:1rem;font-family:'DM Sans',sans-serif;font-size:0.78rem;
         font-weight:300;color:rgba(255,255,255,0.28);line-height:1.6;">
        ✦ AI-powered recommendation based on your answers. Your coach will finalise the program after reviewing your full intake form.
      </p>`;

    // Pre-fill the program in form
    const cfProgram = document.getElementById('cf-program');
    if (cfProgram) cfProgram.value = rec.name;
  };

  // Event delegation for option selection
  questionsWrap.addEventListener('click', e => {
    const opt = e.target.closest('.survey-option');
    if (!opt) return;

    const question = opt.closest('.survey-question');
    const qIndex   = [...questionsWrap.children].indexOf(question);
    const qData    = questions[qIndex];

    // Deselect others, select clicked
    $$('.survey-option', question).forEach(o => {
      o.classList.remove('is-selected');
      o.setAttribute('aria-pressed', 'false');
    });
    opt.classList.add('is-selected');
    opt.setAttribute('aria-pressed', 'true');

    // Store answer
    answers[qData.id] = opt.dataset.value;

    // Enable next button
    const nextBtn = question.querySelector('.survey-nav__next');
    if (nextBtn) nextBtn.disabled = false;
  });

  // Next / Back navigation
  questionsWrap.addEventListener('click', e => {
    const nextBtn = e.target.closest('.survey-nav__next');
    const backBtn = e.target.closest('.survey-nav__back');

    if (nextBtn && !nextBtn.disabled) {
      if (currentStep < totalSteps - 1) {
        goToStep(currentStep + 1);
      } else {
        showResult();
      }
    }

    if (backBtn && currentStep > 0) {
      goToStep(currentStep - 1);
    }
  });
})();


/* ============================================================
   12. COACHING INTAKE FORM + WHATSAPP / FILE EXPORT
============================================================ */
(function initCoachingForm() {
  const form = document.getElementById('coaching-intake-form');
  if (!form) return;

  // Required fields
  const requiredFields = [
    'cf-name', 'cf-age', 'cf-country', 'cf-city',
    'cf-gender', 'cf-weight', 'cf-height',
    'cf-phone-wa', 'cf-phone-call',
    'cf-program', 'cf-reason'
  ];

  function validateCoachingField(el) {
    const val = el.value.trim();
    const errEl = el.parentElement.querySelector('.coaching-form__error');
    let msg = '';

    if (requiredFields.includes(el.id) && !val) {
      msg = 'This field is required.';
    }

    if (el.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email address.';
    }

    if (errEl) errEl.textContent = msg;
    el.classList.toggle('is-invalid', !!msg);
    return !msg;
  }

  // Live validation
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => validateCoachingField(el));
    el.addEventListener('input', () => el.classList.contains('is-invalid') && validateCoachingField(el));
  });

  // Build formatted data string for export
  function buildDataString(data) {
    const lines = [
      '═══════════════════════════════════════════',
      '  AVIATE GYM — ONLINE COACHING INTAKE',
      '  Gokul Srinivasan\'s Aviate Gym, Chennai',
      '═══════════════════════════════════════════',
      '',
      `Program Selected : ${data.program}`,
      `Submitted On     : ${new Date().toLocaleString('en-IN')}`,
      '',
      '── PERSONAL DETAILS ──────────────────────',
      `Name             : ${data.name}`,
      `Age              : ${data.age}`,
      `Gender           : ${data.gender}`,
      `Country          : ${data.country}`,
      `City             : ${data.city}`,
      `Marital Status   : ${data.marital}`,
      '',
      '── BODY METRICS ──────────────────────────',
      `Weight           : ${data.weight}`,
      `Height           : ${data.height}`,
      `Favourite Food   : ${data.food}`,
      '',
      '── CONTACT ───────────────────────────────',
      `Instagram ID     : ${data.instagram}`,
      `WhatsApp Number  : ${data.phoneWa}`,
      `Calling Number   : ${data.phoneCall}`,
      '',
      '── REFERRAL ──────────────────────────────',
      `Source           : ${data.source}`,
      '',
      '── TRANSFORMATION GOAL ───────────────────',
      `Reason / Goal    :`,
      data.reason,
      '',
      '═══════════════════════════════════════════',
      '  ALERT: Gokul\'s personal sales number',
      '  +91 97898 92696 (WhatsApp)',
      '  Save before submitting.',
      '═══════════════════════════════════════════',
    ];
    return lines.join('\n');
  }

  // WhatsApp message builder
  function buildWhatsAppMessage(data) {
    return encodeURIComponent(
      `🏋️ *AVIATE GYM — NEW ONLINE COACHING INQUIRY*\n\n` +
      `*Program:* ${data.program}\n` +
      `*Name:* ${data.name}\n` +
      `*Age:* ${data.age} | *Gender:* ${data.gender}\n` +
      `*Location:* ${data.city}, ${data.country}\n` +
      `*Weight:* ${data.weight} | *Height:* ${data.height}\n` +
      `*Instagram:* @${data.instagram}\n` +
      `*WhatsApp:* ${data.phoneWa}\n` +
      `*Calling:* ${data.phoneCall}\n` +
      `*Heard from:* ${data.source}\n\n` +
      `*Goal / Reason:*\n${data.reason}\n\n` +
      `_Submitted: ${new Date().toLocaleString('en-IN')}_`
    );
  }

  // Download as .txt file
  function downloadTxt(content, filename) {
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;
    requiredFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && !validateCoachingField(el)) valid = false;
    });

    if (!valid) {
      form.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect data
    const getVal = id => (document.getElementById(id)?.value.trim() || '—');
    const getChecked = name => {
      const checked = [...form.querySelectorAll(`input[name="${name}"]:checked`)];
      return checked.map(c => c.value).join(', ') || '—';
    };

    const data = {
      program:   getVal('cf-program'),
      name:      getVal('cf-name'),
      age:       getVal('cf-age'),
      country:   getVal('cf-country'),
      city:      getVal('cf-city'),
      gender:    getVal('cf-gender'),
      weight:    getVal('cf-weight'),
      height:    getVal('cf-height'),
      food:      getVal('cf-food'),
      instagram: getVal('cf-instagram'),
      phoneWa:   getVal('cf-phone-wa'),
      phoneCall: getVal('cf-phone-call'),
      marital:   getChecked('cf-marital'),
      source:    getChecked('cf-source'),
      reason:    getVal('cf-reason'),
    };

    const dataStr  = buildDataString(data);
    const filename = `aviate-coaching-${data.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;

    // 1. Download text file (for coach records)
    downloadTxt(dataStr, filename);

    // 2. Open WhatsApp with pre-filled message
    const waMsg = buildWhatsAppMessage(data);
    const waUrl = `https://wa.me/919789892696?text=${waMsg}`;
    setTimeout(() => window.open(waUrl, '_blank'), 600);

    // 3. Show success state
    const successHtml = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:1.25rem;
                  padding:3rem 2rem;border:1px solid #e2dfd9;background:#fff;text-align:center;">
        <div style="width:52px;height:52px;border:1px solid #c9a96e;border-radius:50%;
             display:flex;align-items:center;justify-content:center;
             font-size:1.4rem;color:#c9a96e;">✓</div>
        <p style="font-family:'Rajdhani',sans-serif;font-size:0.65rem;letter-spacing:0.38em;
                  text-transform:uppercase;color:#c9a96e;">Submitted Successfully</p>
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:2.4rem;
                  font-weight:300;line-height:1.1;color:#0f0f0f;">
          Your journey<br>begins now.
        </p>
        <p style="font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:300;
                  color:#6b6760;line-height:1.75;max-width:40ch;margin:0 auto;">
          Your intake form has been downloaded and your details sent to Coach Gokul on WhatsApp.
          Expect a reply within 24 hours.
        </p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-top:0.5rem;">
          <a href="https://wa.me/919789892696" target="_blank" rel="noopener"
             style="font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:600;
             letter-spacing:0.22em;text-transform:uppercase;padding:0.75rem 1.5rem;
             background:#c9a96e;color:#060606;border:1.5px solid #c9a96e;">
            Open WhatsApp →
          </a>
          <a href="index.html"
             style="font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:600;
             letter-spacing:0.22em;text-transform:uppercase;padding:0.75rem 1.5rem;
             background:transparent;color:#0f0f0f;border:1.5px solid #0f0f0f;">
            ← Back to Home
          </a>
        </div>
        <p style="margin-top:0.5rem;font-family:'DM Sans',sans-serif;font-size:0.72rem;
                  color:#b8b2a8;line-height:1.6;">
          📎 Your data file "<strong>${filename}</strong>" was downloaded automatically.
        </p>
      </div>`;

    form.parentElement.innerHTML = successHtml;
  });
})();


/* ============================================================
   13. FOOTER YEAR
============================================================ */
(function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================
   EXTRA: Coaching card selection (visual highlight only)
============================================================ */
(function initCoachingCards() {
  $$('.coaching-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('.coaching-card').forEach(c => c.classList.remove('coaching-card--selected'));
      card.classList.add('coaching-card--selected');

      // Scroll to survey
      const survey = document.getElementById('ai-survey');
      if (survey) {
        const offset = document.getElementById('site-header')?.offsetHeight ?? 78;
        window.scrollTo({
          top: survey.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });
})();


/* ============================================================
   EXTRA: "Take Survey" button scroll
============================================================ */
(function initTakeSurveyBtn() {
  $$('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.scrollTo);
      if (!target) return;
      const offset = document.getElementById('site-header')?.offsetHeight ?? 78;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
})();