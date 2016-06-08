import fetch from 'whatwg-fetch';


// TODO: Force this as a singleton
export default class Fetcher {
  constructor({ apiKey, apiBase }) {
    this.apiKey        = apiKey;
    //this.customerToken = this._restoreCustomerToken();
    //this.orderToken    = this._restoreOrderToken();
  }

  makeRequest(method, path, body=null) {
    // TODO: Yup
    // should set customer token?
    return fetch();
  }

  getCustomerId() {
    // TODO: This seems basic
    return atob(this.customerToken.split('.')[1]).customer_id;
  }

  _buildHeaders() {
    let headers = {
      'Brandibble-Api-Key': this.apiKey,
      'Content-Type': 'application/json'
    };
    if (this.customerToken) { headers['Brandibble-Customer-Token'] = this.customerToken; }
    if (this.orderToken) { headers['Brandibble-Customer-Token'] = this.customerToken; }
    return headers;
  }
}
