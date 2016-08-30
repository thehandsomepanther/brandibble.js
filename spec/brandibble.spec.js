import { expect } from 'chai';
import { buildRef, UnsecureApiKey } from './helpers';
let BrandibbleRef = buildRef();

// Brandibble Wrapper
describe('Brandibble', () => {
  it('exists', () => expect(BrandibbleRef).to.exist);

  it('sets private variables', () => {
    expect(BrandibbleRef).to.have.property('adapter');
    let adapter = BrandibbleRef.adapter;
    expect(adapter).to.have.property('apiKey', UnsecureApiKey);
    expect(adapter).to.have.property('apiBase', 'https://staging.brandibble.co/api/v1/brands/6/');
  });
});

