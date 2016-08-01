export default class Locations {
  constructor(adapter) {
    this.adapter = adapter;
  }

  index() {
    return this.adapter.request('GET', `locations`);
  }
}
