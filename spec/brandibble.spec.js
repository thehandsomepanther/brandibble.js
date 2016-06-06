var expect = require('chai').expect;
var Brandibble = require('..').default;

// Init Brandibble Session for Testing
var BrandibbleInstance = new Brandibble();

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
});

// Locations
describe('Brandibble.Locations', () => {
  it('exists', () => { expect(BrandibbleInstance.Locations).to.exist });
});
