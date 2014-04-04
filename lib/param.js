'use strict';

module.exports.param = function (sourceObject) {
  var _ = require('lodash');
  var prefix;
  var querystring = [];
  var r20 = /%20/g;
  var rbracket = /\[\]$/;

  function add(key, value) {
    // If value is a function, invoke it and return its value
    value = _.isFunction(value) ? value() : value === null ? '' : value;
    querystring[querystring.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }

  function buildParams(prefix, obj, add) {
    var name;
    if (_.isArray(obj)) {
      // Serialize array item.
      _.each(obj, function (value, index) {
        if (rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, value);
        } else {
          // Item is non-scalar (array or object), encode its numeric index.
          buildParams(prefix + '[' + (_.isObject(value) ? index : '') + ']', value, add);
        }
      });
    } else if (_.isObject(obj)) {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], add);
      }
    } else {
      // Serialize scalar item.
      add(prefix, obj);
    }
  }

  // encode params recursively.
  for (prefix in sourceObject) {
    buildParams(prefix, sourceObject[prefix], add);
  }
  // Return the resulting serialization
  return querystring.join('&').replace(r20, '+');
};
