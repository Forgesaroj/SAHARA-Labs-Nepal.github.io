(() => {
  const links = [...document.querySelectorAll('.sidebar nav a[href^="#"]')];
  const sections = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);
  const progress = document.querySelector('[data-reading-progress]');
  const rail = document.querySelector('.sidebar');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeId = '';
  let ticking = false;

  function setActive(id) {
    if (!id || id === activeId) return;
    activeId = id;

    for (const { link, section } of sections) {
      if (section.id === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }

    if (window.matchMedia('(max-width: 720px)').matches && rail) {
      const active = sections.find(({ section }) => section.id === id)?.link;
      if (active) {
        const left = active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2;
        rail.scrollTo({ left: Math.max(0, left), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }
  }

  function update() {
    const marker = window.scrollY + 140;
    let current = sections[0]?.section.id || '';

    for (const { section } of sections) {
      if (section.offsetTop <= marker) current = section.id;
      else break;
    }

    setActive(current);

    if (progress) {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const value = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      progress.style.transform = `scaleX(${value})`;
    }

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  for (const { link, section } of sections) {
    link.addEventListener('click', () => setActive(section.id));
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
})();
