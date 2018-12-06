const work = {
  x: 0.0,
  y: 0.0,
  z: 2000,
  d: 0.0,
  ms: 0.0,
  mz: 0.0,
  md: 0.0,
};

const commands = {
  lf: () => { work.md = -1; },
  rt: () => { work.md = +1; },
  fw: () => { work.ms = +1; },
  bk: () => { work.ms = -1; },
  up: () => { work.mz = +10; },
  dn: () => { work.mz = -10; },
};

async function init() {

  // Seed display values only once
  work.time = Date.now();

  // Adapt layout dynamically
  window.onresize = doLayout;

  {
    // An actual satelite image of Mars
    const image = work.marsbg = new Image();
    image.src = 'https://newauthors.files.wordpress.com/2010/06/marstotal.jpg';
  }

  {
    // A basic rover clipart
    const image = work.rover = new Image();
    image.src = 'https://image.flaticon.com/icons/png/512/124/124544.png';
  }

  for (let ctl of ['lf', 'rt', 'fw', 'bk', 'up', 'dn']) {
    const el = document.querySelector(`#${ctl}`);
    el.onpointerdown = () => {
      commands[ctl]();
    };

    el.onpointerup = () => {
      work.ms = 0.0;
      work.mz = 0.0;
      work.md = 0.0;
    };
  }

  doLayout();
  animate();
}

function rand(range = 1000) {
  return Math.floor((Math.random() * range));
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

  canvas.width = dim;
  canvas.height = dim;

  work.dim = dim;
  work.ctx = canvas.getContext('2d');

  // move to the center of the canvas
  work.ctx.translate(dim/2, dim/2);
}

function animate() {

  const {
    animId,
    marsbg,
    rover,
    ctx,
    x, y, z, d,
    ms, mz, md,
    time
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

  ctx.save();
  ctx.rotate(d*Math.PI/180);

  let hz = z / 2;
  ctx.drawImage(marsbg, -hz + x, -hz + y, z, z);

  ctx.restore();

  // Rover is 1/40 the scale of the map
  let rz = z / 40;
  hz = rz / 2;
  ctx.drawImage(rover, -hz, -hz, rz, rz);

  console.log({ ms, mz, md });

  work.x += ms * Math.cos((-d+90)*Math.PI/180);
  work.y += ms * Math.sin((-d+90)*Math.PI/180);
  work.z += mz;
  work.d += md;
}
