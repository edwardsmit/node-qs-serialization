'use strict';

module.exports.param = function(sourceObject) {
  var prefix;
  var querystring = [];
  var r20 = /%20/g;
  var rbracket = /\[\]$/;

  function add(key, value) {
    // If value is a function, invoke it and return its value
    value = (typeof value === 'function') ?
      value() :
      value === null ?
        '' :
        value;
    querystring[querystring.length] = encodeURIComponent(key) +
      '=' + encodeURIComponent(value);
  }

  function buildParams(prefix, obj, add) {
    var name;
    if (Array.isArray(obj)) {
      // Serialize array item.
      for (var index = 0; index < obj.length; index++)
      {
        if (rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, obj[index]);
        } else {
          // Item is non-scalar (array or object), encode its numeric index.
          buildParams(prefix + '[' + (typeof (obj[index]) === 'object' ?
                                        index :
                                        ''
                                     ) + ']', obj[index], add);
        }
      }
    } else if (typeof obj === 'object') {
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
