/* global Brandibble chai expect it describe */
import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);

describe('Events', () => {
  it('can be subscribed to', () => {
    const callMeMaybe = () => {};
    const spy = chai.spy(callMeMaybe);
    Brandibble.events.subscribe(spy);
    const spyMeta = spy.__spy;
    expect(spyMeta.called).to.be.false;
    return Brandibble.customers.invalidate().then(() => {
      expect(spyMeta.called).to.be.true;
      expect(spyMeta.calls.length).to.eq(1);
      const args = spyMeta.calls[0];
      expect(args[0]).to.eq('customers.invalidate.success');
      return true;
    });
  });
});
