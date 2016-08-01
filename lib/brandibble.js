import Adapter from './adapter';
import Customers from './customers';
import Locations from './locations';
import Addresses from './addresses';
import Menus from './menus';

// ISOString Polyfill
if (!Date.prototype.toISOString) {
  (function() {
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
  }());
}

export default class Brandibble {
  constructor({ apiKey, brandId, apiEndpoint, apiVersion }) {
    if (!apiKey) { throw new Error('Brandibble.js: Please pass apiKey to the constructor options.'); }
    if (!brandId) { throw new Error('Brandibble.js: Please pass brandId to the constructor options.'); }

    apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    apiVersion  = apiVersion || 'v1';

    let apiBase = `${apiEndpoint}${apiVersion}/brands/${brandId}/`;

    /* Build adapter */
    this.adapter = new Adapter({ apiKey, apiBase });

    /* Build Resources */
    this.customers = new Customers(this.adapter);
    this.locations = new Locations(this.adapter);
    this.addresses = new Addresses(this.adapter);
    this.menus     = new Menus(this.adapter);
  }
}
