// ---------- UTIL ----------
const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => [...ctx.querySelectorAll(q)];
const root = document.documentElement;

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- STAGE ELEMENTS ----------
const stage = $('#stage');
const bottleA = $('#bottleA');
const bottleB = $('#bottleB');
const fruitA  = $('#fruitA');
const fruitB  = $('#fruitB');
const splash  = $('#splash');

// For crossfades
let showingA = true;

// ---------- PARALLAX ON MOUSE ----------
if (stage) {
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const multBottle = 12, multFruit = 20, multSplash = 8;

    const move = (el, m) => { el.style.transform = `translate(${x * -m}px, ${y * -m}px)`; };
    move(showingA ? bottleA : bottleB, multBottle);
    move(showingA ? fruitA  : fruitB,  multFruit);
    move(splash, multSplash);
  });
  stage.addEventListener('mouseleave', () => {
    [bottleA,bottleB,fruitA,fruitB,splash].forEach(el => el.style.transform = 'translate(0,0)');
  });
}

// ---------- FLAVORS FROM DOM PANELS ----------
const flavorPanels = $$('.panel.flavor').map(p => ({
  el: p,
  bg: p.dataset.bg || '#0b0f14',
  accent: p.dataset.accent || '#ff9a23',
  bottle: p.dataset.bottle,
  fruit: p.dataset.fruit,
  title: p.dataset.title || '',
  text: p.dataset.text || ''
}));

// Apply initial theme from first flavor if intro is short
if (flavorPanels.length) {
  root.style.setProperty('--bg', flavorPanels[0].bg);
  root.style.setProperty('--accent', flavorPanels[0].accent);
}

// ---------- INTERSECTION TO SWITCH FLAVORS ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = entry.target;
    const conf = flavorPanels.find(f => f.el === target);
    if (!conf) return;

    // Update theme colors
    root.style.setProperty('--bg', conf.bg);
    root.style.setProperty('--accent', conf.accent);

    // Crossfade bottle + fruit
    if (showingA) {
      bottleB.src = conf.bottle;
      fruitB.src  = conf.fruit;

      bottleA.style.opacity = '0';
      fruitA.style.opacity  = '0';
      bottleB.style.opacity = '1';
      fruitB.style.opacity  = '1';
    } else {
      bottleA.src = conf.bottle;
      fruitA.src  = conf.fruit;

      bottleA.style.opacity = '1';
      fruitA.style.opacity  = '1';
      bottleB.style.opacity = '0';
      fruitB.style.opacity  = '0';
    }
    showingA = !showingA;
  });
}, { threshold: 0.66 });

flavorPanels.forEach(f => io.observe(f.el));

// ---------- SCROLL REVEAL FOR HEADINGS ----------
const reveal = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.transform = 'translateY(0)';
      e.target.style.opacity = '1';
      reveal.unobserve(e.target);
    }
  });
}, { threshold: 0.25 });

$$('.panel h1, .panel h2, .panel p, .badge, .ticks li').forEach(el => {
  el.style.transform = 'translateY(14px)';
  el.style.opacity = '0';
  el.style.transition = 'transform 600ms ease, opacity 600ms ease';
  reveal.observe(el);
});
