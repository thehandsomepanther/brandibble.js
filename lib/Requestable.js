import fetch from 'whatwg-fetch';
import { polyfill } from 'es6-promise';
if (typeof Promise === 'undefined') { polyfill(); }

export default class Requestable {
  constructor(apiBase) {
    this.__apiBase = apiBase;
  }

  request(method, path) {
    return fetch('GET', 'www.google.com');
  }
}
