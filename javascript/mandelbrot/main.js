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

  const ctx = work.ctx = canvas.getContext('2d');
  const src = work.src = ctx.createImageData(ww, wh);

  // Line stride for manipulating the image
  const stride = work.stride = ww * 4;

  const { data, map } = work;

  {
    const sdat = src.data;

    for (let r = 0; r < ww; r ++) {
      for (let c = 0; c < ww; c ++) {
        const o = r * stride + c * 4;
        const x0 = 3.5 / ww * c - 2.5;
        const y0 = 2 / wh * r - 1;

        let x = 0.0;
        let y = 0.0;
        let z = 0;

        let xx = 0;
        let yy = 0;
        let t = 0;

        while (t < 8 && z < 720) {
          xx = x*x;
          yy = y*y;
          t = xx - yy + x0;
          y = 2 * x * y + y0;
          x = t;
          z++;
          t = xx + yy;
        }

        sdat[o+0] = map[(z + data.r) % 720];
        sdat[o+1] = map[(z + data.g) % 720];
        sdat[o+2] = map[(z + data.b) % 720];
        sdat[o+3] = 255;
      }
    }
  }

  ctx.putImageData(src, 0, 0);
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

  const { animId, time } = work;

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

}
