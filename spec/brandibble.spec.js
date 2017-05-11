/* global Brandibble expect it describe */
import { UnsecureApiKey } from './helpers';

// Brandibble Wrapper
describe('Brandibble', () => {
  it('exists', () => expect(Brandibble).to.exist);

  it('sets private variables', () => {
    expect(Brandibble).to.have.property('adapter');
    const adapter = Brandibble.adapter;
    expect(adapter).to.have.property('apiKey', UnsecureApiKey);
    expect(adapter).to.have.property('apiBase', 'https://staging.brandibble.co/api/v1/brands/6/');
  });

  describe('sendSupportTicket', () => {
    it('can create support ticket', () => {
      return Brandibble.sendSupportTicket({
        subject: 'help!',
        body: 'i need avocado!',
      }).then(response => expect(response).to.exist);
    });
  });
});
