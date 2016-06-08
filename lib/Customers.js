export default class Customers {
  constructor(Fetcher) {
    this.Fetcher = Fetcher;
  }

  /* email, password */
  token(body) {
    return this.Fetcher.makeRequest('POST', 'customers/token', body);
  }
  
  show() {
    return this.Fetcher.makeRequest('GET', `customers/${this.Fetcher.getCustomerId()}`);
  }

  /* first_name, last_name, email, password */
  create(body) {
    return this.Fetcher.makeRequest('POST', 'customers', body);
  }
  
  update(body) {
    return this.Fetcher.makeRequest('PUT', 'customers', body);
  }

  // Reponse
  /*{
  "data": {
    "customer_id": 87413,
    "email": "hughfrancis89@gmail.com",
    "first_name": "Hugh",
    "last_name": "Francis",
    "phone": null
  }*/
}
