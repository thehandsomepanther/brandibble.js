import { applyPollyfills } from './utils';
applyPollyfills();

import Adapter from './adapter';
import Customers from './customers';
import Locations from './locations';
import Addresses from './addresses';
import Menus from './menus';
import Orders from './orders';

import Order from './models/Order';
import LineItem from './models/LineItem';

export default class Brandibble {
  constructor({ apiKey, brandId, apiEndpoint, apiVersion }) {
    if (!apiKey) { throw new Error('Brandibble.js: Please pass apiKey to the constructor options.'); }
    if (!brandId) { throw new Error('Brandibble.js: Please pass brandId to the constructor options.'); }

    apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    apiVersion  = apiVersion || 'v1';

    let apiBase = `${apiEndpoint}${apiVersion}/brands/${brandId}/`;

    /* Build adapter */
    this.adapter = new Adapter({ apiKey, apiBase });

    /* Export Models */
    this.Order = Order;
    this.LineItem = LineItem;

    /* Build Resources */
    this.customers = new Customers(this.adapter);
    this.locations = new Locations(this.adapter);
    this.addresses = new Addresses(this.adapter);
    this.menus     = new Menus(this.adapter);
    this.orders    = new Orders(this.adapter);
  }
}
