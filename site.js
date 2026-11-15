(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navigation = document.getElementById('primary-nav');

  if (header && menuToggle && navigation) {
    const desktop = window.matchMedia('(min-width: 880px)');
    const setMenuOpen = (open, returnFocus = false) => {
      header.classList.toggle('menu-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      if (returnFocus) menuToggle.focus();
    };

    menuToggle.hidden = false;
    setMenuOpen(false);
    menuToggle.addEventListener('click', () => {
      setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        const wasOpenOnMobile = !desktop.matches && menuToggle.getAttribute('aria-expanded') === 'true';
        setMenuOpen(false);
        if (!wasOpenOnMobile || !link.getAttribute('href')?.startsWith('#')) return;
        const destination = document.getElementById(link.hash.slice(1));
        if (destination) {
          if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
          destination.focus({ preventScroll: true });
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false, true);
      }
    });

    document.addEventListener('click', (event) => {
      if (!header.contains(event.target) && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
      }
    });

    const onViewportChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onViewportChange);
    else desktop.addListener(onViewportChange);
  }

  if (navigation && 'IntersectionObserver' in window) {
    const sectionLinks = Array.from(navigation.querySelectorAll('a[href^="#"]'))
      .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
      .filter(({ section }) => section && ['work', 'expertise', 'credentials', 'contact'].includes(section.id));
    const visibleSections = new Set();
    const markCurrentSection = (section) => {
      sectionLinks.forEach(({ link, section: candidate }) => {
        if (candidate === section) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      const current = Array.from(visibleSections).sort((a, b) => (
        Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.25)
        - Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.25)
      ))[0];
      if (current) markCurrentSection(current);
      else if (sectionLinks.length && sectionLinks[0].section.getBoundingClientRect().top > window.innerHeight * 0.45) {
        markCurrentSection(null);
      }
    }, { rootMargin: '-15% 0px -50% 0px', threshold: 0 });

    sectionLinks.forEach(({ section }) => observer.observe(section));
  }

  const announcement = document.querySelector('[data-demo-announcement]');
  const announce = (message) => {
    if (announcement) announcement.textContent = message;
  };
  const viewControls = document.querySelector('[data-view-controls]');
  const demoPanels = Array.from(document.querySelectorAll('[data-demo-panel]'));
  if (viewControls && demoPanels.length) {
    const viewButtons = Array.from(viewControls.querySelectorAll('[data-view]'));
    const setView = (view, userInitiated = false) => {
      if (!demoPanels.some((panel) => panel.dataset.demoPanel === view)) return;
      demoPanels.forEach((panel) => { panel.hidden = panel.dataset.demoPanel !== view; });
      viewButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
      if (userInitiated) {
        announce(view === 'model'
          ? 'Showing the data model. This is an illustrative example.'
          : 'Showing the sales dashboard. All data is illustrative.');
      }
    };
    viewControls.hidden = false;
    viewButtons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view, true)));
    setView('dashboard');
  }

  const periodControls = document.querySelector('[data-period-controls]');
  const chart = document.querySelector('[data-chart]');
  const datasets = {
    h1: {
      period: 'January–June', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [42, 58, 49, 76, 68, 91], revenue: '$384K', growth: '+18.4%', target: '96%',
    },
    h2: {
      period: 'July–December', months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [64, 72, 61, 94, 83, 108], revenue: '$482K', growth: '+25.5%', target: '104%',
    },
  };

  if (periodControls && chart) {
    const periodButtons = Array.from(periodControls.querySelectorAll('[data-period]'));
    const columns = Array.from(chart.querySelectorAll('.chart-column'));
    const setText = (selector, text) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = text;
    };
    const setPeriod = (period, userInitiated = false) => {
      const data = datasets[period];
      if (!data) return;
      columns.forEach((column, index) => {
        if (index >= data.values.length) return;
        const bar = column.querySelector('[data-bar]');
        const month = column.querySelector('[data-month]');
        const value = column.querySelector('[data-value]');
        if (bar) bar.style.setProperty('--bar-height', `${data.values[index] / 120 * 100}%`);
        if (month) month.textContent = data.months[index];
        if (value) value.textContent = `$${data.values[index]}K`;
      });
      setText('[data-demo-revenue]', data.revenue);
      setText('[data-demo-growth]', data.growth);
      setText('[data-demo-target]', data.target);
      periodButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.period === period)));
      const monthlyDescription = data.months.map((month, index) => `${month}: $${data.values[index]}K`).join(', ');
      chart.setAttribute('aria-label', `Illustrative monthly revenue, ${data.period}. ${monthlyDescription}.`);
      if (userInitiated) {
        announce(`Showing ${data.period}. Illustrative revenue ${data.revenue}, growth vs. prior period ${data.growth}, target attainment ${data.target}.`);
      }
    };
    periodControls.hidden = false;
    periodButtons.forEach((button) => button.addEventListener('click', () => setPeriod(button.dataset.period, true)));
    setPeriod('h2');
  }

  if (header) {
    let framePending = false;
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      framePending = false;
    };
    window.addEventListener('scroll', () => {
      if (!framePending) {
        framePending = true;
        window.requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
    updateHeader();
  }
})();
