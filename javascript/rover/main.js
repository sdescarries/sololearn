const work = {
  x: 0.0,
  y: 0.0,
  z: 2000,
  d: 0.0,
  ms: 0.0,
  mz: 0.0,
  md: 0.0,
  rocks: []
};

const commands = {
  lf: () => { work.md = -5; },
  rt: () => { work.md = +5; },
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
    // The rover representation
    const image = work.rover = new Image();
    image.src = 'http://icons.iconarchive.com/icons/graphicloads/polygon/256/upload-3-icon.png';
  }

  const rockImgs = [];

  for (let src of [
    'http://icons.iconarchive.com/icons/anton-gerasimenko/harry-potter/128/Philosophers-Stone-icon.png',
    'http://icons.iconarchive.com/icons/raindropmemory/down-to-earth/512/G12-Rock-icon.png',
    'http://icons.iconarchive.com/icons/archigraphs/eco-health/512/White-Stone-icon.png',
    'http://icons.iconarchive.com/icons/archigraphs/eco-health/512/Eroded-Stone-icon.png',
  ]) {
    // Some rock
    const image = new Image();
    image.src = src;
    rockImgs.push(image);
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

  for (let n = 0; n < 1000; n++) {
    const rock = {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      s: Math.random(),
      a: Math.random() * 360,
      img: rockImgs[Math.floor(Math.random() * rockImgs.length)],
    };

    work.rocks.push(rock);
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

  //console.log({ ww, wh, dir, dim });

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
    rocks,
    ctx,
    x, y, z, d,
    ms, mz, md,
    time,
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

  let hz = z / 2;
  let zx, zy;

  // Map
  zx = x * z - hz;
  zy = y * z - hz;
  ctx.drawImage(marsbg, zx, zy, z, z);

  // Rocks
  for (let rock of rocks) {

    zx = (rock.x + x) * z - hz;
    zy = (rock.y + y) * z - hz;
    //    ctx.save();
    //    ctx.rotate(rock.a*Math.PI/180);
    ctx.drawImage(rock.img, zx, zy, z / 200, z / 200);
    //    ctx.restore();
  }

  ctx.save();
  ctx.rotate(d*Math.PI/180);

  // Rover is 1/40 the scale of the map
  let rz = z / 40;
  hz = rz / 2;
  ctx.drawImage(rover, -hz, -hz, rz, rz);

  ctx.restore();

  //console.log({ ms, mz, md });

  work.x += ms * Math.cos((d+90)*Math.PI/180) / z;
  work.y += ms * Math.sin((d+90)*Math.PI/180) / z;
  work.z += mz;
  work.d += md;
}
