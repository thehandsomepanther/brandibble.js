import _ from 'lodash';
import LineItem from './LineItem';

export default class Cart {
  constructor() {
    this.lineItems = [];
  }

  isValid() {
    return _(this.lineItems).map(lineItem => {
      return lineItem.isValid();
    }).every();
  }

  addLineItem(product, quantity=1) {
    let lineItem = new LineItem(product, quantity);
    this.lineItems.push(lineItem);
    return lineItem;
  }

  getLineItemQuantity(lineItem) {
    let match = _.find(this.lineItems, li => _.isEqual(li, lineItem));
    if (match) { return match.quantity; }
    return 0;
  }

  setLineItemQuantity(lineItem, quantity=1) {
    let match = _.find(this.lineItems, li => _.isEqual(li, lineItem));
    if (match) { match.quantity = quantity; return true; }
    return false;
  }

  removeLineItem(lineItem) {
    this.lineItems = _.filter(this.lineItems, li => _.isEqual(li, lineItem));
    return this.lineItems;
  }

  format() {
    return _(this.lineItems).map(lineItem => {
      return lineItem.format();
    }).value();
  }
}
