const types = [
  'bool',
  'int',
  'float',
  'email',
  'date',
  'url',
  'age',
];

class Validator {

  constructor() {
    this.safetyWrap.bind(this);
    for (const type of types) {
      this[type] = this.safetyWrap(type);
    }
  }

  safetyWrap(type) {
    const typeify = `${type}ify`;
    this[typeify].bind(this);

    function safe(input) {
      try {
        const res = this[typeify](input);
        console.log(`success: ${res} is ${type}`);
      } catch({ message }) {
        console.error(`failure: ${JSON.stringify(input)} ${message}`);
      }
    }

    return safe.bind(this);
  }

  boolify(input) {
    if (!['true', 'false', true, false].includes(input)) {
      throw new TypeError('is not boolean true or false');
    }
    return JSON.parse(input);
  }

  intify(input) {
    const res = parseInt(input, 10);
    if (res !== res) {
      throw new TypeError('is not a number');
    }
    return res;
  }

  floatify(input) {
    const res = parseFloat(input);
    if (res !== res) {
      throw new TypeError('is not a number');
    }
    return res;
  }

  emailify(input) {
    const found = input.search(/^[\w,.]+@[\w,.]+\.[\w]{2,4}$/);
    if (found === -1) {
      throw new TypeError('is not an email');
    }
    return input;
  }

  dateify(input) {
    const res = new Date(input);
    const val = res.valueOf();
    if (val !== val) {
      throw new TypeError('is not a date');
    }
    return res.toLocaleString();
  }

  urlify(input) {
    const found = input.search(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
    if (found === -1) {
      throw new TypeError('is not an URL');
    }
    return input;
  }

  ageify(input) {
    const age = this.intify(input);
    if (age < 1 || age > 150) {
      throw new TypeError('is not within 1:150 range');
    }
    return age;
  }
}

const validate = new Validator();

if (process && process.argv.length > 2) {

  // cli mode

  const { argv } = process;

  argv.shift();
  argv.shift();

  const type = argv.shift();
  const input = argv.join(' ');

  validate[type](input);
} else {

  // auto mode, just try a bunch of validations

  validate.bool('true');
  validate.bool(false);
  validate.bool({});

  validate.int('123');
  validate.int(456);
  validate.int('foo');
  validate.int([]);

  validate.email('foo.bar@mail.org');
  validate.email('just a bogus string');

  validate.url('foo://bar.server:1234/res.ext?with=123&some=params');
  validate.url('just a bogus string');

  validate.date('2018 12 30 20:43');
  validate.date('qwerty');
}
