import polyfill from 'es6-promise';

function localStoragePresent(){
  var test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

export function applyPollyfills() {
  if (typeof Promise === 'undefined') { polyfill(); }

  if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
  }

  if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (var index = 1; index < arguments.length; index++) {
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

export function persist(namespace, data) {
  if (localStoragePresent()) {
    let allData = Object.assign(retrieve(namespace), data);
    for (let dataKey in allData) {
      if (!allData[dataKey]) { delete allData[dataKey]; }
    }
    localStorage.setItem(namespace, JSON.stringify(allData || {}));
    return data;
  } else {
    console.warn(`Brandibble.js: Local Storage is not availble,
        and therefore the client can't persist information over page refresh.`)
  }
}

export function retrieve(namespace) {
  if (localStoragePresent()) {
    let data = localStorage.getItem(namespace);
    return JSON.parse(data || "{}");
  } else {
    console.warn(`Brandibble.js: Local Storage is not availble,
        and therefore the client can't retrieve information over page refresh.`)
  }
}

