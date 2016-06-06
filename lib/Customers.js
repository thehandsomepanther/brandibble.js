import Requestable from './Requestable';

export default class Customers extends Requestable {
  constructor(apiBase) {
    super(apiBase);
    this.customerToken = this._restoreCustomerToken();
  }

  _restoreCustomerToken() {
    return '';
  }

  show() {
    return this.request('GET')
  }
}
