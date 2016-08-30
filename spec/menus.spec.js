import { buildRef, shouldSucceed, shouldError } from './helpers';
let BrandibbleRef = buildRef();

describe('Menus', () => {
  it('exists', () => { expect(BrandibbleRef.menus).to.exist });

  it('can build a menu for a location', done => {
    BrandibbleRef.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      BrandibbleRef.menus.build(data[0].location_id, 'pickup').then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('object');
        done();
      }).catch(error => console.log(error.errors[0].code));
    });
  });

  it('can not build a menu for a location when the service in not enabled', done => {
    BrandibbleRef.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      BrandibbleRef.menus.build(data[0].location_id, 'delivery').catch(response => {
        let data = shouldError(response);
        expect(data).to.be.a('array');
        expect(data[0].code).to.equal('orders.validate.service_type_unavailable');
        done();
      });
    });
  });

  it('fails to show a menu for a location that does not exist', done => {
    BrandibbleRef.menus.build(9999999999999).catch(response => {
      let errors = shouldError(response);
      expect(errors).to.be.a('array');
      expect(errors[0].code).to.equal('locations.validate.id_not_found');
      done();
    });
  });
});
