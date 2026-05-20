'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const deparam = require('../index.js').deparam;

describe('node-qs-serialization.deparam', () => {
  it('loads', () => {
    assert.equal(typeof deparam, 'function');
  });
  it('deserializes strings', () => {
    assert.equal(typeof deparam('prop=sillystring').prop, 'string');
  });
  it('deserializes arrays', () => {
    assert.ok(Array.isArray(deparam('prop[]=one&prop[]=two').prop));
  });
  it('deserializes objects', () => {
    assert.equal(typeof deparam('prop[prop2]=somestring').prop, 'object');
  });
  it('deserializes booleans', () => {
    assert.equal(typeof deparam('prop=false').prop, 'boolean');
  });
  it('deserializes numbers', () => {
    assert.equal(typeof deparam('prop=1234').prop, 'number');
  });
  it('deserializes booleans into strings when without coercion', () => {
    assert.equal(typeof deparam('prop=false', false).prop, 'string');
  });
  it('deserializes numbers into strings when without coercion', () => {
    assert.equal(typeof deparam('prop=1234', false).prop, 'string');
  });
  it('returns an empty object when provided querystring is not a string', () => {
    assert.deepEqual(deparam(123), {});
  });
  it('returns an empty object when no querystring is provided', () => {
    assert.deepEqual(deparam(), {});
  });
  describe('bbq specs', () => {
    it('deserializes 1.4-style params', () => {
      const paramStr =
        'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0' +
        '&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
      const paramsObj = {
        a: [4, 5, 6],
        b: {
          x: [7],
          y: 8,
          z: [9, 0, true, false, undefined, '']
        },
        c: 1
      };
      assert.deepEqual(deparam(paramStr), paramsObj);
    });
    it('deserializes pre-1.4-style params without coercion', () => {
      const paramStr = 'a=1&a=2&a=3&b=4&c=5&c=6&c=true&c=false' + '&c=undefined&c=&d=7';
      const paramsObj = {
        a: ['1', '2', '3'],
        b: '4',
        c: ['5', '6', 'true', 'false', 'undefined', ''],
        d: '7'
      };
      assert.deepEqual(deparam(paramStr, false), paramsObj);
    });
    it('deserializes pre1.4-style params with coercion', () => {
      const paramStr = 'a=1&a=2&a=3&b=4&c=5&c=6&c=true&c=false' + '&c=undefined&c=&d=7';
      const paramsObj = {
        a: [1, 2, 3],
        b: 4,
        c: [5, 6, true, false, undefined, ''],
        d: 7
      };
      assert.deepEqual(deparam(paramStr), paramsObj);
    });
  });
  describe('Should work correctly with encoded characters', () => {
    it('deserializes and decodes accented characters iso8859 ', () => {
      assert.equal(deparam('par=t%e9l%e9+club+').par, 't\xe9l\xe9 club ');
    });
    it('deserializes and decodes accented characters UTF-8 ', () => {
      assert.equal(deparam('par=t%C3%A9l%C3%A9%20club%20').par, 't\xe9l\xe9 club ');
    });
    it('deserializes and decodes spaces both encoded as %20 as well as +', () => {
      assert.equal(deparam('par=1+2%203+4%205').par, '1 2 3 4 5');
    });
  });
});
