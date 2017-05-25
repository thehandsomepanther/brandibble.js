import Order from 'brandibble/models/order';
import find from 'lodash.find';
import LineItem from 'brandibble/models/lineItem';

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

  buildLineItemOrphan(...args) {
    return this.constructor.buildLineItemOrphan(...args);
  }

  static buildLineItemOrphan(item, menuJSON) {
    console.log(item, 'item');
    const menuSection = find(menuJSON, m => find(m.children, c => find(c.items, i => i.id === item.id)));
    // const menuSection = find(menuJSON, m =>
    //   find(m.children, (c) => {
    //     console.log(c, 'c');
    //     if (c) return find(c.items, i => i.id === item.id);
    //   }));
    // console.log(menuSection, 'menuSection');
    if (!menuSection) return;
    const menuChild = find(menuSection.children, c =>
      find(c.items, i => i.id === item.id));
    const product = find(menuChild.items, i => i.id === item.id);
    const lineItem = new LineItem(product);
    console.log(item, menuJSON, lineItem);
    // try {
    //   (favorite.menu_item_json[0].option_groups || []).forEach((fog) => {
    //     const optionGroup = find(product.option_groups, og => og.id === fog.id);
    //     if (!optionGroup) throw new Error({ message: 'Option Group Missing' });
    //     fog.option_items.forEach((foi) => {
    //       const optionItem = find(optionGroup.option_items, oi => oi.id === foi.id);
    //       if (!optionItem) throw new Error({ message: 'Option Item Missing' });
    //       lineItem.addOption(optionGroup, optionItem);
    //     });
    //   });
    // } catch (e) {
    //   return;
    // }
    return lineItem;
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
