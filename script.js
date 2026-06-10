document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // AMBIENT MOUSE GLOW EFFECT
  // ==========================================================================
  const pointerGlow = document.createElement('div');
  pointerGlow.classList.add('pointer-glow');
  document.body.appendChild(pointerGlow);

  document.addEventListener('mousemove', (e) => {
    pointerGlow.style.left = `${e.clientX}px`;
    pointerGlow.style.top = `${e.clientY}px`;
  });

  // ==========================================================================
  // MOBILE NAVIGATION DRAWER
  // ==========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.mobile-drawer .nav-link');

  function toggleMenu() {
    mobileToggle.classList.toggle('active');
    mobileDrawer.classList.toggle('active');
    document.body.style.overflow = mobileDrawer.classList.contains('active') ? 'hidden' : '';
  }

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', toggleMenu);
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // Close drawer on resize if screen becomes desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileDrawer.classList.contains('active')) {
      toggleMenu();
    }
  });

  // ==========================================================================
  // SCROLL-DRIVEN HEADER STYLING
  // ==========================================================================
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ==========================================================================
  // INTERSECTION OBSERVER - ACTIVE NAV LINKS & TIMELINE & REVEAL
  // ==========================================================================
  const navLinks = document.querySelectorAll('.nav-menu .nav-link, .mobile-drawer .nav-link');
  const sections = document.querySelectorAll('section[id]');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const revealElements = document.querySelectorAll('.reveal');

  // Reveal scroll animation observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        revealObserver.unobserve(entry.target); // Animates only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Active navigation highlight observer
  const navObserverOptions = {
    root: null,
    threshold: 0.25,
    rootMargin: '-20% 0px -60% 0px'
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(sec => navObserver.observe(sec));

  // Timeline scrolling active node observer
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '0px 0px -15% 0px'
  });

  timelineItems.forEach(item => timelineObserver.observe(item));

  // Custom height calculation for the active vertical timeline line track
  function updateTimelineTrack() {
    const timeline = document.querySelector('.timeline-wrapper');
    const activeTrack = document.querySelector('.timeline-track-active');
    if (!timeline || !activeTrack) return;

    const items = document.querySelectorAll('.timeline-item');
    let lastActiveIndex = -1;
    
    items.forEach((item, idx) => {
      if (item.classList.contains('active')) {
        lastActiveIndex = idx;
      }
    });

    if (lastActiveIndex === -1) {
      activeTrack.style.height = '0px';
      return;
    }

    const firstItem = items[0];
    const lastActiveItem = items[lastActiveIndex];
    
    const timelineRect = timeline.getBoundingClientRect();
    const firstDotRect = firstItem.querySelector('.timeline-dot').getBoundingClientRect();
    const lastDotRect = lastActiveItem.querySelector('.timeline-dot').getBoundingClientRect();
    
    const startY = firstDotRect.top - timelineRect.top + firstDotRect.height / 2;
    const endY = lastDotRect.top - timelineRect.top + lastDotRect.height / 2;
    
    activeTrack.style.top = `${startY}px`;
    activeTrack.style.height = `${endY - startY}px`;
  }

  // Bind scroll and transition ends to update the active timeline line height
  window.addEventListener('scroll', updateTimelineTrack);
  window.addEventListener('resize', updateTimelineTrack);
  setTimeout(updateTimelineTrack, 100);

  // ==========================================================================
  // PROJECTS PORTFOLIO FILTER SYSTEM
  // ==========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states on buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        // Hide/Show matching logic
        if (filterValue === 'all' || cardCategory === filterValue || (filterValue === 'security' && cardCategory.includes('security')) || (filterValue === 'software' && cardCategory.includes('software'))) {
          // Fade in
          card.classList.remove('hidden');
          setTimeout(() => {
            card.classList.remove('fade-out');
            card.classList.add('fade-in');
          }, 50);
        } else {
          // Fade out
          card.classList.add('fade-out');
          card.classList.remove('fade-in');
          // Wait for transition to complete before adding hidden
          setTimeout(() => {
            if (card.classList.contains('fade-out')) {
              card.classList.add('hidden');
            }
          }, 300);
        }
      });
      
      // Delay update to timeline since height shifts during project hiding
      setTimeout(updateTimelineTrack, 350);
    });
  });

  // ==========================================================================
  // CONTACT FORM VALIDATION & LOGIC
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      // Simple regex check for email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !subject || !message) {
        showStatus('Error: All form fields are required.', 'error');
        return;
      }

      if (!emailRegex.test(email)) {
        showStatus('Error: Please enter a valid email address.', 'error');
        return;
      }

      // Simulate API submit call
      showStatus('Submitting message secure tunnel...', 'success');
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      setTimeout(() => {
        // Log locally to simulate saving data securely
        const inquiries = JSON.parse(localStorage.getItem('contact_inquiries') || '[]');
        inquiries.push({ name, email, subject, message, timestamp: new Date().toISOString() });
        localStorage.setItem('contact_inquiries', JSON.stringify(inquiries));

        showStatus('Message encrypted & sent successfully! I will reach out soon.', 'success');
        contactForm.reset();
        if (submitBtn) submitBtn.disabled = false;
      }, 1500);
    });
  }

  function showStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = 'form-status'; // Reset class
    formStatus.classList.add(type);
    
    // Auto scroll view if status is showing
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ==========================================================================
  // HIGH-TECH SCANNER SIMULATOR CONSOLE TEXT
  // ==========================================================================
  const consoleLines = [
    'INIT SECURITY_SHIELD_V4.2.0',
    'SCANNING INTERFACES...',
    'VULN_DB: UPDATED [0 DAYS AGO]',
    'STATUS: SECURE OPERATIONAL'
  ];
  
  const consoleElement = document.getElementById('console-line-text');
  if (consoleElement) {
    let currentLineIdx = 0;
    
    function updateConsole() {
      consoleElement.textContent = `> ${consoleLines[currentLineIdx]}`;
      currentLineIdx = (currentLineIdx + 1) % consoleLines.length;
    }
    
    updateConsole();
    setInterval(updateConsole, 3500);
  }
});
