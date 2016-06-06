import Requestable from './Requestable';

export default class Locations extends Requestable {
  constructor(apiBase) {
    super(apiBase);
  }

  show(locationId) {
    return this.request('GET', `/locations/${locationId}`);
  }

  index() {
    return this.request('GET', `/locations`) 
  }
}
