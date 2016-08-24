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

  format() {
    return _(this.lineItems).map(lineItem => {
      return lineItem.format();
    }).value();
  }
}
