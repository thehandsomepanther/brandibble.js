import validate from 'validate.js';
const ISO8601_PATTERN = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

export default class Menus {
  constructor(adapter) {
    this.adapter = adapter;
  }

  build(location_id, service_type='delivery', date=new Date()) {
    let isISOString = validate({timestamp: date}, {timestamp: {format: ISO8601_PATTERN}});
    let requested_at = isISOString ? `${date.toISOString().split('.')[0]}Z` : date;
    return this.adapter.request('POST', `menus`, { location_id, service_type, requested_at });
  }
}
