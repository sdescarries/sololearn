
const a = {
  foo: 'bar',
  num: 1234,
  obj: {
    flag: true,
    only: {
      value: 'one',
    },
  },
};

const b = {
  foo: 'bar',
  num: 4321,
  obj: {
    flag: true,
    extra: [ 1, 2, 3 ],
  },
};

function logentry(depth, modifier, value, key) {
  const padding = new Array(depth * 2 + 2).join(' ');

  if (key) {
    key = `${key}: `;
  } else {
    key = '';
  }

  const line = `${modifier}${padding}${key}${value}`;
  jsonDiffOutput.push(line);
  console.log(line);
}

function jsonDiff(a, b, depth = 0) {

  const ksa = Object.keys(a);
  const ksb = Object.keys(b);

  while (true) {

    if (ksa.length === 0 && ksb.length === 0) {
      break;
    }

    const ka = ksa[0];
    const kb = ksb[0];
    const va = a[ka];
    const vb = b[kb];

    if (ka === kb) {

      if (va === vb) {
        logentry(depth, ' ', vb, kb);
      } else if (typeof(va) === typeof(vb)) {
        if (typeof(va) === 'object') {
          logentry(depth, ' ', '{', ka);
          jsonDiff(va, vb, depth + 1);
          logentry(depth, ' ', '}');
        } else {
          logentry(depth, '-', va, ka);
          logentry(depth, '+', vb, kb);
        }
      }
      ksa.shift();
      ksb.shift();
    } else if (!kb || ka < kb) {
      if (typeof(va) === 'object') {
        logentry(depth, '-', '{', ka);
        jsonDiff(va, {}, depth + 1);
        logentry(depth, '-', '}');
      } else {
        logentry(depth, '-', va, ka);
      }
      ksa.shift();
    } else if (!ka || kb < ka) {
      if (typeof(vb) === 'object') {
        logentry(depth, '+', '{', kb);
        jsonDiff({}, vb, depth + 1);
        logentry(depth, '+', '}');
      } else {
        logentry(depth, '+', vb, kb);
      }
      ksb.shift();
    }
  }
}


console.log('\nInputs');
console.log('\na:', JSON.stringify(a, null, 2));
console.log('\nb:', JSON.stringify(b, null, 2));
console.log('\nJSON Diff\n');

var jsonDiffOutput = [];
jsonDiff(a, b);



if (typeof(document) !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('a').innerText = `Input JSON A\n\n${JSON.stringify(a, null, 2)}`;
    document.getElementById('b').innerText = `Input JSON B\n\n${JSON.stringify(b, null, 2)}`;
    document.getElementById('diff').innerText = `JSON Diff Output\n\n${jsonDiffOutput.join('\n')}`;
  });
}
