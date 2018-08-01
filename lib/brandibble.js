'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var polyfill = _interopDefault(require('es6-promise'));
var validate = _interopDefault(require('validate.js'));
var find = _interopDefault(require('lodash.find'));
var filter = _interopDefault(require('lodash.filter'));
var map = _interopDefault(require('lodash.map'));
var compact = _interopDefault(require('lodash.compact'));
var sortBy = _interopDefault(require('lodash.sortby'));
var reverse = _interopDefault(require('lodash.reverse'));
var reduce = _interopDefault(require('lodash.reduce'));
var every = _interopDefault(require('lodash.every'));
var reject = _interopDefault(require('lodash.reject'));
var CircularJSON = _interopDefault(require('circular-json'));
var querystring = _interopDefault(require('querystring'));

var cardValidations = {
  cc_number: {
    presence: true,
    length: { minimum: 15, maximum: 16 }
  },
  cc_cvv: {
    presence: true,
    length: { minimum: 3, maximum: 4 }
  },
  cc_zip: {
    presence: true,
    numericality: true,
    length: { is: 5 }
  },
  cc_expiration: {
    presence: true,
    length: { is: 4 }
  }
};

var customerValidations = {
  email: {
    presence: true,
    email: true
  },
  password: {
    length: { minimum: 6 }
  },
  first_name: {
    presence: true
  },
  last_name: {
    presence: true
  }
};

var addressValidations = {
  street_address: {
    presence: true,
    length: { minimum: 3 }
  },
  unit: {},
  city: {
    presence: true,
    length: { minimum: 3 }
  },
  state_code: {
    presence: true,
    length: { is: 2 }
  },
  zip_code: {
    presence: true,
    length: { is: 5 }
  },
  latitude: {
    presence: true,
    numericality: true
  },
  longitude: {
    presence: true,
    numericality: true
  },
  company: {
    length: { minimum: 3 }
  },
  contact_name: {},
  contact_phone: {}
};

var productValidations = {
  id: {
    presence: true,
    numericality: true
  },
  option_groups: {
    isArray: true
  }
};

/* global window performance */

function dasherize(str) {
  return str.replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
}

function queryStringBuilder() {
  var queryObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return Object.keys(queryObject).map(function (k) {
    /* Encode dates to Brandibble's almost ISO8601 Format */
    if (queryObject[k] instanceof Date) {
      var branddibleDateFormat = queryObject[k].toISOString().split('.')[0] + 'Z';
      return encodeURIComponent(k) + '=' + encodeURIComponent(branddibleDateFormat);
    }
    return encodeURIComponent(k) + '=' + encodeURIComponent(queryObject[k]);
  }).join('&');
}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function applyPollyfills() {
  // Better length validation for numbers
  var length = validate.validators.length;
  validate.validators.length = function (value, options, key, attributes) {
    var _value = value;
    if (validate.isNumber(_value)) {
      _value = '' + _value;
    }
    return length.call(this, _value, options, key, attributes);
  };

  // Is Array for Validate.js
  validate.validators.isArray = function (value) {
    if (validate.isArray(value)) {
      return;
    }
    return 'must be an array';
  };

  if (typeof Promise === 'undefined') {
    polyfill();
  }

  if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
      var date = this.getUTCFullYear();
      date += '-' + pad(this.getUTCMonth() + 1);
      date += '-' + pad(this.getUTCDate());
      date += 'T' + pad(this.getUTCHours());
      date += ':' + pad(this.getUTCMinutes());
      date += ':' + pad(this.getUTCSeconds());
      date += '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';

      return date;
    };
  }

  if (typeof Object.assign !== 'function') {
    Object.assign = function (target) {

      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (var index = 1; index < arguments.length; index += 1) {
        var source = arguments[index];
        if (source != null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  }
}

var TestCreditCards = {
  visa: [{ response: 'approval', number: '4788250000121443' }, { response: 'refer_call', number: '4387751111111020' }, { response: 'do_not_honor', number: '4387751111111038' }, { response: 'card_expired', number: '4387751111111046' }, { response: 'insufficient_funds', number: '43877511111110531' }],
  mastercard: [{ response: 'approval', number: '5454545454545454' }, { response: 'refer_call', number: '5442981111111023' }, { response: 'do_not_honor', number: '5442981111111031' }, { response: 'card_expired', number: '5442981111111049' }, { response: 'insufficient_funds', number: '5442981111111056' }],
  amex: [{ response: 'approval', number: '371449635398431' }],
  discover: [{ response: 'approval', number: '6011000995500000' }, { response: 'refer_call', number: '6011000995511122' }, { response: 'do_not_honor', number: '6011000995511130' }, { response: 'card_expired', number: '6011000995511148' }, { response: 'insufficient_funds', number: '6011000995511155' }]
};

var PaymentTypes = {
  CASH: 'cash',
  CREDIT: 'credit',
  LEVELUP: 'levelup'
};

var ISO8601_PATTERN = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

// http://stackoverflow.com/posts/8809472/revisions
function generateUUID() {
  var suffix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  var uuid = 'xxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  if (suffix && suffix.length) return '' + uuid + dasherize(suffix);
  return uuid;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var OptionOperations = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
};

var OptionStatus = {
  ABSENT: 'ABSENT',
  PRESENT: 'PRESENT'
};

var LineItem = function () {
  function LineItem(product) {
    var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var uuid = arguments[2];
    classCallCheck(this, LineItem);

    var result = validate(product, productValidations);
    if (result) throw result;

    /* Allow uuid incase we want to rehyrate this lineItem. */
    this.uuid = uuid || generateUUID(product.name);
    this.product = product;
    this.quantity = quantity;
    this.configuration = [];
    this.madeFor = '';
    this.instructions = '';
    this.operationMaps = [];

    if (!uuid) this._applyDefaultConfiguration();
    this._generateOperationMaps();
  }

  createClass(LineItem, [{
    key: 'configurationForGroup',
    value: function configurationForGroup(groupOrId) {
      var optionGroupId = (typeof groupOrId === 'undefined' ? 'undefined' : _typeof(groupOrId)) === 'object' ? groupOrId.id : parseInt(groupOrId);
      return find(this.configuration, { optionGroupId: optionGroupId });
    }
  }, {
    key: 'addOption',
    value: function addOption(group, item) {
      var groupConfig = this.configurationForGroup(group);
      var canAdd = group.max_options === 0 || group.max_options > (groupConfig ? groupConfig.optionItems.length : 0);

      if (!canAdd) {
        var error = {
          error: 'Can not add another option for this group.',
          type: 'option_group',
          subject: group,
          relatedConfiguration: groupConfig
        };
        throw error;
      }

      var match = find(this.configuration, { optionGroupId: group.id });
      if (match) {
        match.optionItems.push(item);
      } else {
        this.configuration.push({
          optionGroupId: group.id,
          optionItems: [item]
        });
      }
      this._generateOperationMaps();
      return true;
    }
  }, {
    key: 'removeOption',
    value: function removeOption(item) {
      var match = find(this.configuration, { optionGroupId: item.group_id });
      var firstMatchingOptionItem = find(match.optionItems, function (oi) {
        return oi.id === item.id;
      });
      if (!firstMatchingOptionItem) return false;
      match.optionItems.splice(match.optionItems.indexOf(firstMatchingOptionItem), 1);
      this._generateOperationMaps();
      return true;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      return this.errors().length === 0;
    }
  }, {
    key: 'hasOptionGroups',
    value: function hasOptionGroups() {
      return this.optionGroups().length > 0;
    }
  }, {
    key: 'optionGroups',
    value: function optionGroups() {
      return this.product.option_groups || [];
    }
  }, {
    key: 'errors',
    value: function errors() {
      var _this = this;

      var optionGroups = this.product.option_groups || [];
      return compact(map(optionGroups, function (group) {
        var match = find(_this.configuration, { optionGroupId: group.id });
        var count = match ? match.optionItems.length : 0;
        if (count < group.min_options) {
          return {
            error: 'Too Few Options added for this Group.',
            subjectType: 'option_group',
            subject: group,
            relatedConfiguration: _this.configurationForGroup(group)
          };
        }
        if (group.max_options !== 0 && count > group.max_options) {
          return {
            error: 'Too Many Options added for this Group.',
            subjectType: 'option_group',
            subject: group,
            relatedConfiguration: _this.configurationForGroup(group)
          };
        }
      }));
    }
  }, {
    key: 'format',
    value: function format() {
      var mapItems = function mapItems(_ref) {
        var id = _ref.id;
        return { id: id };
      };
      var mapGroup = function mapGroup(group) {
        return {
          id: group.optionGroupId,
          option_items: map(group.optionItems, mapItems)
        };
      };
      var option_groups = map(this.configuration, mapGroup);

      return {
        id: this.product.id,
        made_for: this.madeFor,
        instructions: this.instructions,
        quantity: this.quantity,
        option_groups: option_groups
      };
    }
  }, {
    key: 'formatForFavorites',
    value: function formatForFavorites() {
      var mapItems = function mapItems(_ref2) {
        var id = _ref2.id;
        return { id: id };
      };
      var mapGroup = function mapGroup(group) {
        return {
          id: group.optionGroupId,
          option_items: map(group.optionItems, mapItems)
        };
      };
      var option_groups = map(this.configuration, mapGroup);

      return {
        id: this.product.id,
        instructions: this.instructions,
        made_for: this.madeFor,
        option_groups: option_groups
      };
    }
  }, {
    key: '_applyDefaultConfiguration',
    value: function _applyDefaultConfiguration() {
      var _this2 = this;

      (this.product.option_groups || []).forEach(function (og) {
        og.option_items.forEach(function (oi) {
          // If opt_is_default is 1, add it as an option!
          if (oi.opt_is_default) {
            // This should never fail, but if it does it's not a deal breaker.
            try {
              _this2.addOption(og, oi);
            } catch (e) {}
          }
        });
      });
      return this.configuration;
    }
  }, {
    key: '_generateOperationMaps',
    value: function _generateOperationMaps() {
      var _this3 = this;

      var maps = sortBy(map(this.optionGroups(), function (optionGroup) {
        var configGroup = _this3.configurationForGroup(optionGroup.id);
        var currentlySelectedCount = configGroup ? configGroup.optionItems.length : 0;
        var canAddMoreToThisGroup = optionGroup.max_options === 0 || currentlySelectedCount < optionGroup.max_options;
        var requiresMoreInThisGroup = currentlySelectedCount < optionGroup.min_options;

        var remainingIncludedOptions = optionGroup.included_options - currentlySelectedCount;
        var additionalOptionsCount = currentlySelectedCount - optionGroup.included_options;

        if (remainingIncludedOptions < 0) {
          remainingIncludedOptions = 0;
        }
        if (additionalOptionsCount < 0) {
          additionalOptionsCount = 0;
        }

        var extraOptionsWillIncurCost = canAddMoreToThisGroup ? remainingIncludedOptions === 0 : false;

        return {
          id: optionGroup.id,
          optionGroupData: optionGroup,
          name: optionGroup.name,
          canAddMoreToThisGroup: canAddMoreToThisGroup,
          requiresMoreInThisGroup: requiresMoreInThisGroup,
          extraOptionsWillIncurCost: extraOptionsWillIncurCost,
          currentlySelectedCount: currentlySelectedCount,
          totalAllowedCount: optionGroup.max_options,
          remainingIncludedOptions: remainingIncludedOptions,
          additionalOptionsCount: additionalOptionsCount,
          totalEffectOnPrice: '0.00', /* This is overriden in the pricing loop below */
          optionItems: sortBy(map(optionGroup.option_items, function (option) {
            /* Find all currently added options of the same id */
            var matchingOptionItems = configGroup ? filter(configGroup.optionItems, { id: option.id }) : [];
            var quantity = matchingOptionItems.length;
            var presence = quantity > 0 ? OptionStatus.PRESENT : OptionStatus.ABSENT;

            /* Build the allowd Operations here */
            var allowedOperations = [];
            if (canAddMoreToThisGroup) {
              allowedOperations.push({
                operation: OptionOperations.ADD,
                costPerOperation: extraOptionsWillIncurCost ? option.price : '0.00'
              });
            }
            if (presence === OptionStatus.PRESENT) {
              allowedOperations.push({
                operation: OptionOperations.REMOVE,
                costPerOperation: '0.00' /* Overriden Later in Pricing Loop */
              });
            }
            return {
              optionId: option.id,
              optionItemData: option,
              costPerUnit: option.price,
              presence: presence,
              allowedOperations: allowedOperations,
              quantity: quantity,
              effectOnPrice: '0.00', /* Overriden Later in Pricing Loop */
              quantityContributingToPrice: 0 /* Overriden Later in Pricing Loop */
            };
          }), function (i) {
            return i.menu_position;
          })
        };
      }), function (i) {
        return i.menu_position;
      });

      /* Loop through all options and determine cost incurred for each */
      maps.forEach(function (operationMap) {
        var _operationMap = operationMap;
        /* No additional options are selected, so set everything to "0.00" */
        if (_operationMap.additionalOptionsCount === 0) {
          return;
        }

        /* Additional Options are selected, so sort the optionItems array to find the most expensive */
        var presentItems = filter(_operationMap.optionItems, function (i) {
          return i.presence === OptionStatus.PRESENT;
        });
        var mostExpensivePresentOptionItems = reverse(sortBy(presentItems, function (i) {
          return parseFloat(i.costPerUnit);
        }));

        /* Now work backwards from most expensive and attribute item to price */
        var catchup = 0;
        mostExpensivePresentOptionItems.forEach(function (item) {
          var _item = item;
          var catchupRequired = _operationMap.additionalOptionsCount - catchup;
          if (catchupRequired >= _item.quantity) {
            _item.effectOnPrice = (parseFloat(_item.costPerUnit) * _item.quantity).toFixed(2);
            _item.quantityContributingToPrice = _item.quantity;
            var removalOperation = find(_item.allowedOperations, function (o) {
              return o.operation === OptionOperations.REMOVE;
            });
            removalOperation.costPerOperation = _item.costPerUnit;
            catchup += _item.quantity;
          } else {
            _item.quantityContributingToPrice = catchupRequired;
            _item.effectOnPrice = (parseFloat(_item.costPerUnit) * _item.quantityContributingToPrice).toFixed(2);
            catchup += catchupRequired;
          }
          return _item;
        });

        var getTotal = function getTotal(sum, item) {
          return parseFloat(item.effectOnPrice) + sum;
        };
        _operationMap.totalEffectOnPrice = reduce(mostExpensivePresentOptionItems, getTotal, 0.00).toFixed(2);
      });
      this.operationMaps = maps;
      return maps;
    }
  }]);
  return LineItem;
}();

var Cart = function () {
  function Cart() {
    classCallCheck(this, Cart);

    this.lineItems = [];
  }

  createClass(Cart, [{
    key: 'isValid',
    value: function isValid() {
      return every(map(this.lineItems, function (lineItem) {
        return lineItem.isValid();
      }));
    }
  }, {
    key: 'addLineItem',
    value: function addLineItem(product) {
      var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var uuid = arguments[2];

      var lineItem = new LineItem(product, quantity, uuid);
      this.lineItems.push(lineItem);
      return lineItem;
    }
  }, {
    key: 'addOptionToLineItem',
    value: function addOptionToLineItem(lineItem, group, item) {
      var match = find(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        return match.addOption(group, item);
      }
      return false;
    }
  }, {
    key: 'removeOptionFromLineItem',
    value: function removeOptionFromLineItem(lineItem, item) {
      var match = find(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        return match.removeOption(item);
      }
      return false;
    }
  }, {
    key: 'getLineItemQuantity',
    value: function getLineItemQuantity(lineItem) {
      var match = find(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        return match.quantity;
      }
      return 0;
    }
  }, {
    key: 'setLineItemMadeFor',
    value: function setLineItemMadeFor(lineItem) {
      var madeFor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var match = find(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        match.madeFor = madeFor;return madeFor;
      }
      return false;
    }
  }, {
    key: 'setLineItemInstructions',
    value: function setLineItemInstructions(lineItem) {
      var instructions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var match = find(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        match.instructions = instructions;return instructions;
      }
      return false;
    }
  }, {
    key: 'setLineItemQuantity',
    value: function setLineItemQuantity(lineItem) {
      var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      var match = find(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        match.quantity = quantity;return quantity;
      }
      return false;
    }
  }, {
    key: 'removeLineItem',
    value: function removeLineItem(lineItem) {
      this.lineItems = reject(this.lineItems, { uuid: lineItem.uuid });
      return this.lineItems;
    }
  }, {
    key: 'format',
    value: function format() {
      return map(this.lineItems, function (lineItem) {
        return lineItem.format();
      });
    }
  }]);
  return Cart;
}();

var defaultOptions = {
  include_utensils: true,
  notes_for_store: '',
  tip: 0,
  promo_code: ''
};

var serviceTypes = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup'
};

var ASAP_STRING = 'asap';

var Order = function () {
  function Order(adapter, location_id) {
    var serviceType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : serviceTypes.DELIVERY;
    var paymentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var miscOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : defaultOptions;
    classCallCheck(this, Order);

    this.uuid = generateUUID();
    this.adapter = adapter;
    this.cart = new Cart();
    this.creditCard = null;
    this.locationId = location_id;
    this.serviceType = serviceType;
    /* Ensure each object owns it's miscOptions */
    this.miscOptions = Object.assign({}, miscOptions);
    this.requestedAt = ASAP_STRING;
    this.paymentType = paymentType;
    /* This is here so that we can internally mark when
     * a user actually wants a future order, versus the
     * case when we manually set requested_at because we
     * were given a future daypart during a Brandibble menu
     * request cycle. */
    this.wantsFutureOrder = false;
  }

  createClass(Order, [{
    key: 'rehydrateCart',
    value: function rehydrateCart() {
      var _this = this;

      var serializedCart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      (serializedCart.lineItems || []).forEach(function (serializedLineItem) {
        var product = serializedLineItem.product,
            quantity = serializedLineItem.quantity,
            madeFor = serializedLineItem.madeFor,
            instructions = serializedLineItem.instructions,
            configuration = serializedLineItem.configuration,
            uuid = serializedLineItem.uuid;
        /* Important: add directly from cart to avoid new writes to localforage */

        var lineItem = _this.cart.addLineItem(product, quantity, uuid);
        lineItem.madeFor = madeFor;
        lineItem.instructions = instructions;
        lineItem.configuration = configuration;
        lineItem._generateOperationMaps();
      });
      return this;
    }
  }, {
    key: 'setRequestedAt',
    value: function setRequestedAt() {
      var timestampOrAsap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ASAP_STRING;
      var userWantsFutureOrder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (typeof userWantsFutureOrder !== 'boolean') {
        throw new Error('Brandibble.js: You must pass a boolean as the second argument (`userWantsFutureOrder`) to `Order#setRequestedAt`.');
      }
      if (timestampOrAsap === ASAP_STRING) {
        if (userWantsFutureOrder) {
          throw new Error('Brandibble.js: You can not pass `true` for `userWantsFutureOrder` when setting the Order#requested_at to `asap`.');
        }
        this.requestedAt = ASAP_STRING;
        return this.adapter.persistCurrentOrder(this);
      }

      var result = validate({ timestamp: timestampOrAsap }, { timestamp: { format: ISO8601_PATTERN } });
      if (!result) {
        this.wantsFutureOrder = userWantsFutureOrder;
        this.requestedAt = timestampOrAsap;
        return this.adapter.persistCurrentOrder(this);
      }
      return Promise.reject(result);
    }
  }, {
    key: 'setCustomer',
    value: function setCustomer(customer) {
      var customer_id = customer.customer_id;

      if (customer_id) {
        this.customer = { customer_id: customer_id };
        return this.adapter.persistCurrentOrder(this);
      }
      var result = validate(customer, customerValidations);
      if (!result) {
        this.customer = customer;
        return this.adapter.persistCurrentOrder(this);
      }
      return Promise.reject(result);
    }
  }, {
    key: 'setPromoCode',
    value: function setPromoCode(promo) {
      this.miscOptions.promo_code = promo;
      return this.adapter.persistCurrentOrder(this);
    }
  }, {
    key: 'setMiscOptions',
    value: function setMiscOptions() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.miscOptions = _extends({}, this.miscOptions, opts);
      return this.adapter.persistCurrentOrder(this);
    }
  }, {
    key: 'setPaymentMethod',
    value: function setPaymentMethod() {
      var _this2 = this;

      var paymentType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : PaymentTypes.CASH;
      var cardOrCashTip = arguments[1];

      this.paymentType = paymentType;
      return this.adapter.persistCurrentOrder(this).then(function () {
        switch (paymentType) {
          case PaymentTypes.CASH:
            {
              var tip = cardOrCashTip.tip;

              _this2.miscOptions.tip = tip || 0;
              return _this2.adapter.persistCurrentOrder(_this2);
            }
          case PaymentTypes.LEVELUP:
            {
              _this2.creditCard = null;
              return _this2.adapter.persistCurrentOrder(_this2);
            }
          case PaymentTypes.CREDIT:
            {
              /* For Unsetting Credit Card */
              if (!cardOrCashTip) {
                _this2.creditCard = null;
                return _this2.adapter.persistCurrentOrder(_this2);
              }
              var customer_card_id = cardOrCashTip.customer_card_id;

              if (customer_card_id) {
                _this2.creditCard = { customer_card_id: customer_card_id };
                return _this2.adapter.persistCurrentOrder(_this2);
              }
              /* The user is trying to set a non-persisted card on the order */
              var result = validate(cardOrCashTip, cardValidations);
              if (!result) {
                _this2.creditCard = cardOrCashTip;
                /* Important! Don't persist raw card info to LocalStorage */
                return Promise.resolve(_this2);
              }
              return Promise.reject(result);
            }
          default:
          // do nothing
        }
      });
    }
  }, {
    key: 'setAddress',
    value: function setAddress(address) {
      /* For Unsetting Address */
      if (!address) {
        this.address = address;
        return this.adapter.persistCurrentOrder(this);
      }
      var customer_address_id = address.customer_address_id;

      if (customer_address_id) {
        this.address = { customer_address_id: customer_address_id };
        return this.adapter.persistCurrentOrder(this);
      }
      var result = validate(address, addressValidations);
      if (!result) {
        this.address = address;
        return this.adapter.persistCurrentOrder(this);
      }
      return Promise.reject(result);
    }
  }, {
    key: 'setLocation',
    value: function setLocation() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (id) {
        this.locationId = id;
        return this.adapter.persistCurrentOrder(this);
      }
      return Promise.reject('Location ID cannot be blank');
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      return this.cart.isValid();
    }
  }, {
    key: 'pushLineItem',
    value: function pushLineItem(lineItem) {
      if (lineItem instanceof LineItem) {
        this.cart.lineItems.push(lineItem);
        return this.adapter.persistCurrentOrder(this).then(function () {
          return lineItem;
        });
      }
      return Promise.reject('Must pass an instance of the Brandibble.LineItem model.');
    }
  }, {
    key: 'addLineItem',
    value: function addLineItem() {
      if (this.locationId) {
        var _cart;

        var lineItem = (_cart = this.cart).addLineItem.apply(_cart, arguments);
        return this.adapter.persistCurrentOrder(this).then(function () {
          return lineItem;
        });
      }
      return Promise.reject('Location ID cannot be blank');
    }
  }, {
    key: 'addOptionToLineItem',
    value: function addOptionToLineItem() {
      var _cart2;

      var lineItem = (_cart2 = this.cart).addOptionToLineItem.apply(_cart2, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'removeOptionFromLineItem',
    value: function removeOptionFromLineItem() {
      var _cart3;

      var lineItem = (_cart3 = this.cart).removeOptionFromLineItem.apply(_cart3, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'getLineItemQuantity',
    value: function getLineItemQuantity() {
      var _cart4;

      return (_cart4 = this.cart).getLineItemQuantity.apply(_cart4, arguments);
    }
  }, {
    key: 'setLineItemQuantity',
    value: function setLineItemQuantity() {
      var _cart5;

      var lineItem = (_cart5 = this.cart).setLineItemQuantity.apply(_cart5, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'setLineItemMadeFor',
    value: function setLineItemMadeFor() {
      var _cart6;

      var lineItem = (_cart6 = this.cart).setLineItemMadeFor.apply(_cart6, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'setLineItemInstructions',
    value: function setLineItemInstructions() {
      var _cart7;

      var lineItem = (_cart7 = this.cart).setLineItemInstructions.apply(_cart7, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'removeLineItem',
    value: function removeLineItem() {
      var _cart8;

      var remainingLineItems = (_cart8 = this.cart).removeLineItem.apply(_cart8, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return remainingLineItems;
      });
    }
  }, {
    key: 'formatForValidation',
    value: function formatForValidation() {
      return {
        location_id: this.locationId,
        service_type: this.serviceType,
        requested_at: this.requestedAt,
        promo_code: this.promo_code,
        cart: this.cart.format()
      };
    }
  }, {
    key: 'formatCustomer',
    value: function formatCustomer() {
      if (!this.customer) {
        return {};
      }
      if (this.customer.customer_id) {
        return { customer_id: this.customer.customer_id };
      }
      return {
        email: this.customer.email,
        password: this.customer.password,
        first_name: this.customer.first_name,
        last_name: this.customer.last_name
      };
    }
  }, {
    key: 'formatAddress',
    value: function formatAddress() {
      if (!this.address) {
        return {};
      }
      var _address = this.address,
          customer_address_id = _address.customer_address_id,
          city = _address.city,
          longitude = _address.longitude,
          latitude = _address.latitude,
          state_code = _address.state_code,
          street_address = _address.street_address,
          zip_code = _address.zip_code,
          unit = _address.unit,
          company = _address.company,
          contact_name = _address.contact_name,
          contact_phone = _address.contact_phone;

      if (customer_address_id) {
        return { customer_address_id: customer_address_id };
      }
      return {
        city: city,
        longitude: longitude,
        latitude: latitude,
        state_code: state_code,
        street_address: street_address,
        zip_code: zip_code,
        unit: unit,
        company: company,
        contact_name: contact_name,
        contact_phone: contact_phone
      };
    }
  }, {
    key: 'formatCard',
    value: function formatCard() {
      if (!this.creditCard) {
        return {};
      }
      var _creditCard = this.creditCard,
          customer_card_id = _creditCard.customer_card_id,
          cc_expiration = _creditCard.cc_expiration,
          cc_number = _creditCard.cc_number,
          cc_zip = _creditCard.cc_zip,
          cc_cvv = _creditCard.cc_cvv;

      if (customer_card_id) {
        return { customer_card_id: customer_card_id };
      }
      return { cc_expiration: cc_expiration, cc_number: cc_number, cc_zip: cc_zip, cc_cvv: cc_cvv };
    }
  }, {
    key: 'format',
    value: function format() {
      var _miscOptions = this.miscOptions,
          include_utensils = _miscOptions.include_utensils,
          notes_for_store = _miscOptions.notes_for_store,
          tip = _miscOptions.tip,
          promo_code = _miscOptions.promo_code;


      var payload = {
        uuid: this.uuid,
        customer: this.formatCustomer(),
        location_id: this.locationId,
        service_type: this.serviceType,
        requested_at: this.requestedAt,
        cart: this.cart.format(),
        include_utensils: include_utensils,
        notes_for_store: notes_for_store,
        promo_code: promo_code,
        payment_type: this.paymentType
      };

      if (this.serviceType === serviceTypes.DELIVERY) {
        payload.address = this.formatAddress();
      }

      switch (payload.payment_type) {
        case PaymentTypes.CASH:
          payload.tip = tip;
          break;
        case PaymentTypes.CREDIT:
          payload.credit_card = this.formatCard();
          break;
        default:
          // do nothing
          break;
      }

      return payload;
    }
  }]);
  return Order;
}();

/* global atob fetch */

function BrandibbleRequestException(message, response, exception, extracted) {
  this.message = 'Brandibble.js: ' + (message || 'An unknown exception was triggered.');
  this.stack = new Error().stack;
  this.response = response;
  this.exception = exception;
  this.extracted = extracted;
}

var FiveHundredError = {
  errors: [{
    code: 'errors.server.internal',
    title: 'Internal Server Error',
    status: 500
  }]
};

/* Ensure the only persisted information here is customer_card_id */
function sanitizeCreditCard(order) {
  var _order = order;
  if (_order.creditCard) {
    var customer_card_id = _order.creditCard.customer_card_id;

    if (customer_card_id) {
      _order.creditCard = { customer_card_id: customer_card_id };
    } else {
      _order.creditCard = null;
    }
  }
  return _order;
}

/*
 * Brandibble 500 Errors aren't JSON, so we wrap them
 * here.  Otherwise, we attempt to parse everything as
 * JSON, and in the case we can't, we throw a big' ol
 * error, that is intended to be used with error logging.
 */
function handleResponse(response) {
  var status = response.status,
      statusText = response.statusText;

  if (status === 500) {
    throw FiveHundredError;
  }
  if (statusText === 'NO CONTENT' || status === 204) {
    return true;
  }
  /* Store a clone so the host app can re-read the error, however
   * react native's clone doesn't seem to be defined
   */
  var requestWasSuccessful = status >= 200 && status < 300;
  var cloned = response.clone ? response.clone() : response;
  try {
    return response.text().then(function (text) {
      var parsed = {};
      if (!text) {
        if (requestWasSuccessful) return parsed;
        throw parsed;
      }
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new BrandibbleRequestException('Response text could not be parsed as JSON.', cloned, e, text);
      }
      if (requestWasSuccessful) return parsed;
      throw parsed;
    });
  } catch (e) {
    throw new BrandibbleRequestException('Response could not be extracted as Text.', cloned, e);
  }
}

var Adapter = function () {
  function Adapter(_ref) {
    var apiKey = _ref.apiKey,
        apiBase = _ref.apiBase,
        origin = _ref.origin,
        storage = _ref.storage,
        requestTimeout = _ref.requestTimeout;
    classCallCheck(this, Adapter);

    this.apiKey = apiKey;
    this.apiBase = apiBase;
    this.origin = origin;
    this.storage = storage;
    this.requestTimeout = requestTimeout;

    /* Lifecycle Specific State */
    this.currentOrder = null;
    this.customerToken = null;
  }

  createClass(Adapter, [{
    key: 'customerId',
    value: function customerId() {
      try {
        return JSON.parse(atob(this.customerToken.split('.')[1])).customer_id;
      } catch (e) {
        return 0;
      }
    }
  }, {
    key: 'flushAll',
    value: function flushAll() {
      var _this = this;

      return this.storage.clear().then(function (res) {
        _this.currentOrder = null;
        _this.customerToken = null;
        return res;
      });
    }
  }, {
    key: 'restoreCurrentOrder',
    value: function restoreCurrentOrder() {
      var _this2 = this;

      return this.storage.getItem('currentOrder').then(function (serializedOrder) {
        if (!serializedOrder) return;

        var _CircularJSON$parse = CircularJSON.parse(serializedOrder),
            uuid = _CircularJSON$parse.uuid,
            locationId = _CircularJSON$parse.locationId,
            serviceType = _CircularJSON$parse.serviceType,
            miscOptions = _CircularJSON$parse.miscOptions,
            requestedAt = _CircularJSON$parse.requestedAt,
            cart = _CircularJSON$parse.cart,
            paymentType = _CircularJSON$parse.paymentType,
            customer = _CircularJSON$parse.customer,
            address = _CircularJSON$parse.address,
            creditCard = _CircularJSON$parse.creditCard,
            wantsFutureOrder = _CircularJSON$parse.wantsFutureOrder;

        var order = new Order(_this2, locationId, serviceType, paymentType, miscOptions);
        if (wantsFutureOrder) {
          order.wantsFutureOrder = wantsFutureOrder;
        }
        if (address) {
          order.address = address;
        }
        if (customer) {
          order.customer = customer;
        }
        if (paymentType) {
          order.paymentType = paymentType;
        }
        if (requestedAt) {
          order.requestedAt = requestedAt;
        }
        if (creditCard) {
          order.creditCard = creditCard;
        }
        if (uuid) {
          order.uuid = uuid;
        }
        _this2.currentOrder = order.rehydrateCart(cart);
        return _this2.currentOrder;
      });
    }
  }, {
    key: 'persistCurrentOrder',
    value: function persistCurrentOrder(order) {
      var _order = order;
      this.currentOrder = _order;
      /* Ensure raw Credit Card data isn't persisted to this.storage */
      if (_order.creditCard) {
        var creditCardData = Object.assign({}, _order.creditCard);

        return this.storage.setItem('currentOrder', CircularJSON.stringify(sanitizeCreditCard(_order))).then(function () {
          _order.creditCard = creditCardData;
          return _order;
        });
      }
      return this.storage.setItem('currentOrder', CircularJSON.stringify(_order)).then(function () {
        return _order;
      });
    }
  }, {
    key: 'flushCurrentOrder',
    value: function flushCurrentOrder() {
      var _this3 = this;

      return this.storage.removeItem('currentOrder').then(function (res) {
        _this3.currentOrder = null;
        return res;
      });
    }
  }, {
    key: 'restoreCustomerToken',
    value: function restoreCustomerToken() {
      var _this4 = this;

      return this.storage.getItem('customerToken').then(function (customerToken) {
        return _this4.customerToken = customerToken;
      });
    }
  }, {
    key: 'persistCustomerToken',
    value: function persistCustomerToken(customerToken) {
      var _this5 = this;

      return this.storage.setItem('customerToken', customerToken).then(function () {
        return _this5.storage.getItem('customerToken').then(function (token) {
          return _this5.customerToken = token;
        });
      });
    }
  }, {
    key: 'request',
    value: function request(method, path, body) {
      var _this6 = this;

      if (this.requestTimeout) {
        return new Promise(function (resolve, reject$$1) {
          var timerId = setTimeout(function () {
            reject$$1(new Error('Brandibble.js: The ' + method + ' request to ' + path + ' timed out after ' + _this6.requestTimeout + '.'));
          }, _this6.requestTimeout);
          fetch('' + _this6.apiBase + path, {
            method: method,
            headers: _this6.headers(),
            body: body ? JSON.stringify(body) : null,
            credentials: 'omit'
          }).then(function (response) {
            clearTimeout(timerId);
            return response;
          }).then(handleResponse).then(resolve, reject$$1);
        });
      }
      return fetch('' + this.apiBase + path, {
        method: method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : null,
        credentials: 'omit'
      }).then(handleResponse);
    }
  }, {
    key: 'headers',
    value: function headers() {
      var headers = { 'Brandibble-Api-Key': this.apiKey, 'Content-Type': 'application/json' };
      if (this.origin) {
        headers.Origin = this.origin;
      }
      if (this.customerToken) {
        headers['Brandibble-Customer-Token'] = this.customerToken;
      }
      return headers;
    }
  }]);
  return Adapter;
}();

var Events = function () {
  function Events() {
    classCallCheck(this, Events);

    this._callStack = [];
  }

  createClass(Events, [{
    key: "triggerAsync",
    value: function triggerAsync(key, promise) {
      var _this = this;

      promise.then(function (response) {
        _this.trigger(key + ".success", response);
        return response;
      }).catch(function (response) {
        _this.trigger(key + ".failure", response);
        return response;
      });
    }
  }, {
    key: "trigger",
    value: function trigger(key, response) {
      this._callStack.forEach(function (func) {
        return func(key, response);
      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(callback) {
      this._callStack.push(callback);
    }
  }]);
  return Events;
}();

var Customers = function () {
  function Customers(adapter, events) {
    classCallCheck(this, Customers);

    this.adapter = adapter;
    this.events = events;
  }

  // STATEFUL METHODS


  createClass(Customers, [{
    key: 'authenticate',
    value: function authenticate(body) {
      var _this = this;

      return this.token(body).then(function (response) {
        return _this.adapter.persistCustomerToken(response.data.token).then(_this.current.bind(_this));
      });
    }
  }, {
    key: 'invalidate',
    value: function invalidate() {
      var promise = this.adapter.flushAll();
      this.events.triggerAsync('customers.invalidate', promise);
      return promise;
    }
  }, {
    key: 'current',
    value: function current() {
      return this.show(this.adapter.customerId());
    }
  }, {
    key: 'updateCurrent',
    value: function updateCurrent(body) {
      return this.update(body, this.adapter.customerId());
    }
  }, {
    key: 'currentLevelUpQRCode',
    value: function currentLevelUpQRCode() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.levelUpQRCode(this.adapter.customerId(), params);
    }
  }, {
    key: 'currentLevelUpLoyalty',
    value: function currentLevelUpLoyalty() {
      return this.levelUpLoyalty(this.adapter.customerId());
    }
  }, {
    key: 'currentLevelUpCampaign',
    value: function currentLevelUpCampaign(campaignId, campaignType) {
      return this.levelUpCampaign(this.adapter.customerId(), campaignId, campaignType);
    }

    // STATELESS METHODS

    /* first_name, last_name, email, password, phone:opt */

  }, {
    key: 'create',
    value: function create(body) {
      var promise = this.adapter.request('POST', 'customers', body);
      this.events.triggerAsync('customers.create', promise);
      return promise;
    }
  }, {
    key: 'validateCustomer',
    value: function validateCustomer(body) {
      return this.adapter.request('POST', 'customers/validate', body);
    }

    /* email, password */

  }, {
    key: 'token',
    value: function token(body) {
      var promise = this.adapter.request('POST', 'customers/token', body);
      this.events.triggerAsync('customers.token', promise);
      return promise;
    }

    /* customer_id */

  }, {
    key: 'show',
    value: function show(customerId) {
      var promise = this.adapter.request('GET', 'customers/' + customerId);
      this.events.triggerAsync('customers.show', promise);
      return promise;
    }

    /* limit, sort, status */

  }, {
    key: 'orders',
    value: function orders(customerId) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var query = querystring.stringify(params);
      return this.adapter.request('GET', 'customers/' + customerId + '/orders?' + query);
    }

    /* first_name, last_name, email, password, phone:opt */

  }, {
    key: 'update',
    value: function update(body, customerId) {
      var promise = this.adapter.request('PUT', 'customers/' + customerId, body);
      this.events.triggerAsync('customers.update', promise);
      return promise;
    }
  }, {
    key: 'resetPassword',
    value: function resetPassword(body) {
      var promise = this.adapter.request('POST', 'customers/reset', body);
      this.events.triggerAsync('customers.resetPassword', promise);
      return promise;
    }

    // LEVELUP

    /* customer_id, code, color, tip_amount, tip_percent, width */

  }, {
    key: 'levelUpQRCode',
    value: function levelUpQRCode(customerId) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var query = querystring.stringify(params);
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/qr_code?' + query);
    }

    /* customer_id */

  }, {
    key: 'levelUpLoyalty',
    value: function levelUpLoyalty(customerId) {
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/loyalty');
    }

    /* update levelup permissions */

  }, {
    key: 'levelUpUpdate',
    value: function levelUpUpdate(customerId, password) {
      var data = { password: password };
      return this.adapter.request('PUT', 'customers/' + customerId + '/levelup', data);
    }

    /* connect level up account */

  }, {
    key: 'levelUpConnect',
    value: function levelUpConnect(customerId, email, password) {
      var data = { email: email };
      if (password) data.password = password;
      return this.adapter.request('POST', 'customers/' + customerId + '/levelup', data);
    }

    /* show levelup campaign */

  }, {
    key: 'levelUpCampaign',
    value: function levelUpCampaign(customerId, campaignId, campaignType) {
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/campaigns/' + campaignId + '/' + campaignType);
    }

    /* disconnect level up account */

  }, {
    key: 'levelUpDisconnect',
    value: function levelUpDisconnect(customerId) {
      return this.adapter.request('DELETE', 'customers/' + customerId + '/levelup');
    }
  }, {
    key: 'levelUpPaymentMethod',
    value: function levelUpPaymentMethod(customerId) {
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/payment_method');
    }
  }, {
    key: 'resetLevelUpPassword',
    value: function resetLevelUpPassword(body) {
      var promise = this.adapter.request('POST', 'customers/reset_levelup', body);
      this.events.triggerAsync('customers.resetLevelUpPassword', promise);
      return promise;
    }
  }]);
  return Customers;
}();

var Locations = function () {
  function Locations(adapter) {
    classCallCheck(this, Locations);

    this.adapter = adapter;
  }

  createClass(Locations, [{
    key: 'index',
    value: function index(queryParamObject) {
      if (queryParamObject) {
        return this.adapter.request('GET', 'locations?' + queryStringBuilder(queryParamObject));
      }
      return this.adapter.request('GET', 'locations');
    }
  }, {
    key: 'show',
    value: function show(locationId, lat, lng) {
      if (lat && lng) {
        return this.adapter.request('GET', 'locations/' + locationId + '?latitude=' + lat + '&longitude=' + lng);
      }
      return this.adapter.request('GET', 'locations/' + locationId);
    }
  }, {
    key: 'waitTimes',
    value: function waitTimes(locationId) {
      return this.adapter.request('GET', 'locations/' + locationId + '/wait_times');
    }
  }]);
  return Locations;
}();

var Addresses = function () {
  function Addresses(adapter) {
    classCallCheck(this, Addresses);

    this.adapter = adapter;
  }

  createClass(Addresses, [{
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'customers/' + this.adapter.customerId() + '/addresses');
    }
  }, {
    key: 'create',
    value: function create(body) {
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/addresses', body);
    }
  }, {
    key: 'delete',
    value: function _delete(customerAddressId) {
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/addresses/' + customerAddressId);
    }
  }]);
  return Addresses;
}();

var Menus = function () {
  function Menus(adapter) {
    classCallCheck(this, Menus);

    this.adapter = adapter;
  }

  createClass(Menus, [{
    key: 'build',
    value: function build(location_id) {
      var service_type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'delivery';
      var date = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();

      var isISOString = validate({ timestamp: date }, { timestamp: { format: ISO8601_PATTERN } });
      var requested_at = isISOString ? date.toISOString().split('.')[0] + 'Z' : date;
      return this.adapter.request('POST', 'menus', { location_id: location_id, service_type: service_type, requested_at: requested_at });
    }
  }, {
    key: 'display',
    value: function display(location_id) {
      var service_type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'delivery';
      var date = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();

      var isISOString = validate({ timestamp: date }, { timestamp: { format: ISO8601_PATTERN } });
      var requested_at = isISOString ? date.toISOString().split('.')[0] + 'Z' : date;
      return this.adapter.request('POST', 'menus/display', { location_id: location_id, service_type: service_type, requested_at: requested_at });
    }
  }]);
  return Menus;
}();

var Orders = function () {
  function Orders(adapter, events) {
    classCallCheck(this, Orders);

    this.adapter = adapter;
    this.events = events;
  }

  createClass(Orders, [{
    key: 'create',
    value: function create(locationId, serviceType, paymentType, miscOptions) {
      var order = new Order(this.adapter, locationId, serviceType, paymentType, miscOptions);
      return this.adapter.persistCurrentOrder(order);
    }
  }, {
    key: 'current',
    value: function current() {
      return this.adapter.currentOrder;
    }
  }, {
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan() {
      var _constructor;

      return (_constructor = this.constructor).buildLineItemOrphan.apply(_constructor, arguments);
    }
  }, {
    key: 'validateCart',


    /* The only attrs testChanges accepts are location_id, service_type & requested_at  */
    value: function validateCart(orderObj) {
      var testChanges = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var body = orderObj.formatForValidation();
      Object.assign(body, testChanges);
      return this.adapter.request('POST', 'cart/validate', body);
    }
  }, {
    key: 'validate',
    value: function validate$$1(orderObj) {
      var body = orderObj.format();
      return this.adapter.request('POST', 'orders/validate', body);
    }
  }, {
    key: 'submit',
    value: function submit(orderObj) {
      var body = orderObj.format();
      var promise = this.adapter.request('POST', 'orders/create', body);
      this.events.triggerAsync('orders.submit', promise);
      return promise;
    }
  }], [{
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan(item, menuJSON) {
      var sections = reduce(menuJSON || [], function (combined, section) {
        return [].concat(toConsumableArray(combined), toConsumableArray(section.children), toConsumableArray(section.items));
      }, []);

      if (!sections || sections && !sections.length) return;

      var product = find(sections, function (i) {
        return i.id === item.id;
      });
      var lineItem = new LineItem(product);

      try {
        (item.option_groups || []).forEach(function (iog) {
          var optionGroup = find(product.option_groups, function (og) {
            return og.id === iog.id;
          });
          if (!optionGroup) throw new Error({ message: 'Option Group Missing' });
          iog.option_items.forEach(function (foi) {
            var optionItem = find(optionGroup.option_items, function (oi) {
              return oi.id === foi.id;
            });
            if (!optionItem) throw new Error({ message: 'Option Item Missing' });
            lineItem.addOption(optionGroup, optionItem);
          });
        });
      } catch (e) {
        return;
      }
      return lineItem;
    }
  }]);
  return Orders;
}();

var Payments = function () {
  function Payments(adapter) {
    classCallCheck(this, Payments);

    this.adapter = adapter;
  }

  createClass(Payments, [{
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'customers/' + this.adapter.customerId() + '/cards');
    }
  }, {
    key: 'create',
    value: function create(body) {
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/cards', body);
    }
  }, {
    key: 'setDefault',
    value: function setDefault(customerCardId) {
      return this.adapter.request('PUT', 'customers/' + this.adapter.customerId() + '/cards/' + customerCardId);
    }
  }, {
    key: 'delete',
    value: function _delete(customerCardId) {
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/cards/' + customerCardId);
    }
  }]);
  return Payments;
}();

var Allergens = function () {
  function Allergens(adapter) {
    classCallCheck(this, Allergens);

    this.adapter = adapter;
  }

  createClass(Allergens, [{
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'allergens');
    }
  }, {
    key: 'create',
    value: function create(allergensArr) {
      var data = {
        allergens: allergensArr
      };
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/allergens', data);
    }
  }, {
    key: 'remove',
    value: function remove(allergensArr) {
      var data = {
        allergens: allergensArr
      };
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/allergens', data);
    }
  }]);
  return Allergens;
}();

var Favorites = function () {
  function Favorites(adapter) {
    classCallCheck(this, Favorites);

    this.adapter = adapter;
  }

  createClass(Favorites, [{
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan() {
      var _constructor;

      return (_constructor = this.constructor).buildLineItemOrphan.apply(_constructor, arguments);
    }
  }, {
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'customers/' + this.adapter.customerId() + '/favorites');
    }
  }, {
    key: 'create',
    value: function create() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var lineItemObj = arguments[1];

      var data = {
        name: name,
        menu_item_json: lineItemObj.formatForFavorites()
      };
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/favorites', data);
    }
  }, {
    key: 'update',
    value: function update(favId) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var lineItemObj = arguments[2];

      var data = {
        favorite_item_id: favId,
        name: name,
        menu_item_json: lineItemObj.formatForFavorites()
      };
      return this.adapter.request('PUT', 'customers/' + this.adapter.customerId() + '/favorites', data);
    }
  }, {
    key: 'delete',
    value: function _delete(favId) {
      var data = { favorite_item_id: favId };
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/favorites', data);
    }
  }], [{
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan(favorite, menuJSON) {
      var menuSection = find(menuJSON, function (m) {
        return find(m.children, function (c) {
          return find(c.items, function (i) {
            return i.id === favorite.menu_item_id;
          });
        });
      });
      if (!menuSection) return;
      var menuChild = find(menuSection.children, function (c) {
        return find(c.items, function (i) {
          return i.id === favorite.menu_item_id;
        });
      });
      var product = find(menuChild.items, function (i) {
        return i.id === favorite.menu_item_id;
      });
      var lineItem = new LineItem(product);
      try {
        (favorite.menu_item_json[0].option_groups || []).forEach(function (fog) {
          var optionGroup = find(product.option_groups, function (og) {
            return og.id === fog.id;
          });
          if (!optionGroup) throw new Error({ message: 'Option Group Missing' });
          fog.option_items.forEach(function (foi) {
            var optionItem = find(optionGroup.option_items, function (oi) {
              return oi.id === foi.id;
            });
            if (!optionItem) throw new Error({ message: 'Option Item Missing' });
            lineItem.addOption(optionGroup, optionItem);
          });
        });
      } catch (e) {
        return;
      }
      return lineItem;
    }
  }]);
  return Favorites;
}();

var Ratings = function () {
  function Ratings(adapter) {
    classCallCheck(this, Ratings);

    this.adapter = adapter;
  }

  /* rating:integer(1-5):required, comments:string */


  createClass(Ratings, [{
    key: 'create',
    value: function create(orderId, body) {
      return this.adapter.request('POST', 'orders/' + orderId + '/rating', body);
    }

    /* rating:integer(1-5):required, comments:string */

  }, {
    key: 'update',
    value: function update(orderId, body) {
      return this.adapter.request('PUT', 'orders/' + orderId + '/rating', body);
    }
  }, {
    key: 'show',
    value: function show(orderId) {
      return this.adapter.request('GET', 'orders/' + orderId + '/rating');
    }
  }, {
    key: 'delete',
    value: function _delete(orderId) {
      return this.adapter.request('DELETE', 'orders/' + orderId + '/rating');
    }
  }]);
  return Ratings;
}();

var isArray = function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

var Images = function () {
  function Images(adapter) {
    classCallCheck(this, Images);

    this.adapter = adapter;
  }

  createClass(Images, [{
    key: 'show',
    value: function show(ids, type) {
      var params = {};
      if (typeof ids === 'string') {
        params.ids = ids;
      } else if (isArray(ids)) {
        params.ids = ids.join(',');
      } else {
        params.ids = '' + ids;
      }
      if (type) params.image_type = type;
      return this.adapter.request('GET', 'images?' + queryStringBuilder(params));
    }
  }]);
  return Images;
}();

applyPollyfills();

var Storage = function () {
  function Storage() {
    classCallCheck(this, Storage);
  }

  createClass(Storage, [{
    key: 'config',
    value: function config() {
      return this;
    }
  }], [{
    key: 'setItem',
    value: function setItem() {
      return Promise.resolve();
    }
  }, {
    key: 'getItem',
    value: function getItem() {
      return Promise.resolve();
    }
  }, {
    key: 'removeItem',
    value: function removeItem() {
      return Promise.resolve();
    }
  }, {
    key: 'clear',
    value: function clear() {
      return Promise.resolve();
    }
  }]);
  return Storage;
}();

var Brandibble = function () {
  function Brandibble(_ref) {
    var apiKey = _ref.apiKey,
        brandId = _ref.brandId,
        _ref$apiEndpoint = _ref.apiEndpoint,
        apiEndpoint = _ref$apiEndpoint === undefined ? null : _ref$apiEndpoint,
        _ref$apiVersion = _ref.apiVersion,
        apiVersion = _ref$apiVersion === undefined ? null : _ref$apiVersion,
        _ref$origin = _ref.origin,
        origin = _ref$origin === undefined ? null : _ref$origin,
        _ref$storage = _ref.storage,
        storage = _ref$storage === undefined ? null : _ref$storage,
        _ref$requestTimeout = _ref.requestTimeout,
        requestTimeout = _ref$requestTimeout === undefined ? null : _ref$requestTimeout;
    classCallCheck(this, Brandibble);

    if (!apiKey) {
      throw new Error('Brandibble.js: Please pass apiKey to the constructor options.');
    }
    if (!brandId) {
      throw new Error('Brandibble.js: Please pass brandId to the constructor options.');
    }

    var _apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    var _apiVersion = apiVersion || 'v1';
    var _storage = storage || new Storage();
    var _requestTimeout = requestTimeout || false;

    var apiBase = '' + _apiEndpoint + _apiVersion + '/brands/' + brandId + '/';

    /* Build adapter */
    this.adapter = new Adapter({ apiKey: apiKey, apiBase: apiBase, origin: origin, storage: _storage, requestTimeout: _requestTimeout });
    this.events = new Events();

    /* Build Resources */
    this.Order = Order;
    this.LineItem = LineItem;

    /* Build Resources */
    this.customers = new Customers(this.adapter, this.events);
    this.locations = new Locations(this.adapter);
    this.addresses = new Addresses(this.adapter);
    this.menus = new Menus(this.adapter);
    this.orders = new Orders(this.adapter, this.events);
    this.payments = new Payments(this.adapter);
    this.allergens = new Allergens(this.adapter);
    this.favorites = new Favorites(this.adapter);
    this.ratings = new Ratings(this.adapter);
    this.images = new Images(this.adapter);

    /* Misc */
    this.TestCreditCards = TestCreditCards;
  }

  createClass(Brandibble, [{
    key: 'setup',
    value: function setup() {
      var _this = this;

      return this.adapter.restoreCustomerToken().then(function () {
        return _this.adapter.restoreCurrentOrder().then(function () {
          return _this;
        });
      });
    }

    /* subject:string:required body:string:required email:string name:string */

  }, {
    key: 'sendSupportTicket',
    value: function sendSupportTicket() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.adapter.request('POST', 'support_ticket', data);
    }
  }]);
  return Brandibble;
}();

module.exports = Brandibble;
