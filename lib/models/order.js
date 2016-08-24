import Cart from 'brandibble/models/Cart';

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
    this.miscOptions = miscOptions;
  }

  isValid() {
    return this.cart.isValid();
  }

  addLineItem() {
    return this.cart.addLineItem(...arguments);
  }

  getLineItemQuantity() {
    return this.cart.getLineItemQuantity(...arguments);
  }

  setLineItemQuantity() {
    return this.cart.setLineItemQuantity(...arguments);
  }

  removeLineItem() {
    return this.cart.removeLineItem(...arguments);
  }

  format() {
    return {
      location_id: this.location.location_id,
      service_type: this.serviceType,
      cart: this.cart.format()
    }
  }
}
