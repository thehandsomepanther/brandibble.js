import Customers from './Customers';
import Locations from './Locations';

export default class Brandibble {

  constructor(brandId = 6, apiEndpoint = 'https://www.brandibble.co/api/', apiVersion = 'v1', developmentMode = false) {
    // System Vars
    this.__apiEndpoint     = apiEndpoint;
    this.__apiVersion      = apiVersion;
    this.__brandId         = brandId;
    this.__developmentMode = developmentMode;
    this.__apiBase         = `${apiEndpoint}${apiVersion}/brands/${brandId}/`;
    
    // Resource Fetchers
    this.Customers = new Customers(this.__apiBase);
    this.Locations = new Locations(this.__apiBase);
  }
}
