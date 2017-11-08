/* global Brandibble expect it describe beforeEach */
/* eslint no-new:1 */
import preconfiguredProductJSON from '../stubs/productWithDefaults.stub';

let bases;
let lineItem;
let sauces;
let sides;
let addAvocado;

describe('models/lineItem', () => {
  beforeEach(() => {
    lineItem   = new Brandibble.LineItem(preconfiguredProductJSON, 1);
  });

  it('can add option and increase quantity of option items', () => {
    expect(lineItem.configuration).to.not.have.length.of(0);
  });
});
