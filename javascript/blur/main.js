const blur = {};

function rand() {
  return Math.floor((Math.random() * 256));
}

function init() {
  const {
    innerWidth,
    innerHeight,
  } = window;

  const canvas = blur.canvas = document.querySelector('canvas');
  const w = blur.w = canvas.width = Math.round(innerWidth / 8);
  const h = blur.h = canvas.height = Math.round(innerHeight / 8);
  const ctx = blur.ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;

  // Create images with a padding border
  const pw = w + 16;
  const ph = h + 16;
  const src = blur.src = ctx.createImageData(pw, ph);
  const dst = blur.dst = ctx.createImageData(pw, ph);

  // Line stride for manipulating the image
  const stride = blur.stride = pw * 4;

  // Initialize time for throttling
  blur.time = Date.now();

  console.log(blur);

  // Initialize the canvas with random pixel values
  {
    const sdat = src.data;
    const ddat = dst.data;

    for (let r = 0; r < ph; r ++) {
      for (let c = 0; c < pw; c ++) {
        const o = r * stride + c * 4;
        sdat[o+0] = ddat[o+0] = rand();
        sdat[o+1] = ddat[o+1] = 0;
        sdat[o+2] = ddat[o+2] = rand();
        sdat[o+3] = ddat[o+3] = 255;
      }
    }
  }

  animate();
}

/**
 * Pseudo gausian filtering weighs the surrounding pixels
 *
 *         [1]
 *      [1][2][1]
 *   [1][2][3][2][1]
 *      [1][2][1]
 *         [1]
 *
 */
const gausian = [

  // center
  { m:  0, o:  0, f: x => 0.36 * x },

  // first depth
  { m:  0, o: +1, f: x => 0.08 * x },
  { m:  0, o: -1, f: x => 0.08 * x },
  { m: +1, o:  0, f: x => 0.08 * x },
  { m: -1, o:  0, f: x => 0.08 * x },

  // second depth
  { m:  0, o: +2, f: x => 0.04 * x },
  { m:  0, o: -2, f: x => 0.04 * x },
  { m: +2, o:  0, f: x => 0.04 * x },
  { m: -2, o:  0, f: x => 0.04 * x },
  { m: +1, o: +1, f: x => 0.04 * x },
  { m: +1, o: -1, f: x => 0.04 * x },
  { m: -1, o: +1, f: x => 0.04 * x },
  { m: -1, o: -1, f: x => 0.04 * x },
];

const cross = [
  { m:  0, o: +3, f: x => 0.25 * x },
  { m:  0, o: -3, f: x => 0.25 * x },
  { m: +3, o:  0, f: x => 0.25 * x },
  { m: -3, o:  0, f: x => 0.25 * x },
];

const selected = cross;

function filter(src, dst, offset, stride) {

  // initialize result
  let r = 0.0;
  let g = 0.0;
  let b = 0.0;
  const rd = Math.random();

  selected.forEach(({ m, o, f }) => {
    const so = offset + m * stride + o * 4;
    r += f(src[so+0]);
    g += f(src[so+1]);
    b += f(src[so+2]);
  });

  dst[offset+0] = Math.round(r);
  dst[offset+1] = Math.round(g);
  dst[offset+2] = Math.round(b);
}

function animate() {
  window.requestAnimationFrame(animate);

  const {
    ctx,
    w,
    h,
    src,
    dst,
    stride,
    time,
  } = blur;

  // Throttling
  const now = Date.now();
  if ((now - time) < 500) {
    return;
  }
  blur.time = now;

  ctx.putImageData(src, -8, -8);

  const offset = 4 * stride + 4 * 4;
  const sdat = src.data;
  const ddat = dst.data;

  for (let r = 0; r < h + 8; r ++) {
    for (let c = 0; c < w + 8; c ++) {
      const o = offset + r * stride + c * 4;
      filter(sdat, ddat, o, stride);
    }
  }

  // Swap buffers
  blur.src = dst;
  blur.dst = src;
}
