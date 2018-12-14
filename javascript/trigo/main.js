const work = {
  params: {
    radius: 0.4,
    dim: 0,
  },
  target: {
    moving: false,
    x: 0.25,
    y: 0.25,
  },
  focus: {
    angle: 0.0,
    rate: 0.0,
    dist: 0.0,
  }
};

function moveTarget({ offsetX, offsetY }, flag) {
  const { canvas, target, params } = work;

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

    work.rate = 0.0;
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
    focus,
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
    radius,
  } = params;

  ctx.fillStyle = '#222';
  ctx.lineWidth = 2;
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
    ctx.fillStyle = '#DDF';
    ctx.stroke();
    /*
    ctx.fillText('0°', r + 30, 8);
    ctx.fillText('90°', 0, r + 25);
    ctx.fillText('-90°', 0, -r - 10);
    ctx.fillText('180°', -r - 30, 8);

    */
  }

  {
    let { x, y } = target;

    const {
      width,
      height,
    } = canvas;

    x *= width;
    y *= height;

    let cw = (y < 0);
    let hc = cw ? -1 : 1;
    let hypotenuse = Math.sqrt(x*x + y*y);
    let rad = Math.acos(x / hypotenuse) * hc;

    const {
      angle,
    } = focus;

    let deg = (rad / Math.PI * 180);
    let frad = angle / 180 * Math.PI;
    let drad = frad - rad;

    if (drad > Math.PI) {
      drad -= Math.PI * 2;
    } else if (drad < -Math.PI) {
      drad += Math.PI * 2;
    }

    let dist = Math.abs(drad / Math.PI* 180);

    cw = (drad > 0);
    hc = cw ? -1 : 1;

    if (target.moving) {
      if (dist > 1) {
        focus.angle += hc / 2;
      } else {
        focus.angle = deg;
      }
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);

    // Line to focus
    x = Math.cos(frad) * hypotenuse;
    y = Math.sin(frad) * hypotenuse;
    ctx.lineTo(x, y);

    // Arc to target
    ctx.arc(0, 0, hypotenuse, frad, rad, cw);

    // Back at origin
    ctx.lineTo(0, 0);

    ctx.strokeStyle = '#2F2';
    ctx.stroke();

    // Add labels for degree values
    hypotenuse += 25;

    x = Math.cos(rad) * (hypotenuse);
    y = Math.sin(rad) * (hypotenuse);
    ctx.fillText(`${parseInt(deg, 10)}°`, x, y);

    if (dist > 10) {
      x = Math.cos(frad) * (hypotenuse);
      y = Math.sin(frad) * (hypotenuse);
      ctx.fillText(`${parseInt(angle, 10)}°`, x, y);
    }

    if (dist > 45) {
      x = Math.cos(rad + drad / 2) * (hypotenuse);
      y = Math.sin(rad + drad / 2) * (hypotenuse);
      ctx.fillText(`${parseInt(dist, 10)}°`, x, y);
    }

  }
}
