import { buildRef, shouldSucceed, shouldError } from './helpers';
let BrandibbleRef = buildRef();

describe('Locations', () => {
  it('exists', () => { expect(BrandibbleRef.locations).to.exist });

  it('can show all locations', done => {
    BrandibbleRef.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });
});
