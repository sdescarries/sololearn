const imgRoot = 'https://sdescarries.github.io/sololearn/javascript/rover/img';

const imgDb = {
  // marstotal: 'https://i.postimg.cc/zf4Gg4Gv/marstotal.jpg',
  // rover: 'https://i.postimg.cc/yN3VsnyH/rover.png',
  // space: 'https://i.postimg.cc/tT09TPBV/space.jpg',

  marstotal: `${imgRoot}/marstotal.jpg`,
  rover: `${imgRoot}/rover.png`,
  space: `${imgRoot}/space.jpg`,
};

const rockImgDb = [
  // 'https://i.postimg.cc/brhY6bbj/r1.png',
  // 'https://i.postimg.cc/prJW3TY5/r2.png',
  // 'https://i.postimg.cc/446xYLk4/r3.png',
  // 'https://i.postimg.cc/kgpn0L8s/r4.png',

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
  rocks: [],
  store: [],
  dist: 1,
  idx: -1,
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
    x, y,
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
    rock.x = -x;
    rock.y = -y;
    const { s } = rock;
    logMessage(`Dropped a rock of size ${pn(s)} at ${pn(-x)}:${pn(-y)}<br>`);
    rocks.push(rock);
    rock.drop();
  } else {
    logMessage('Nothing to drop');
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
    logMessage('Nothing to analyze');
  }
}

function move(steps, dir) {

  let {
    ms,
    z, d,
    x, y,
  } = work;

  if (steps == null) {
    steps = ms;
  }

  if (dir === 'B') {
    steps = -steps;
  }

  let s = 0;
  if (steps < 0) {
    s = Math.min(-0.01, steps / z);
  } else if (steps > 0) {
    s = Math.max(0.01, steps / z);
  }

  if (s === 0) {
    return;
  }

  // Translate movement into X and Y offsets
  x += s * Math.cos(d * Math.PI / 180);
  y += s * Math.sin(d * Math.PI / 180);

  // Apply movement only if staying within safe boundaries
  if (Math.sqrt(x*x + y*y) < 0.45) {
    work.x = x;
    work.y = y;
    logMessage(`Moved ${steps} in ${d}° to ${pn(x)}:${pn(y)}<br>`);
  } else {
    logMessage('Move request refused, rover would fall off into deep space<br>');
  }
}

function turn(angle, dir) {

  if (angle === 0) {
    return;
  }

  if (dir === 'L') {
    angle = -angle;
  }

  work.d += angle;
  logMessage(`Turned ${angle}° to ${work.d}°<br>`);
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
  MOV: (d, s) => { move(parseInt(s, 10), d); },
  TRN: (d) => { turn(15, d); },
  RCK: () => { pickup(); },
  RLS: () => { drop(); },
  ANL: () => { analyse(); },
  PIC: () => { logMessage('Oh snap!'); },
  LOG: () => { logMessage('Look ma, logging!'); },
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

    el.src = ctlImgs[ctl];
    el.onpointerdown = () => {
      commands[ctl]();
    };

    el.onpointerup = () => {
      work.ms = 0.0;
      work.mz = 0.0;
      work.md = 0.0;
    };
  }

  for (let ctl of ['pk', 'dp', 'cm']) {
    const el = document.querySelector(`#${ctl}`);

    if (!el) {
      continue;
    }

    el.src = ctlImgs[ctl];

    const com = commands[ctl];

    if (com) {
      el.onclick = () => {
        commands[ctl]();
      };
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
  ctx.rotate((d)*Math.PI/180);
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

  move();
  turn(md);

  z *= mz;

  if (z > 100 && z < 10000) {
    work.z = z;
  }

  /*
  work.ms = 0;
  work.md = 0;
  work.mz = 0;
  */
}
