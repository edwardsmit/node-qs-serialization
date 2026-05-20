'use strict';

module.exports.param = function (sourceObject) {
  var prefix;
  var querystring = [];
  var r20 = /%20/g;
  var rbracket = /\[\]$/;

  function add(key, value) {
    value = typeof value === 'function' ? value() : value === null ? '' : value;
    querystring[querystring.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }

  function buildParams(prefix, obj, add) {
    var name;
    if (Array.isArray(obj)) {
      for (var index = 0; index < obj.length; index++) {
        if (rbracket.test(prefix)) {
          add(prefix, obj[index]);
        } else {
          buildParams(
            prefix + '[' + (typeof obj[index] === 'object' ? index : '') + ']',
            obj[index],
            add
          );
        }
      }
    } else if (typeof obj === 'object') {
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], add);
      }
    } else {
      add(prefix, obj);
    }
  }

  for (prefix in sourceObject) {
    buildParams(prefix, sourceObject[prefix], add);
  }
  return querystring.join('&').replace(r20, '+');
};
