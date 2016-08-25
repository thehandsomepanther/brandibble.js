import { buildRef, shouldSucceed, shouldError } from './helpers';
let Brandibble = buildRef();

describe('Orders', () => {
  it('exists', () => { expect(Brandibble.orders).to.exist });

  it('can validate an order', done => {
    Brandibble.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');

      let serviceType = 'pickup';
      let location = data[0];
      expect(location.name).to.equal('Columbia');

      Brandibble.menus.build(location.location_id, serviceType).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('object');
        expect(data.menu).to.be.a('array');

        let newOrder = new Brandibble.Order(location, serviceType);
        let product  = data.menu[0].children[0].items[0];
        let lineItem = newOrder.cart.addLineItem(product, 1);

        expect(lineItem.product.name).to.equal('Charred Chicken');
        expect(lineItem.isValid()).to.equal(false);
        expect(newOrder.cart.isValid()).to.equal(false);

        let bases = lineItem.optionGroups()[0];
        let sides = lineItem.optionGroups()[1];

        lineItem.addOption(bases, bases.option_items[0])
        lineItem.addOption(sides, sides.option_items[0])

        expect(lineItem.isValid()).to.equal(true);
        expect(newOrder.cart.isValid()).to.equal(true);

        Brandibble.orders.validate(newOrder).then(response => {
          let data = shouldSucceed(response);
          expect(data).to.be.a('object');
          done();
        }).catch(error => console.log(error));
      });
    });
  });
});
