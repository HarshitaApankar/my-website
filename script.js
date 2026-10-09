// Mobile menu
const menu = document.querySelector('.menu');
const nav = document.getElementById('nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') { nav.classList.remove('open'); menu.setAttribute('aria-expanded', false); }
});

// Enquiry form -> WhatsApp message to JS Corporation
const WHATSAPP = '919875038188';
document.getElementById('enquiry').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim(), qty = f.qty.value.trim();
  const err = f.querySelector('.err');
  if (!name || !qty) { err.hidden = false; return; }
  err.hidden = true;
  const city = f.city.value.trim();
  const text = `Hello JS Corporation, I am ${name}${city ? ' from ' + city : ''}. ` +
    `I want a price for ${f.product.value}, quantity: ${qty}.`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

// Hero slider
const slides = document.querySelectorAll('.slide');
const dotsBox = document.querySelector('.dots');
let cur = 0, timer;
slides.forEach((_, i) => {
  const d = document.createElement('button');
  d.setAttribute('aria-label', 'Show photo ' + (i + 1));
  d.addEventListener('click', () => { show(i); restart(); });
  dotsBox.appendChild(d);
});
function show(n) {
  cur = (n + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('on', i === cur));
  dotsBox.querySelectorAll('button').forEach((d, i) => d.classList.toggle('on', i === cur));
}
function restart() {
  clearInterval(timer);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show(cur + 1), 4000);
}
document.querySelector('.prev').addEventListener('click', () => { show(cur - 1); restart(); });
document.querySelector('.next').addEventListener('click', () => { show(cur + 1); restart(); });
show(0); restart();

// Scroll progress (0 at top, 1 at bottom) drives the background growth
const rootEl = document.documentElement;
function setProgress() {
  const max = rootEl.scrollHeight - innerHeight;
  rootEl.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(3) : 0);
}
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { setProgress(); ticking = false; }); }
  }, { passive: true });
  addEventListener('resize', setProgress);
  setProgress();
}

// Morphing toner-dust background: dust -> bottle -> "JS" -> tree, driven by scroll
(() => {
  const cv = document.getElementById('bg'), ctx = cv.getContext('2d');
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SZ = 300, N = innerWidth < 700 ? 700 : 1500;
  let W, H, bx, by, bs, p = 0, mx = -999, my = -999, t = 0, S = [], P = [];
  let seed = 11; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const ease = x => x * x * (3 - 2 * x), clamp = x => Math.max(0, Math.min(1, x));

  // Draw a shape on a hidden canvas, then sample its coloured pixels as N target points
  function shapePoints(draw, byY) {
    const o = document.createElement('canvas'); o.width = o.height = SZ;
    const c = o.getContext('2d', { willReadFrequently: true }); draw(c);
    const d = c.getImageData(0, 0, SZ, SZ).data, pts = [], out = [];
    for (let y = 0; y < SZ; y += 2) for (let x = 0; x < SZ; x += 2) {
      const i = (y * SZ + x) * 4;
      if (d[i + 3] > 140) pts.push([x / SZ, y / SZ, d[i], d[i + 1], d[i + 2]]);
    }
    for (let i = 0; i < N; i++) out.push(pts[Math.floor(rnd() * pts.length)]);
    if (byY) out.sort((a, b) => b[1] - a[1]); // bottom first, so the tree grows upward
    return out;
  }

  const bottle = c => {
    c.fillStyle = '#8a97a5'; c.fillRect(105, 12, 90, 34);
    c.fillStyle = '#b7c3cf'; c.fillRect(115, 46, 70, 22);
    c.fillStyle = '#c9d3dd'; c.beginPath(); c.roundRect(70, 68, 160, 222, 26); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.ellipse(150, 185, 58, 74, 0, 0, 7); c.fill();
    c.strokeStyle = '#e8a020'; c.lineWidth = 7; c.stroke();
    c.fillStyle = '#e8a020'; c.font = '800 44px Arial'; c.textAlign = 'center'; c.fillText('JS', 150, 205);
    c.fillStyle = '#2f8f3a'; c.fillRect(110, 225, 80, 6);
  };
  const letters = c => {
    c.font = '800 190px Archivo, Arial Black, Arial'; c.textBaseline = 'middle'; c.textAlign = 'left';
    const wj = c.measureText('J').width, ws = c.measureText('S').width, x = (SZ - wj - ws) / 2;
    c.fillStyle = '#1b8fd1'; c.fillText('J', x, 150);
    c.fillStyle = '#2f8f3a'; c.fillText('S', x + wj, 150);
  };
  const tree = c => {
    c.lineCap = 'round';
    const br = (x, y, a, l, w, d) => {
      const ex = x + Math.cos(a) * l, ey = y - Math.sin(a) * l;
      c.strokeStyle = '#222'; c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.stroke();
      if (!d) {
        for (let i = 0; i < 5; i++) {
          c.fillStyle = ['#2f8f3a', '#4caf50', '#1b8fd1'][i % 3]; c.beginPath();
          c.arc(ex + (rnd() - .5) * 26, ey + (rnd() - .5) * 26, 9 + rnd() * 6, 0, 7); c.fill();
        }
        return;
      }
      br(ex, ey, a - .5, l * .75, w * .7, d - 1); br(ex, ey, a + .5, l * .75, w * .7, d - 1);
      if (d > 2) br(ex, ey, a + (rnd() - .5) * .3, l * .8, w * .7, d - 1);
    };
    br(150, 300, Math.PI / 2, 70, 12, 4);
  };

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W < 700) { bs = Math.min(W * .85, H * .6); bx = (W - bs) / 2; by = H - bs - 20; }
    else { bs = Math.min(W * .44, H * .86, 560); bx = W - bs - W * .03; by = H - bs - H * .04; }
  }

const A = [.55, 1, 1, 1], DUST = [80, 95, 110];
  function frame(snap) {
    ctx.clearRect(0, 0, W, H);
    if (mx > -900 && !snap) {
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
      g.addColorStop(0, 'rgba(27,143,209,.10)'); g.addColorStop(1, 'rgba(27,143,209,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const s = p * 3, a = Math.min(2, Math.floor(s)), f = s - a;
    const px = mx > -900 ? mx / W - .5 : 0, py = mx > -900 ? my / H - .5 : 0;
    ctx.globalAlpha = W < 700 ? .55 : 1;
    for (const q of P) {
      const e = a === 2 ? ease(clamp(f * 1.7 - q.k * .7)) : ease(f);
      const at = st => st === 0
        ? [q.hx * W + Math.sin(t * .004 + q.ph) * 40, q.hy * H + Math.cos(t * .003 + q.ph * 1.3) * 40, DUST]
        : [bx + (S[st][q.i][0] + q.j) * bs, by + (S[st][q.i][1] + q.j) * bs, S[st][q.i].slice(2)];
      const u = at(a), v = at(a + 1);
      let tx = u[0] + (v[0] - u[0]) * e + px * 30 * q.z, ty = u[1] + (v[1] - u[1]) * e + py * 30 * q.z;
      if (a === 2) tx += Math.sin(t * .03 + q.ph) * 1.5 * e;
      if (snap) { q.x = tx; q.y = ty; }
      else {
        q.vx += (tx - q.x) * .05; q.vy += (ty - q.y) * .05;
        const dx = q.x - mx, dy = q.y - my, d = Math.hypot(dx, dy);
        if (d < 110) { const k = (1 - d / 110) * 1.6; q.vx += dx / (d || 1) * k; q.vy += dy / (d || 1) * k; }
        q.vx *= .8; q.vy *= .8; q.x += q.vx; q.y += q.vy;
      }
      const r = Math.round(u[2][0] + (v[2][0] - u[2][0]) * e), g2 = Math.round(u[2][1] + (v[2][1] - u[2][1]) * e), b = Math.round(u[2][2] + (v[2][2] - u[2][2]) * e);
      const al = A[a] + (A[a + 1] - A[a]) * e, sz = 3 + q.z * 1;
      ctx.fillStyle = `rgba(${r},${g2},${b},${al})`;
      ctx.fillRect(q.x - sz / 2, q.y - sz / 2, sz, sz);
    }
ctx.globalAlpha = W < 700 ? .8 : 1;  }

  function onScroll() {
    const max = root.scrollHeight - innerHeight;
    p = max > 0 ? Math.min(1, scrollY / max) : 0;
    root.style.setProperty('--p', p.toFixed(3));
    if (still) frame(true);
  }
  function loop() { t++; frame(false); requestAnimationFrame(loop); }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    S = [null, shapePoints(bottle), shapePoints(letters), shapePoints(tree, true)];
    for (let i = 0; i < N; i++) P.push({ i, k: i / N, z: .5 + rnd(), ph: rnd() * 6.28, hx: rnd(), hy: rnd(), j: (rnd() - .5) * .012, x: rnd() * innerWidth, y: rnd() * innerHeight, vx: 0, vy: 0 });
    layout(); onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => { layout(); onScroll(); });
    if (!still) {
      addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
      root.addEventListener('mouseleave', () => { mx = my = -999; });
      loop();
    }

  });
})();

// "Find your toner": brand chips + model search
const TONERS = [
  { name: '12A Toner Powder',  brands: ['HP', 'Canon'], models: 'HP LaserJet 1010, 1100, 1200, 2100, 4000, 5000, 5150. Canon LBP 1210, 3900.', weights: '100, 120, 140 g', img: 'images/p12a.jpg' },
  { name: '88A Toner Powder',  brands: ['HP'], models: 'HP LaserJet P1108, 1006, 1007, 1008, P1505, 2100, P1606N.', weights: '70, 80 g', img: 'images/p88a.jpg' },
  { name: '77A Toner Powder',  brands: ['HP'], models: 'HP printers that use 77A cartridges.', weights: '70, 100 g', img: 'images/p77a.jpg' },
  { name: 'Samsung Toner Powder', brands: ['Samsung', 'HP'], models: 'Samsung LaserJet 1210, 1710, 1610, 4500, 1522, 5100, 4100, 426, 2021, 1043. HP LaserJet 108W.', weights: '70, 80 g', img: 'images/psamsung.jpg' },
  { name: 'Brother Toner Powder', brands: ['Brother'], models: 'Brother laser printers.', weights: '80, 100 g', img: 'images/pbrother.jpg' },
  { name: 'Kyocera Toner Powder', brands: ['Kyocera'], models: 'Kyocera laser printers.', weights: '100 g', img: 'images/pkyocera.jpg' },
  { name: 'Canon 65 Toner Pouch', brands: ['Canon'], models: 'Canon 65 toner, in foil pouches.', weights: '1 kg, 1/2 kg', img: 'images/ppouch.jpg' }
];
const fres = document.getElementById('fres'), fq = document.getElementById('fq');
const chips = document.querySelectorAll('.chips button');
let brand = '';
function showToners() {
  const q = fq.value.trim().toLowerCase();
  if (!brand && !q) { fres.innerHTML = '<p class="msg">Pick your printer brand above, or type a model number.</p>'; return; }
  const hits = TONERS.filter(t =>
    (!brand || t.brands.includes(brand)) &&
    (!q || (t.models + ' ' + t.name).toLowerCase().includes(q)));
  if (!hits.length) {
    fres.innerHTML = '<p class="msg">We could not match that exactly. Call <a href="tel:+919875038188">98750 38188</a> or message us on WhatsApp with your printer model and we will tell you the right powder.</p>';
    return;
  }
  fres.innerHTML = hits.map(t => {
    const msg = encodeURIComponent('Hello JS Corporation, I want the price for ' + t.name + '.');
    return '<article class="fitem"><img src="' + t.img + '" alt="' + t.name + '" loading="lazy"><div>' +
      '<h3>' + t.name + '</h3><p>' + t.models + '</p><p class="meta">Sizes: ' + t.weights + '</p>' +
      '<a href="https://wa.me/' + WHATSAPP + '?text=' + msg + '" target="_blank" rel="noopener">Ask price on WhatsApp</a></div></article>';
  }).join('');
}
chips.forEach(b => b.addEventListener('click', () => {
  brand = brand === b.dataset.brand ? '' : b.dataset.brand;
  chips.forEach(c => c.classList.toggle('on', c.dataset.brand === brand));
  showToners();
}));
fq.addEventListener('input', showToners);
showToners();