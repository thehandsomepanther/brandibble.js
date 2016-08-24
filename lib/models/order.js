import Cart from './Cart';

const defaultOptions = {
  include_utensils: true,
  notes_for_store: "These are notes for the store.",
  payment_type: "cash",
  tip: 9.5
}

export default class Order {
  constructor(location, serviceType='delivery', miscOptions=defaultOptions) {
    this.cart = new Cart();
    this.location = location;
    this.serviceType = serviceType;
    this.miscOptions = defaultOptions;
  }

  format() {
    return {
      location_id: this.location.location_id,
      service_type: this.serviceType,
      cart: this.cart.format()
    }
  }
}
