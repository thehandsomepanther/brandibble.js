import Order from 'brandibble/models/order';

export default class Orders {
  constructor(adapter) {
    this.adapter = adapter;
  }

  create(locationId, serviceType, paymentType, miscOptions) {
    let order = new Order(this.adapter, locationId, serviceType, paymentType, miscOptions);
    return this.adapter.persistCurrentOrder(order);
  }

  current() {
    return this.adapter.currentOrder;
  }

  /* The only attrs testChanges accepts are location_id, service_type & requested_at */
  validate(orderObj, testChanges={}) {
    let body = orderObj.formatForValidation();
    Object.assign(body, testChanges);
    return this.adapter.request('POST', 'orders/validate', body);
  }

  submit(orderObj) {
    let body = orderObj.format();
    return this.adapter.request('POST', 'orders/create', body);
  }
}
