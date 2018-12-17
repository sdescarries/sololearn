//const { vectoangle } = require('./main');

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

function expectInt(value) {
  return expect(radianToDegree(value));
}

function radistance(a, b) {

}


describe('vector to angle', () => {

  for (const { x,y,d } of [
    { x: 0, y: 0, d:   0 },
    { x: 1, y: 0, d:   0 },

    { x: 1, y: 1, d:  45 },
    { x: 0, y: 1, d:  90 },
    { x:-1, y: 1, d: 135 },

    { x:-1, y: 0, d: 180 },

    { x:-1, y:-1, d:-135 },
    { x: 0, y:-1, d: -90 },
    { x: 1, y:-1, d: -45 },

  ]) {

    it(`should convert ${x}:${y} to ${d}°`, () => {
      expectInt(vectorToRadian(x, y)).toEqual(d);
    });
  }
});