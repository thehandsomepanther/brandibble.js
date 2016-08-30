import { shouldSucceed, shouldError } from './helpers';

describe('Locations', () => {
  it('exists', () => { expect(Brandibble.locations).to.exist });

  it('can show all locations', done => {
    Brandibble.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });
});
