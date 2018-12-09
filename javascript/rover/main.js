const work = {
  // Rover position in % of whole map, 0:0 is origin
  x: 0.0,
  y: 0.0,

  // Viewing altitude or full map scale
  z: 600,

  // Rover direction in degree
  d: 0.0,

  // Moving speeds
  ms: 0.0,
  mz: 0.0,
  md: 0.0,

  // Database of rocks found on surface
  rocks: []
};

// Rover commands for buttons
const commands = {
  lf: () => { work.md = -5; },
  rt: () => { work.md = +5; },
  fw: () => { work.ms = +1; },
  bk: () => { work.ms = -1; },
  up: () => { work.mz = 1.1; },
  dn: () => { work.mz = 0.9; },
};

async function init() {

  // Seed display values only once
  work.time = Date.now();

  // Adapt layout dynamically
  window.onresize = doLayout;

  {
    // Space background
    const image = work.space = new Image();
    image.src = 'https://ak4.picdn.net/shutterstock/videos/3014164/thumb/1.jpg';
  }

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

  for (let n = 0; n < 100; n++) {

    let x = (Math.random() - 0.5);
    let y = (Math.random() - 0.5);

    let fx = 0.98;
    let fy = Math.sqrt(0.25 - x*x) * 2 * fx;

    x *= fx;
    y *= fy;

    const rock = {
      x, y,
      s: Math.random(),
      a: Math.random() * 360,
      img: rockImgs[Math.floor(Math.random() * rockImgs.length)],
    };

    work.rocks.push(rock);
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

  work.canvas = document.querySelector('canvas');

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

  canvas.width = innerWidth - 350;
  canvas.height = innerHeight;
}

function animate() {

  const {
    canvas,
    animId,
    space,
    marsbg,
    rover,
    rocks,
    time,
    ms, mz, md,
  } = work;

  let {
    x, y, z, d,
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

  ctx.fillStyle = '#555';
  ctx.fillRect(0, 0, width, height);

  // Background
  {
    let iw = space.width;
    let ih = space.height;
    let ir = iw / ih;

    if (ir > width / height) {
      ih = height;
      iw = height * ir;
    } else {
      iw = width;
      ih = width * ir;
    }
    ctx.drawImage(space, 0, 0, iw, ih);
  }


  // move to the center of the canvas
  ctx.translate(width/2, height/2);

  let hz = z / 2;
  let zx, zy;

  // Map

  zx = x * z - hz;
  zy = y * z - hz;

  ctx.arc(zx + hz, zy + hz, hz * 0.97, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(marsbg, zx, zy, z, z);

  const proximity = {};

  // Rocks
  for (let idx = 0; idx < rocks.length; idx ++) {

    const rock = rocks[idx];


    hz = z / (rock.s * 100 + 150);
    zx = (rock.x + x) * z - hz / 2;
    zy = (rock.y + y) * z - hz / 2;
    ctx.drawImage(rock.img, zx, zy, hz, hz);

    const dx = rock.x - x;
    const dy = rock.y - y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (!proximity.dist || proximity.dist > dist) {
      proximity.rock = rock;
      proximity.dist = dist;
    }
  }

  {

    const { rock } = proximity;

    if (work.closestRock !== rock) {
      console.log(proximity);
      work.closestRock = rock;
    }

    hz = z / (rock.s * 100 + 150);
    zx = (rock.x + x) * z;
    zy = (rock.y + y) * z;
    ctx.beginPath();
    ctx.arc(zx + hz, zy + hz, hz, 0, Math.PI * 2, true);
    ctx.lineWidth=5;
    ctx.strokeStyle = '#0F0';
    ctx.stroke();
  }

  ctx.save();
  ctx.rotate(d*Math.PI/180);

  // Rover is 1/40 the scale of the map
  let rz = z / 40;
  hz = rz / 2;
  ctx.drawImage(rover, -hz, -hz, rz, rz);

  ctx.restore();

  let s = 0;

  if (ms < 0) {
    s = Math.min(-0.01, ms / z);
  } else if (ms > 0) {
    s = Math.max(0.01, ms / z);
  }

  x += s * Math.cos((d+90)*Math.PI/180);
  y += s * Math.sin((d+90)*Math.PI/180);
  z *= mz;
  d += md;

  if (Math.sqrt(x*x + y*y) < 0.45) {
    work.x = x;
    work.y = y;
  } else {
    console.log('too close to edge of the world');
  }

  if (z > 100) {
    work.z = z;
  }

  work.d = d;
}
