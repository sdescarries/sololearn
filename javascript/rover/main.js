const work = {
  // Rover position in % of whole map, 0:0 is origin
  x: 0.0,
  y: 0.0,

  // Viewing altitude or full map scale
  z: 600,

  // Rover direction in degree
  d: 90.0,

  // Moving speeds
  ms: 0.0,
  mz: 0.0,
  md: 0.0,

  // Database of rocks found on surface
  rocks: [],
  store: [],
  dist: 1,
  idx: -1,
};

// prettify number
function pn(num) {
  const str = (num * 1000).toString(10);
  return str.split('.')[0];
}

function pickup() {
  const {
    rocks,
    store,
    idx,
  } = work;

  if (idx >= 0 && store.length < 5) {

    const rock = rocks[idx];
    const ui = document.querySelector('#storage');

    if (ui) {
      const img = rock.img.cloneNode(true);
      img.className = 'button';
      img.rock = rock;
      img.onclick = function () {
        ui.removeChild(this);
        drop(this.rock);
      };
      ui.appendChild(img);
    }

    store.push(rock);
    rocks.splice(idx, 1);
    const { x, y, s } = rock;
    logMessage(`Picked a rock of size ${pn(s)} at ${pn(x)}:${pn(y)}<br>`);
  }
}

function drop(target) {
  const {
    store,
    rocks,
    x, y,
  } = work;

  const idx = store.indexOf(target);

  if (idx > -1) {
    const rock = store[idx];
    store.splice(idx, 1);
    rock.x = -x;
    rock.y = -y;
    const { s } = rock;
    logMessage(`Dropped a rock of size ${pn(s)} at ${pn(-x)}:${pn(-y)}<br>`);
    rocks.push(rock);
  } else {
    logMessage('Nothing to drop');
  }
}

// Rover commands for buttons
const commands = {
  lf: () => { work.md = -5; },
  rt: () => { work.md = +5; },
  fw: () => { work.ms = +1; },
  bk: () => { work.ms = -1; },
  up: () => { work.mz = 1.1; },
  dn: () => { work.mz = 0.9; },
  pk: () => { pickup(); },
  dp: () => { drop(); },
};

function logMessage(content) {
  const {
    log
  } = work;

  log.insertAdjacentHTML('beforeend', content);
  log.scrollTop = log.scrollHeight;
}

function camera() {
  const {
    canvas,
    downloadLink,
  } = work;

  try {

    const now = new Date();
    const iso = now.toISOString();
    downloadLink.download = `rover-${iso}.jpg`;

    const data = canvas.toDataURL('image/jpeg');
    this.href = data;
  } catch ({ stack }) {
    logMessage(`<h3>Failed taking picture</h3><pre>${stack}</pre>`);
  }
}

async function init() {

  //document.oncontextmenu = () => false;

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

  for (let n = 0; n < 500; n++) {

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

    if (!el) {
      continue;
    }

    el.onpointerdown = () => {
      commands[ctl]();
    };

    el.onpointerup = () => {
      work.ms = 0.0;
      work.mz = 0.0;
      work.md = 0.0;
    };
  }

  for (let ctl of ['pk', 'dp']) {
    const el = document.querySelector(`#${ctl}`);

    if (!el) {
      continue;
    }

    el.onclick = () => {
      commands[ctl]();
    };
  }

  work.log = document.querySelector('#log');
  work.canvas = document.querySelector('canvas');
  work.downloadLink = document.querySelector('#downloadLink');
  work.downloadLink.addEventListener('click', camera, false);

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
    store,
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
      ih = width / ir;
    }
    ctx.drawImage(space, 0, 0, iw, ih);
  }


  // move to the center of the canvas
  ctx.translate(width/2, height/2);

  let hz = z / 2;
  let zx, zy;

  // Map

  zx = x * z;
  zy = y * z;

  ctx.arc(zx, zy, hz * 0.97, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(marsbg, zx - hz, zy - hz, z, z);

  // Rocks
  let closest = -1;
  work.dist = 1;
  work.idx = closest;
  for (let idx = 0; idx < rocks.length; idx ++) {

    const rock = rocks[idx];

    zx = rock.x + x;
    zy = rock.y + y;
    const dist = zx*zx + zy*zy;

    hz = z / (rock.s * 100 + 150);
    zx = zx * z - hz / 2;
    zy = zy * z - hz / 2;
    ctx.drawImage(rock.img, zx, zy, hz, hz);

    if (work.dist > dist) {
      work.dist = dist;
      closest = idx;
    }
  }

  // Rover is 1/40 the scale of the map
  ctx.save();
  ctx.rotate((d-90)*Math.PI/180);
  let rz = z / 40;
  hz = rz / 2;
  ctx.drawImage(rover, -hz, -hz, rz, rz);
  ctx.restore();


  // Manage the closest rock
  if (closest >= 0) {
    const rock = rocks[closest];
    hz = Math.max(6, z / (rock.s * 100 + 150));
    zx = (rock.x + x) * z;
    zy = (rock.y + y) * z;
    ctx.beginPath();
    ctx.arc(zx, zy, hz, 0, Math.PI * 2, true);

    ctx.lineWidth=4;

    if (store.length >= 5) {
      ctx.strokeStyle = '#F22';
    } else {
      if (work.dist < 0.001) {
        work.idx = closest;
        ctx.strokeStyle = '#0F0';
      } else {
        ctx.strokeStyle = '#22F';
      }

    }

    ctx.stroke();
  }

  let s = 0;

  if (ms < 0) {
    s = Math.min(-0.01, ms / z);
  } else if (ms > 0) {
    s = Math.max(0.01, ms / z);
  }

  x += s * Math.cos((d)*Math.PI/180);
  y += s * Math.sin((d)*Math.PI/180);
  z *= mz;
  d += md;

  if (Math.sqrt(x*x + y*y) < 0.45) {
    work.x = x;
    work.y = y;
  }

  if (z > 100) {
    work.z = z;
  }

  work.d = d;
}
