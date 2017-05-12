import Order from 'brandibble/models/order';

export default class Orders {
  constructor(adapter, events) {
    this.adapter = adapter;
    this.events = events;
  }

  create(locationId, serviceType, paymentType, miscOptions) {
    const order = new Order(this.adapter, locationId, serviceType, paymentType, miscOptions);
    return this.adapter.persistCurrentOrder(order);
  }

  current() {
    return this.adapter.currentOrder;
  }

  /* The only attrs testChanges accepts are location_id, service_type & requested_at */
  validateCart(orderObj, testChanges = {}) {
    const body = orderObj.formatForValidation();
    Object.assign(body, testChanges);
    return this.adapter.request('POST', 'cart/validate', body);
  }

  validate(orderObj) {
    const body = orderObj.format();
    return this.adapter.request('POST', 'orders/validate', body);
  }

  submit(orderObj) {
    const body = orderObj.format();
    const promise = this.adapter.request('POST', 'orders/create', body);
    this.events.triggerAsync('orders.submit', promise);
    return promise;
  }
}
