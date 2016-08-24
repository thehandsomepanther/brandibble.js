import { buildRef } from './../helpers';
import productJSON from './../product.stub';
import locationJSON from './../location.stub';
let Brandibble = buildRef();

describe('Order', () => {
  it('can add a LineItem', () => {
    let newOrder = new Brandibble.Order(locationJSON, 'pickup');
    newOrder.addLineItem(productJSON);
    expect(newOrder.cart.lineItems).to.have.lengthOf(1);
  });

  it('can get quantity', () => {
    let newOrder = new Brandibble.Order(locationJSON, 'pickup');
    let lineItem = newOrder.addLineItem(productJSON, 3);
    expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
  });

  it('can set quantity', () => {
    let newOrder = new Brandibble.Order(locationJSON, 'pickup');
    let lineItem = newOrder.addLineItem(productJSON, 1);
    expect(newOrder.getLineItemQuantity(lineItem)).to.equal(1);
    newOrder.setLineItemQuantity(lineItem, 3);
    expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
  });

  it('can remove a LineItem', () => {
    let newOrder = new Brandibble.Order(locationJSON, 'pickup');
    newOrder.addLineItem(productJSON);
    let lineItem = expect(newOrder.cart.lineItems).to.have.lengthOf(1);
    newOrder.removeLineItem(lineItem);
    expect(newOrder.cart.lineItems).to.have.lengthOf(0);
  });
});
