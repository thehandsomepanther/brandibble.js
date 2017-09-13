/* global Brandibble expect it describe beforeEach */
import { shouldSucceed } from './helpers';
import ProductJSON from './product.stub';

describe('Images', () => {
  it('exists', () => expect(Brandibble.images).to.exist);

  it('can show images when an integer is passed', () => {
    return Brandibble.images.show(ProductJSON.id).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });

  it('can show images when an array of integers is passed', () => {
    return Brandibble.images.show([ProductJSON.id, ProductJSON.option_groups[0].option_items[0].id]).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });
});
