const work = {
  params: {
    angle: 0,
    radius: 0.4,
    dim: 0,
  },
  target: {
    moving: false,
    x: 0.25,
    y: 0.25,
  }
};

function moveTarget({ offsetX, offsetY }, flag) {
  const { canvas, target, params } = work;
  const { dim } = params;

  if (flag != null) {
    target.moving = flag;
  }

  if (target.moving) {

    const {
      width,
      height,
    } = canvas;

    target.x = (offsetX / width) - 0.5;
    target.y = (offsetY / height) - 0.5;
    target.offsetX = offsetX;
    target.offsetY = offsetY;
  }
}

async function init() {

  // Seed display values only once
  work.time = Date.now();

  // Adapt layout dynamically
  window.onresize = doLayout;

  const canvas = work.canvas = document.querySelector('canvas');

  canvas.addEventListener('mousemove', (e) => moveTarget(e, null),  false);
  canvas.addEventListener('mousedown', (e) => moveTarget(e, true),  false);
  canvas.addEventListener('mouseup',   (e) => moveTarget(e, false), false);
  //canvas.addEventListener('mouseout',  (e) => moveTarget(e, false), false);

  doLayout();
  animate();
}

function doLayout() {

  const {
    innerWidth,
    innerHeight,
  } = window;

  const {
    canvas,
  } = work;

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  work.params.dim = (innerWidth < innerHeight ? innerWidth : innerHeight);
}

function animate() {

  const {
    canvas,
    animId,
    time,
    params,
    target,
  } = work;

  if (animId) {
    window.cancelAnimationFrame(animId);
  }

  work.animId = window.requestAnimationFrame(animate);

  // Throttling to max 25 fps
  const now = Date.now();
  if ((now - time) < 40) {
    return;
  }
  work.time = now;

  const {
    width,
    height,
  } = canvas;

  // reset canvas for a fresh paint
  canvas.width = width;
  const ctx = canvas.getContext('2d');

  const {
    dim,
    angle,
    radius,
  } = params;

  ctx.fillStyle = '#222';
  ctx.lineWidth = 1;
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width/2, height/2);
  ctx.font = '20px Sans';
  ctx.textAlign = 'center';

  {
    let r = radius * dim;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.strokeStyle = '#822';
    ctx.stroke();

    ctx.fillStyle = '#DDF';
    ctx.fillText('0°', r + 30, 8);
    ctx.fillText('90°', 0, r + 25);
    ctx.fillText('-90°', 0, -r - 10);
    ctx.fillText('180°', -r - 30, 8);
  }

  {
    let { x, y } = target;
    let r = radius / 50;

    const {
      width,
      height,
    } = canvas;

    x *= width;
    y *= height;
    r *= dim;

    let hypotenuse = Math.sqrt(x*x + y*y);
    let cw = (y < 0);
    let hc = cw ? -1 : 1;
    let rad = Math.acos(x / hypotenuse) * hc;

    ctx.beginPath();
    ctx.moveTo(0, 0);

    // Line to angle 0
    ctx.lineTo(hypotenuse, 0);
    ctx.arc(0, 0, hypotenuse, 0, rad, cw);
    ctx.lineTo(0, 0);
    ctx.strokeStyle = '#2F2';
    ctx.stroke();

    /*

    if (Math.abs(x) > Math.abs(y)) {

      // opposite
      ctx.lineTo(x, 0);

      // adjacent
      ctx.lineTo(0, 0);

    } else {

      // opposite
      ctx.lineTo(0, y);

      // adjacent
      ctx.lineTo(0, 0);
    }
    ctx.fillText(Math.round(hypotenuse), x, y);
    ctx.fillText(Math.round(x), x/2, 0);
    ctx.fillText(Math.round(y), 0, y/2);
    */

  }

}
