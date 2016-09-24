import chai from 'chai';
import { Clock } from 'lib/models';

const expect = chai.expect;

const validate = (actual, expected, mins) => {
  expect(actual.getFullYear()).to.be.equal(expected.getFullYear());
  expect(actual.getMonth()).to.be.equal(expected.getMonth());
  expect(actual.getDate()).to.be.equal(expected.getDate());
  expect(actual.getHours()).to.be.equal(expected.getHours());
  expect(actual.getMinutes()).to.be.equal(mins);
  expect(actual.getSeconds()).to.be.equal(0);
  expect(actual.getMilliseconds()).to.be.equal(0);
};

describe('Clock', () => {

  it('must return a floor of 5 minutes', () => {
    const at = 5;

    let from = new Date(2016, 2, 3, 6, 8, 23, 123);
    let result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 5);

    from = new Date(2016, 2, 3, 6, 2, 23, 123);
    result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 0);

    from = new Date(2016, 2, 3, 6, 10, 23, 123);
    result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 10);

    from = new Date(2016, 2, 3, 6, 11, 23, 123);
    result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 10);

    from = new Date(2016, 2, 3, 6, 11, 23, 123);
    result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 10);

    from = new Date(2016, 2, 3, 6, 19, 23, 123);
    result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 15);

    from = new Date(2016, 2, 3, 6, 59, 23, 123);
    result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 55);

    from = new Date(2016, 2, 3, 6, 0, 23, 123);
    result = Clock.floorTime(from, at, 'minutes');
    validate(new Date(result), from, 0);
  });

});
