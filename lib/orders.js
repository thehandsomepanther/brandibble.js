export default class Orders {
  constructor(adapter) {
    this.adapter = adapter;
  }

  validate(orderObj) {
    let requested_at = `${new Date().toISOString().split('.')[0]}Z`;
    let body = orderObj.format();
    body.requested_at = requested_at;
    return this.adapter.request('POST', 'orders/validate', body);
  }

  create(location_id, service_type='delivery', address, cart, customer, options=defaultOptions) {
    let requested_at = `${new Date().toISOString().split('.')[0]}Z`;

    const {
      include_utensils,
      notes_for_store,
      payment_type,
      tip
    } = options;

    return this.adapter.request('POST', `/orders/create`, {
      location_id,
      service_type,
      requested_at,
      cart,
      address,
      customer,
    });
  }
}
