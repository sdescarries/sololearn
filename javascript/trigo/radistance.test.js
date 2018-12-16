
function radiantodegree(radian) {
  return radian / Math.PI * 180;
}

function expectInt(value) {
  return expect(parseInt(Math.round(value), 10));
}

function delta(src, dst, range) {
  let dist = dst - src;

  if (dist > range) {
    dist -= range * 2;
  } else if (dist < -range) {
    dist += range * 2;
  }

  return dist;
}

function radianDelta(a, b) {
  return delta(a, b, Math.PI);
}

function degreeDelta(a, b) {
  return delta(a, b, 180);
}

describe('degree delta', () => {

  for (const { src, dst, dist } of [
    { src: 0, dst: 0, dist:   0 },
    { src:45, dst: 0, dist:  -45 },
    { src:-45, dst: 0, dist:  45 },
    { src:180, dst:-45, dist:  135 },
    { src:180, dst:-135, dist:  45 },
    { src:180, dst:135, dist:  -45 },
  ]) {

    it(`${src}° -> ${dst}° should give ${dist}°`, () => {
      const value = degreeDelta(src, dst);
      expect(value).toBeLessThanOrEqual(180);
      expectInt(value).toEqual(dist);
    });
  }
});
