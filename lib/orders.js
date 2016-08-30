import Order from 'brandibble/models/order';

export default class Orders {
  constructor(adapter) {
    this.adapter = adapter;
  }

  create(locationId, serviceType, miscOptions) {
    let order = new Order(this.adapter, locationId, serviceType, miscOptions);
    return this.adapter.persistCurrentOrder(order);
  }

  current() {
    return this.adapter.currentOrder;
  }

  validate(orderObj) {
    let requested_at = `${new Date().toISOString().split('.')[0]}Z`;
    let body = orderObj.formatForValidation();
    body.requested_at = requested_at;
    return this.adapter.request('POST', 'orders/validate', body);
  }

  submit(orderObj, paymentType, card) {
    let requested_at = `${new Date().toISOString().split('.')[0]}Z`;
    let body = orderObj.format(paymentType, card);
    body.requested_at = requested_at;
    return this.adapter.request('POST', 'orders/create', body);
  }
}
