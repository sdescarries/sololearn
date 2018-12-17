const imgRoot = 'https://sdescarries.github.io/sololearn/javascript/rover/img';

const imgDb = {
  marstotal: `${imgRoot}/marstotal.jpg`,
  rover: `${imgRoot}/rover.png`,
  space: `${imgRoot}/space.jpg`,
};

const rockImgDb = [
  `${imgRoot}/r1.png`,
  `${imgRoot}/r2.png`,
  `${imgRoot}/r3.png`,
  `${imgRoot}/r4.png`,
];

const banner = `
_________  __________    _____
\\_   ___ \\ \\______   \\  /     \\
/    \\  \\/  |     ___/ /  \\ /  \\
\\     \\____ |    |    /    Y    \\
 \\______  / |____|    \____|__  /
        \\/                    \\/
Mars Rover CPM by Simon`;

const work = {
  // Rover position in % of whole map, 0:0 is origin
  roverPosX: 0,
  roverPosY: 0,

  // Viewing altitude or full map scale
  zoomLevel: 600,

  // Rover direction in radian
  roverRadian: 0.0,

  // Moving speeds
  ms: 0.0,
  mz: 0.0,
  md: 0.0,

  // Pending destination
  to: null,

  // Database of rocks found on surface
  rocks: [],
  store: [],
  closest: -1,
  dist: 1,
  idx: -1,
  auto: true,
};

// Controls
const ctlImgs = {
  lf: `${imgRoot}/left.png`,
  rt: `${imgRoot}/right.png`,
  fw: `${imgRoot}/up.png`,
  bk: `${imgRoot}/down.png`,
  up: `${imgRoot}/zoomin.png`,
  dn: `${imgRoot}/zoomout.png`,
  pk: `${imgRoot}/grab.png`,
  dp: `${imgRoot}/drop.png`,
  cm: `${imgRoot}/camera.png`,
  lb: `${imgRoot}/lab.png`,
  au: `${imgRoot}/rover.png`,
};

// prettify number
function pn(num) {
  return parseInt(num * 1000, 10).toString(10);
}

const oneDegRad = Math.PI / 180;

/*

   Canvas coordinates

        -y
         │
         │0
   -x ───┼──── +x
         │
         │
        +y

   Vector representation

      a
   ϴ ───┐
     ╲  │
    h ╲ │o
       ╲│
       x:y

   ϴ = arctan(o) if a == 1;
   ϴ = arcsin(o) if h == 1;
   ϴ = arccos(a) if h == 1;

*/

function pythagorean(x, y) {
  return Math.sqrt(x*x + y*y);
}

function vectorToRadian(x, y) {

  const hypotenuse = pythagorean(x, y);
  const adjacent = x / hypotenuse;
  const radian = Math.acos(adjacent);

  if (radian !== radian) {
    return 0;
  }

  if (y < 0) {
    return radian * -1;
  }

  return radian;
}

function radianToDegree(radian) {
  const degree = radian / Math.PI * 180;
  return parseInt(Math.round(degree), 10);
}

function delta(src, dst, range) {
  let dist = dst - src;
  let mul = Math.abs(Math.floor(dist / range));

  if (dist > range) {
    dist -= range * (mul + 1);
  } else if (dist < -range) {
    dist += range * mul;
  }

  return dist;
}

function radianDelta(src, dst) {
  return delta(src, dst, Math.PI);
}

function degreeDelta(src, dst) {
  return delta(src, dst, 180);
}

function pickup() {
  const {
    rocks,
    store,
    idx,
  } = work;

  if (store.length >= 5) {
    logMessage('Rock storage is full<br>');
  } else if (idx === -1) {
    logMessage('Rock is too far to be picked<br>');
  } else {

    const rock = rocks[idx];
    const ui = document.querySelector('#storage');

    if (ui) {
      const rockImg = rock.img.cloneNode(true);
      const dropImg = new Image();
      const labImg = new Image();

      dropImg.src = ctlImgs.dp;
      labImg.src = ctlImgs.lb;

      rockImg.className = 'button';
      dropImg.className = 'button';
      labImg.className = 'button';

      dropImg.style.display = 'none';
      labImg.style.display = 'none';

      rockImg.onclick = function () {

        if (dropImg.style.display === 'none') {
          dropImg.style.display = 'block';
          labImg.style.display = 'block';
        } else {
          dropImg.style.display = 'none';
          labImg.style.display = 'none';
        }
      };

      rock.drop = function () {
        ui.removeChild(rockImg);
        ui.removeChild(dropImg);
        ui.removeChild(labImg);
      };

      dropImg.onclick = function () {
        drop(rock);
      };

      labImg.onclick = function () {
        analyse(rock);
      };

      ui.appendChild(rockImg);
      ui.appendChild(dropImg);
      ui.appendChild(labImg);
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
    roverPosX,
    roverPosY,
  } = work;

  let idx = -1;

  if (target != null) {
    idx = store.indexOf(target);
  } else {
    idx = 0;
  }

  if (idx > -1 && store.length > 0) {
    const rock = store[idx];
    store.splice(idx, 1);
    rock.x = roverPosX;
    rock.y = roverPosY;
    const { s } = rock;
    logMessage(`Dropped a rock of size ${pn(s)} at ${pn(roverPosX)}:${pn(roverPosY)}<br>`);
    rocks.push(rock);
    rock.drop();
  } else {
    logMessage('Nothing to drop<br>');
  }
}

function analyse(target) {
  const { store } = work;
  let idx = -1;

  if (target != null) {
    idx = store.indexOf(target);
  } else {
    idx = 0;
  }

  if (idx > -1 && store.length > 0) {
    const rock = store[idx];
    store.splice(idx, 1);
    rock.drop();
    const { s } = rock;
    logMessage(`Analyzing a rock of size ${pn(s)}, please stand by for results...<br>`);

    setTimeout(() => {

      logMessage('<h2>Rock Analysis Results</h2>');
      logMessage(`<img src=${rock.img.src} width=60px>`);

      for (let el of [ 'Na2O', 'MgO', 'Al2O3', 'SiO2', 'SO3', 'CaO', 'FeO', 'Ni', 'Zn' ]) {
        logMessage(`${el}: ${Math.random()}<br>`);
      }

    }, 5000);

  } else {
    logMessage('Nothing to analyze<br>');
  }
}

function move(steps, dir) {

  let {
    ms,
    zoomLevel,
    roverRadian,
    roverPosX, roverPosY,
  } = work;

  if (steps == null) {
    steps = ms;
  }

  if (dir === 'B') {
    steps = -steps;
  }

  let scaledSteps = 0;
  if (steps < 0) {
    scaledSteps = Math.min(-0.01, steps / zoomLevel);
  } else if (steps > 0) {
    scaledSteps = Math.max(0.01, steps / zoomLevel);
  }

  if (scaledSteps === 0) {
    return true;
  }

  // Translate movement into X and Y offsets
  roverPosX -= scaledSteps * Math.cos(roverRadian);
  roverPosY -= scaledSteps * Math.sin(roverRadian);

  // Apply movement only if staying within safe boundaries
  if (pythagorean(roverPosX, roverPosY) < 0.45) {
    work.roverPosX = roverPosX;
    work.roverPosY = roverPosY;
    // logMessage(`Moved ${steps} in ${radianToDegree(roverRadian)}° to ${pn(roverPosX)}:${pn(roverPosY)}<br>`);
    return true;
  } else {
    logMessage('Move request refused, rover would fall off into deep space<br>');
    commands.stop();
    return false;
  }
}

function turn(angle, dir) {

  if (angle === 0) {
    return;
  }

  if (dir === 'L') {
    angle = -angle;
  }

  let { roverRadian } = work;

  roverRadian = radianDelta(0, roverRadian + angle);

  // logMessage(`Turned ${radianToDegree(angle)}° to ${radianToDegree(roverRadian)}°<br>`);
  work.roverRadian = roverRadian;
}

function seek(target) {
  const { rocks, closest } = work;
  if (closest > -1) {
    const { x, y } = rocks[target || closest];
    work.to = { x, y, closest, z: 5000 };
    logMessage(`Seeking rock at ${pn(x)}:${pn(y)}<br>`);
  } else {
    logMessage('No more rock to seek to<br>');
    work.to = null;
    work.auto = false;
  }
}

// Rover commands for buttons
const commands = {
  lf: () => { work.md = -(5 * oneDegRad); },
  rt: () => { work.md = +(5 * oneDegRad); },
  fw: () => { work.ms = +1; },
  bk: () => { work.ms = -1; },
  up: () => { work.mz = 1.1; },
  dn: () => { work.mz = 0.9; },
  pk: () => { pickup(); },
  dp: () => { drop(); },
  au: () => {
    const { auto } = work;

    if (auto) {
      commands.stop();
    }

    work.auto = !auto;
    logMessage(`${auto ? 'disabling' : 'enabling' } auto pilot mode`);
  },
  MOV: (d, s) => { move(parseInt(s, 10), d); },
  TRN: (d, a = 15) => { turn(a * oneDegRad, d); },
  RCK: () => { pickup(); },
  RLS: () => { drop(); },
  ANL: () => { analyse(); },
  PIC: () => { logMessage('Oh snap!<br>'); },
  LOG: () => { logMessage('Look ma, logging!<br>'); },
  SEEK: () => seek(),
  stop: () => {
    work.md = 0;
    work.ms = 0;
    work.mz = 0;
    work.to = null;
  }
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

function applyCli() {
  const { value } = document.querySelector('#cli');
  const argv = value.toUpperCase().split(' ');
  const cmd = argv[0];
  argv.splice(0, 1);

  if (!cmd) {
    return;
  }

  logMessage(`Issuing command ${cmd} ${argv.join(' ')}<br>`);

  try {
    commands[cmd](...argv);
  } catch ({ stack }) {
    logMessage(`<h3>Failed running command</h3><pre>${stack}</pre>`);
  }
}

async function init() {

  document.oncontextmenu = () => false;

  // Seed display values only once
  work.time = Date.now();

  // Adapt layout dynamically
  window.onresize = doLayout;

  {
    // Space background
    const image = work.space = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imgDb.space;
  }

  {
    // An actual satelite image of Mars
    const image = work.marsbg = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imgDb.marstotal;
  }

  {
    // The rover representation
    const image = work.rover = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imgDb.rover;
  }

  const rockImgs = [];

  // Rock images
  for (let src of rockImgDb) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    rockImgs.push(image);
  }

  // Rocks positions
  for (let n = 0; n < 500; n++) {

    let x = (Math.random() - 0.5);
    let y = (Math.random() - 0.5);

    let fx = 0.98;
    let fy = pythagorean(0.5, x) * 2 * fx;

    x *= fx;
    y *= fy;

    const rock = {
      x, y,
      //x: -0.25,
      //y: -0.25,
      s: Math.random(),
      a: Math.random() * 360,
      img: rockImgs[Math.floor(Math.random() * rockImgs.length)],
    };

    work.rocks.push(rock);
  }

  // Buttons that activate until they're released
  for (const ctl of ['lf', 'rt', 'fw', 'bk', 'up', 'dn']) {
    const el = document.querySelector(`#${ctl}`);

    if (!el) {
      continue;
    }

    el.src = ctlImgs[ctl];
    const com = commands[ctl];

    el.addEventListener('pointerdown',  com,  false);
    el.addEventListener('pointerup',    commands.stop, false);
    el.addEventListener('pointerleave', commands.stop, false);
    el.addEventListener('pointermove', () => false, false);
    el.addEventListener('dragstart', () => false, false);
  }

  // Buttons that are shot once
  for (const ctl of ['pk', 'dp', 'cm', 'au']) {
    const el = document.querySelector(`#${ctl}`);

    if (!el) {
      continue;
    }

    el.src = ctlImgs[ctl];

    const com = commands[ctl];

    if (com) {
      el.addEventListener('pointerdown',  com,  false);
      el.addEventListener('pointerup',    () => false, false);
      el.addEventListener('pointerleave', () => false, false);
      el.addEventListener('pointermove', () => false, false);
      el.addEventListener('dragstart', () => false, false);
    }
  }

  work.log = document.querySelector('#log');
  work.canvas = document.querySelector('canvas');
  work.downloadLink = document.querySelector('#downloadLink');
  work.downloadLink.addEventListener('click', camera, false);

  doLayout();
  animate();

  logMessage(`<pre>${banner}</pre>`);
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
    store,
  } = work;

  let {
    roverPosX,
    roverPosY,
    roverRadian,
    zoomLevel,
    mz, md,
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

  let hz = zoomLevel / 2;
  let zx, zy;

  // Map

  zx = -roverPosX * zoomLevel;
  zy = -roverPosY * zoomLevel;

  // Clip a perfect circular region
  ctx.arc(zx, zy, hz * 0.97, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(marsbg, zx - hz, zy - hz, zoomLevel, zoomLevel);

  // Rocks
  work.closest = -1;
  work.idx = -1;
  work.dist = 1;

  for (let idx = 0; idx < rocks.length; idx ++) {

    const rock = rocks[idx];

    zx = rock.x - roverPosX;
    zy = rock.y - roverPosY;
    const dist = zx*zx + zy*zy;

    hz = zoomLevel / (rock.s * 100 + 150);
    zx = zx * zoomLevel - hz / 2;
    zy = zy * zoomLevel - hz / 2;
    ctx.drawImage(rock.img, zx, zy, hz, hz);

    if (work.dist > dist) {
      work.dist = dist;
      work.closest = idx;
    }
  }

  // Rover is 1/40 the scale of the map
  ctx.save();
  ctx.rotate(roverRadian);
  let rz = zoomLevel / 40;
  hz = rz / 2;
  ctx.drawImage(rover, -hz, -hz, rz, rz);
  ctx.restore();

  // Manage the closest rock
  const { closest } = work;
  if (closest > -1) {
    const rock = rocks[closest];
    hz = Math.max(6, zoomLevel / (rock.s * 100 + 150));
    zx = (rock.x - roverPosX) * zoomLevel;
    zy = (rock.y - roverPosY) * zoomLevel;
    ctx.beginPath();
    ctx.arc(zx, zy, hz, 0, Math.PI * 2, true);

    ctx.lineWidth=4;

    if (store.length >= 5) {
      ctx.strokeStyle = '#F22';
    } else {
      if (work.dist < 0.001) {
        work.idx = work.closest;
        ctx.strokeStyle = '#0F0';
      } else {
        ctx.strokeStyle = '#22F';
      }
    }

    ctx.stroke();
  }

  const { to } = work;

  if (to) {

    zx = roverPosX - to.x;
    zy = roverPosY - to.y;
    to.hyp = pythagorean(zx, zy);

    // Get angular distance
    to.rad = vectorToRadian(zx, zy);
    to.del = radianDelta(roverRadian, to.rad);

    const absDel = Math.abs(to.del);

    if (absDel > oneDegRad) {
      md = (to.del < 0 ? -1 : 1);
      md *= Math.min(absDel, oneDegRad * 5);
      work.ms = 0;
    } else {
      work.ms = (1 / zoomLevel);
      md = 0;
    }

    if (work.idx === to.closest) {
      logMessage('Reached closest rock');
      commands.stop();
      pickup();

      if (store.length >= 5) {
        while (store.length) {
          analyse();
        }
      }
      md = 0;
    }

    if (zoomLevel < to.z) {
      mz = 1.01;
    }
  } else if (work.auto) {
    seek(closest);
  }

  turn(md);
  if (!move() && to) {
    logMessage('Rock appears to be unreachable, annihilate with BFG...</br>');
    rocks.splice(to.closest, 1);
    commands.stop();
  }

  zoomLevel *= mz;

  if (zoomLevel > 100 && zoomLevel < 20000) {
    work.zoomLevel = zoomLevel;
  } else {
    work.mz = 0;
  }

  /*
  work.ms = 0;
  work.md = 0;
  work.mz = 0;
  */
}
