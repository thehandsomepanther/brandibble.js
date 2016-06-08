var expect = require('chai').expect;
var Brandibble = require('..').default;

// Test Helpers
function seedEmail() {
  return `sanctuary-testing-${Math.floor(Math.random()*90+10)}@example.com`;
}

// Init Brandibble Session for Testing
var BrandibbleInstance = new Brandibble({
  apiKey: '***REMOVED***',
  brandId: 6,
  apiEndpoint: 'http://unsecure.brandibble.co/api/'
});

// Brandibble Wrapper
describe('Brandibble', () => {
  it('exists', () => expect(BrandibbleInstance).to.exist);

  it('sets private variables', () => {
    expect(BrandibbleInstance.__apiEndpoint).to.be.a('string');
    expect(BrandibbleInstance.__apiEndpoint).to.equal('https://www.brandibble.co/api/');

    expect(BrandibbleInstance.__apiBase).to.be.a('string');
    expect(BrandibbleInstance.__apiBase).to.equal('https://www.brandibble.co/api/v1/brands/6/');
  });
});

// Customers
describe('Brandibble.Customers', () => {
  it('exists', () => { expect(BrandibbleInstance.Customers).to.exist });

  it('stores the customer token', () => { expect(BrandibbleInstance.Customers.customerToken).to.exist });

  it('can create a customer', () => {
    BrandibbleInstance.Customers.create({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: seedEmail(),
      password: 'password'
    }).then(response => {
      expect(response).to.be.a('object');
      expect(response).to.have.property('customer_id');
      expect(response).to.have.property('email');
      expect(response).to.have.property('first_name');
      expect(response).to.have.property('last_name');
      expect(response).to.have.property('phone');
    });
  });
});

// Locations
describe('Brandibble.Locations', () => {
  it('exists', () => { expect(BrandibbleInstance.Locations).to.exist });
});
