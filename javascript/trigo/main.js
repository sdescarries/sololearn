const work = {};

function init() {

  // Seed display values only once
  work.time = Date.now();
  work.data = {
    r: rand(),
    g: rand(),
    b: rand(),
  };

  const map = [];

  for(let c = 0; c < fact; c++) {
    const rad = pi2 / fact * c;
    const cos = Math.cos(rad + Math.PI);
    map[c] = Math.floor((cos + 1) * 128);
  }

  console.log(map);

  work.map = map;

  // Adapt layout dynamically
  window.onresize = doLayout;

  doLayout();
  animate();
}

// Increment factor is 1/10 degree
const fact = 720;
const pi2 = Math.PI * 2;

function rand() {
  return Math.floor((Math.random() * fact));
}

function doLayout() {

  const ww = window.innerWidth;
  const wh = window.innerHeight;
  let dir, dim;

  // Change orientation based on aspect ratio
  if (ww > wh) {
    dir = 'row';
    dim = wh;
  } else {
    dir = 'column';
    dim = ww;
  }

  console.log({ ww, wh, dir, dim });

  const canvas = work.canvas = document.querySelector('canvas');
  const body = document.querySelector('body');

  body.style.flexDirection = dir;

  work.w = canvas.width = ww;
  work.h = canvas.height = wh;

  work.ctx = canvas.getContext('2d');
}

// Coverts a 1/10 degree value to radian and color value in [0:255] range
function colorSin(deg) {
  const sin = Math.sin(pi2 * deg / fact);
  return Math.floor((sin + 1) * 128);
}

function mapColor(idx) {
  return work.map[Math.floor(idx % fact)];
}

function animate() {

  const { animId, ctx, w, h, data, time, map } = work;

  if (animId) {
    window.cancelAnimationFrame(animId);
  }

  work.animId = window.requestAnimationFrame(animate);

  // Throttling
  const now = Date.now();
  if ((now - time) < 10) {
    return;
  }
  work.time = now;

  let { r, g, b } = data;

  // Increment values for next iteration
  r = (r + Math.floor(Math.random() * 2) + 1) % fact;
  g = (g + Math.floor(Math.random() * 2) + 1) % fact;
  b = (b + Math.floor(Math.random() * 2) + 1) % fact;
  work.data = { r, g, b };

  const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
  const stops = 10;
  const inc = fact / stops;

  for (let s = 0; s < stops; s ++) {

    const cr = mapColor(r);
    const cg = mapColor(g);
    const cb = mapColor(b);

    grd.addColorStop(s / 10, `rgb(${cr}, ${cg}, ${cb})`);

    r += inc;
    g += inc;
    b += inc;
  }


  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}
