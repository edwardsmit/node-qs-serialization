'use strict';

var assert = require('assert');
var qss = require('../index.js');
var param = qss.param;
var deparam = qss.deparam;

function decoded(o) {
  return decodeURIComponent(param(o));
}
function eq(actual, expected, label) {
  if (typeof expected === 'object') {
    assert.deepEqual(actual, expected, label);
  } else {
    assert.strictEqual(actual, expected, label);
  }
}

eq(param(), '', 'param() empty');
eq(param({}), '', 'param({}) empty');
eq(param({ a: 'b' }), 'a=b', 'string');
eq(param({ a: 1234 }), 'a=1234', 'number');
eq(param({ a: true }), 'a=true', 'true');
eq(param({ a: false }), 'a=false', 'false');
eq(param({ a: '' }), 'a=', 'empty string');
eq(param({ a: null }), '', 'null drops');
eq(
  param({
    a: function () {
      return 'computed';
    }
  }),
  'a=computed',
  'function value'
);
eq(param({ a: 'hello world' }), 'a=hello+world', 'spaces to plus');
eq(param({ a: '&=?#' }), 'a=%26%3D%3F%23', 'reserved chars');
eq(param({ a: 't\xe9l\xe9' }), 'a=t%C3%A9l%C3%A9', 'UTF-8');
eq(decoded({ a: ['x', 'y', 'z'] }), 'a[]=x&a[]=y&a[]=z', 'array');
eq(decoded({ a: { b: 'c' } }), 'a[b]=c', 'nested object');
eq(decoded({ a: [{ b: 'c' }] }), 'a[0][b]=c', 'array of objects');
eq(param({ a: 1, b: 2, c: 3 }), 'a=1&b=2&c=3', 'order');

eq(deparam(), {}, 'deparam() empty');
eq(deparam(123), {}, 'deparam non-string');
eq(deparam('a=hello'), { a: 'hello' }, 'string');
eq(deparam('a=1234'), { a: 1234 }, 'number coerce');
eq(deparam('a=true'), { a: true }, 'true coerce');
eq(deparam('a=false'), { a: false }, 'false coerce');
eq(deparam('a=null'), { a: null }, 'null coerce');
eq(deparam('a=undefined'), { a: undefined }, 'undefined coerce');
eq(deparam('a=1234', false), { a: '1234' }, 'no coerce');
eq(deparam('a[]=1&a[]=2&a[]=3'), { a: [1, 2, 3] }, 'array');
eq(deparam('a[b][c]=d'), { a: { b: { c: 'd' } } }, 'nested');
eq(deparam('a=t%C3%A9l%C3%A9'), { a: 't\xe9l\xe9' }, 'UTF-8 decode');
eq(deparam('a=t%e9l%e9'), { a: 't\xe9l\xe9' }, 'ISO-8859 fallback');
eq(deparam('a=hello+world'), { a: 'hello world' }, '+ decode');
eq(deparam('a=hello%20world'), { a: 'hello world' }, '%20 decode');

var bbqStr =
  'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0' +
  '&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
var bbqObj = {
  a: [4, 5, 6],
  b: { x: [7], y: 8, z: [9, 0, true, false, undefined, ''] },
  c: 1
};
eq(deparam(bbqStr), bbqObj, 'bbq full');
eq(deparam(param(bbqObj)), bbqObj, 'bbq round-trip');

console.log('OK — all floor-smoke assertions passed on Node ' + process.version);
