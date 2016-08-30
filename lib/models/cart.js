import _ from 'lodash';
import LineItem from 'brandibble/models/lineItem';

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

  addOptionToLineItem(lineItem, group, item) {
    let match = _.find(this.lineItems, li => _.isEqual(li, lineItem));
    if (match) { return match.addOption(group, item); }
    return false;
  }

  removeOptionFromLineItem(lineItem, item) {
    let match = _.find(this.lineItems, li => _.isEqual(li, lineItem));
    if (match) { return match.removeOption(item); }
    return false;
  }

  getLineItemQuantity(lineItem) {
    let match = _.find(this.lineItems, li => _.isEqual(li, lineItem));
    if (match) { return match.quantity; }
    return 0;
  }

  setLineItemQuantity(lineItem, quantity=1) {
    let match = _.find(this.lineItems, li => _.isEqual(li, lineItem));
    if (match) { match.quantity = quantity; return quantity; }
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
