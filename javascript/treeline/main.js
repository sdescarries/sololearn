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
  work.deg = 0;
  work.inc = 127;

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

  work.w = canvas.width = dim;
  work.h = canvas.height = dim;

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

function drawLine(x, y, angle, length, depth, inc) {

  const { animId, ctx, w, h, data, time, map } = work;
  let res = 1;

  if (x !== x || y !== y) {
    throw new Error('fark!');
  }

  //console.log({x, y, angle, length, depth, inc});

  if (length < 1) {
    return res;
  }

  const rad = ((angle * pi2) / 360.0);
  const xo = Math.cos(rad) * length;
  const yo = Math.sin(rad) * length;

  // Center of line, used for next iteration
  const xoh = xo / 2;
  const yoh = yo / 2;


  let { r, g, b } = data;

  // Increment values for next iteration
  r = (r + Math.floor(Math.random() * 2) + 1) % fact;
  g = (g + Math.floor(Math.random() * 2) + 1) % fact;
  b = (b + Math.floor(Math.random() * 2) + 1) % fact;
  work.data = { r, g, b };

  const cr = mapColor(r);
  const cg = mapColor(g);
  const cb = mapColor(b);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineWidth = 4;
  ctx.lineTo(x+xoh, y+yoh);

  ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.5)`;
  ctx.stroke();

  res += drawLine(x+xoh, y+yoh, angle + inc, length/2, depth + 1, inc);

/*
  for (let a = angle + inc; a < angle + inc + 360; a += inc) {
    res += drawLine(x+xoh, y+yoh, a, length/2, depth + 1, inc);
    res += drawLine(x-xoh, y-yoh, a, length/2, depth + 1, inc);
  }
  */

  return res;
}

function animate() {

  const { animId, w, h, time, deg, inc } = work;

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

  drawLine(w/2, h/2, deg, w / 2, 0, inc);
  work.deg = deg + inc;
  work.inc = inc + 1;
}
