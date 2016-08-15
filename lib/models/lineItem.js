import _ from 'lodash';

export default class LineItem {
  constructor(product, quantity=1) {
    this.product = product;
    this.quantity = quantity;
    this.configuration = [];
    this.madeFor = null;
    this.instructions = null;
  }

  addOption(group, item) {
    // TODO: Check this operation is valid
    let match = _.find(this.configuration, { optionGroupId: group.id });
    if (match) {
      match.optionItems.push(item);
    } else {
      this.configuration.push({
        optionGroupId: group.id,
        optionItems: [item]
      });
    }
    return true;
  }

  isValid() {
    return this.errors().length === 0;
  }

  errors() {
    let optionGroups = this.product.option_groups || [];
    return _(optionGroups).map(group => {
      let match = _.find(this.configuration, { optionGroupId: group.id });
      let count = match ? match.optionItems.length : 0;
      if (count < group.min_options) { return `option_group_too_few:${group.id}` }
      if (count > group.max_options) { return `option_group_too_many:${group.id}`}
    }).compact().value();
  }

  format() {
    return {
      id: this.product.id,
      made_for: this.madeFor,
      instructions: this.instructions,
      price: this.product.price,
      quantity: this.quantity,
      option_groups: _.map(this.configuration, g => {
        return {
          id: g.optionGroupId,
          option_items: _.map(g.optionItems, oi => {
            return {
              id: oi.id,
              price: oi.price
            }
          })
        }
      })
    }
  }
}
