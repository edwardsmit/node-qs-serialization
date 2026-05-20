'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const qss = require('../index.js');
const param = qss.param;
const deparam = qss.deparam;

function readableParam(s) {
  return decodeURIComponent(param(s));
}

describe('node-qs-serialization.param', () => {
  it('loads', () => {
    assert.equal(typeof param, 'function');
  });
  it('serializes strings', () => {
    assert.equal(param({ prop: 'sillystring' }), 'prop=sillystring');
    assert.deepEqual(deparam(param({ prop: 'sillystring' })), { prop: 'sillystring' });
  });
  it('serializes arrays', () => {
    assert.equal(readableParam({ prop: ['one', 'two'] }), 'prop[]=one&prop[]=two');
    assert.deepEqual(deparam(param({ prop: ['one', 'two'] })), { prop: ['one', 'two'] });
  });
  it('serializes objects', () => {
    assert.equal(readableParam({ prop: { prop2: 'somestring' } }), 'prop[prop2]=somestring');
    assert.deepEqual(deparam(readableParam({ prop: { prop2: 'somestring' } })), {
      prop: { prop2: 'somestring' }
    });
  });
  it('serializes booleans', () => {
    assert.equal(param({ prop: false }), 'prop=false');
    assert.deepEqual(deparam(param({ prop: false })), { prop: false });
  });
  it('serializes numbers', () => {
    assert.equal(param({ prop: 1234 }), 'prop=1234');
    assert.deepEqual(deparam(param({ prop: 1234 })), { prop: 1234 });
  });
  it('returns an empty string when no parameter provided', () => {
    assert.equal(param(), '');
  });
  describe('Should work correctly with encoded characters', () => {
    it('serializes and encodes accented characters', () => {
      assert.equal(param({ prop: 't\xe9l\xe9 club ' }), 'prop=t%C3%A9l%C3%A9+club+');
      assert.deepEqual(deparam(param({ prop: 't\xe9l\xe9 club ' })), { prop: 't\xe9l\xe9 club ' });
    });
  });
});
