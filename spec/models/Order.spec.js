import productJSON from './../product.stub';
import locationJSON from './../location.stub';

describe('Order', () => {
  it('can add a LineItem', () => {
    let newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.addLineItem(productJSON);
    expect(newOrder.cart.lineItems).to.have.lengthOf(1);
  });

  it('can get quantity', done => {
    let newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.addLineItem(productJSON, 3).then(lineItem => {
      expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
      done();
    });
  });

  it('can set quantity', done => {
    let newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.addLineItem(productJSON, 1).then(lineItem => {
      expect(newOrder.getLineItemQuantity(lineItem)).to.equal(1);
      newOrder.setLineItemQuantity(lineItem, 3).then(newQuantity => {
        expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
        done();
      }).catch(error => {
        console.log(error) ;
      });
    });
  });

  it('can remove a LineItem', () => {
    let newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.addLineItem(productJSON);
    let lineItem = expect(newOrder.cart.lineItems).to.have.lengthOf(1);
    newOrder.removeLineItem(lineItem);
    expect(newOrder.cart.lineItems).to.have.lengthOf(0);
  });

  it('does not validate when IDs are passed for customers', done => {
    let newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.setCustomer({customer_id: 123}).then(savedOrder => {
      expect(savedOrder.customer.customer_id).to.exist;
      done();
    });
  });

  it('returns errors for invalid customers', done => {
    let newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.setCustomer({invalidKey: 'hi'}).catch(errors => {
      expect(errors).to.have.keys(['first_name', 'last_name', 'password', 'email']);
      done();
    })
  });

  it('returns true for valid customers', done => {
    let newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    let customer = {
      first_name: 'Hugh',
      last_name: 'Francis',
      email: 'hugh@hugh.co',
      password: 'pizzapasta'
    };
    newOrder.setCustomer(customer).then(order => {
      expect(newOrder.customer).to.have.keys(['first_name', 'last_name', 'password', 'email']);
      done();
    });
  });
});
