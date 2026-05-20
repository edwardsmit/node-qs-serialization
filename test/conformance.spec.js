'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const qss = require('../index.js');
const param = qss.param;
const deparam = qss.deparam;

function decoded(obj) {
  return decodeURIComponent(param(obj));
}

describe('Reference Conformance Spec: param', () => {
  describe('edge cases', () => {
    it('returns empty string with no argument', () => {
      assert.equal(param(), '');
    });
    it('returns empty string for an empty object', () => {
      assert.equal(param({}), '');
    });
    it('skips an empty array (emits nothing for the key)', () => {
      assert.equal(param({ a: [] }), '');
    });
  });

  describe('scalar serialization', () => {
    it('serializes a string value', () => {
      assert.equal(param({ a: 'b' }), 'a=b');
    });
    it('serializes a number value', () => {
      assert.equal(param({ a: 1234 }), 'a=1234');
    });
    it('serializes boolean true', () => {
      assert.equal(param({ a: true }), 'a=true');
    });
    it('serializes boolean false', () => {
      assert.equal(param({ a: false }), 'a=false');
    });
    it('drops null-valued keys silently', () => {
      assert.equal(param({ a: null }), '');
    });
    it('serializes an empty string', () => {
      assert.equal(param({ a: '' }), 'a=');
    });
  });

  describe('function values are invoked', () => {
    it('uses the function return value, not the function itself', () => {
      assert.equal(
        param({
          a: () => 'computed'
        }),
        'a=computed'
      );
    });
  });

  describe('encoding', () => {
    it('encodes spaces as plus signs (not %20)', () => {
      assert.equal(param({ a: 'hello world' }), 'a=hello+world');
    });
    it('encodes reserved characters', () => {
      assert.equal(param({ a: '&=?#' }), 'a=%26%3D%3F%23');
    });
    it('encodes UTF-8 multibyte characters', () => {
      assert.equal(param({ a: 't\xe9l\xe9' }), 'a=t%C3%A9l%C3%A9');
    });
    it('encodes the key as well as the value', () => {
      assert.equal(param({ 'a key': 'a value' }), 'a+key=a+value');
    });
  });

  describe('arrays (top-level, jQuery traditional bracket notation)', () => {
    it('serializes an array of strings with empty brackets', () => {
      assert.equal(decoded({ a: ['x', 'y', 'z'] }), 'a[]=x&a[]=y&a[]=z');
    });
    it('serializes an array of numbers', () => {
      assert.equal(decoded({ a: [1, 2, 3] }), 'a[]=1&a[]=2&a[]=3');
    });
  });

  describe('nested objects', () => {
    it('serializes a one-level nested object with bracket notation', () => {
      assert.equal(decoded({ a: { b: 'c' } }), 'a[b]=c');
    });
    it('serializes a multi-level nested object', () => {
      assert.equal(decoded({ a: { b: { c: 'd' } } }), 'a[b][c]=d');
    });
  });

  describe('arrays of non-scalars (numeric index gets emitted)', () => {
    it('emits numeric indices for arrays of objects', () => {
      assert.equal(decoded({ a: [{ b: 'c' }] }), 'a[0][b]=c');
    });
    it('emits numeric indices for arrays of arrays', () => {
      assert.equal(decoded({ a: [['x', 'y']] }), 'a[0][]=x&a[0][]=y');
    });
  });

  describe('multiple top-level keys', () => {
    it('preserves insertion order joined by &', () => {
      assert.equal(param({ a: 1, b: 2, c: 3 }), 'a=1&b=2&c=3');
    });
  });

  describe('the canonical bbq complex case', () => {
    it('serializes the full jquery-bbq compatibility example', () => {
      const obj = {
        a: [4, 5, 6],
        b: { x: [7], y: 8, z: [9, 0, true, false, undefined, ''] },
        c: 1
      };
      const expected =
        'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0' +
        '&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
      assert.equal(decoded(obj), expected);
    });
  });
});

describe('Reference Conformance Spec: deparam', () => {
  describe('edge cases', () => {
    it('returns an empty object for no argument', () => {
      assert.deepEqual(deparam(), {});
    });
    it('returns an empty object for a non-string argument', () => {
      assert.deepEqual(deparam(123), {});
      assert.deepEqual(deparam(null), {});
      assert.deepEqual(deparam({}), {});
    });
  });

  describe('scalar deserialization with coercion (default)', () => {
    it('keeps a plain string as a string', () => {
      assert.deepEqual(deparam('a=hello'), { a: 'hello' });
    });
    it('coerces numeric strings to numbers', () => {
      assert.deepEqual(deparam('a=1234'), { a: 1234 });
    });
    it('coerces "true" / "false" to booleans', () => {
      assert.deepEqual(deparam('a=true'), { a: true });
      assert.deepEqual(deparam('a=false'), { a: false });
    });
    it('coerces "null" to null', () => {
      assert.deepEqual(deparam('a=null'), { a: null });
    });
    it('coerces "undefined" to undefined', () => {
      assert.deepEqual(deparam('a=undefined'), { a: undefined });
    });
    it('leaves an empty string value as ""', () => {
      assert.deepEqual(deparam('a='), { a: '' });
    });
  });

  describe('scalar deserialization without coercion', () => {
    it('keeps numeric strings as strings', () => {
      assert.deepEqual(deparam('a=1234', false), { a: '1234' });
    });
    it('keeps "true"/"false" as strings', () => {
      assert.deepEqual(deparam('a=true', false), { a: 'true' });
      assert.deepEqual(deparam('a=false', false), { a: 'false' });
    });
  });

  describe('keys with no value', () => {
    it('with coerce: bare key yields undefined value', () => {
      assert.deepEqual(deparam('a'), { a: undefined });
    });
    it('without coerce: bare key yields empty string', () => {
      assert.deepEqual(deparam('a', false), { a: '' });
    });
  });

  describe('arrays via bracket notation', () => {
    it('parses a[]=1 into a single-element array', () => {
      assert.deepEqual(deparam('a[]=1'), { a: [1] });
    });
    it('parses repeated a[] into a multi-element array', () => {
      assert.deepEqual(deparam('a[]=1&a[]=2&a[]=3'), { a: [1, 2, 3] });
    });
    it('parses pre-1.4 style repeated bare keys into arrays', () => {
      assert.deepEqual(deparam('a=1&a=2&a=3'), { a: [1, 2, 3] });
    });
    it('parses repeated bare keys without coercion as string arrays', () => {
      assert.deepEqual(deparam('a=1&a=2&a=3', false), { a: ['1', '2', '3'] });
    });
  });

  describe('nested objects via bracket notation', () => {
    it('parses one level of nesting', () => {
      assert.deepEqual(deparam('a[b]=c'), { a: { b: 'c' } });
    });
    it('parses multiple levels of nesting', () => {
      assert.deepEqual(deparam('a[b][c]=d'), { a: { b: { c: 'd' } } });
    });
  });

  describe('character decoding', () => {
    it('decodes UTF-8 percent encoding', () => {
      assert.deepEqual(deparam('a=t%C3%A9l%C3%A9'), { a: 't\xe9l\xe9' });
    });
    it('falls back to ISO-8859 (unescape) for non-UTF8 percent sequences', () => {
      assert.deepEqual(deparam('a=t%e9l%e9'), { a: 't\xe9l\xe9' });
    });
    it('decodes "+" as space (legacy form-encoded)', () => {
      assert.deepEqual(deparam('a=hello+world'), { a: 'hello world' });
    });
    it('decodes "%20" as space', () => {
      assert.deepEqual(deparam('a=hello%20world'), { a: 'hello world' });
    });
    it('handles a mix of + and %20 in the same value', () => {
      assert.deepEqual(deparam('a=1+2%203+4'), { a: '1 2 3 4' });
    });
  });

  describe('the canonical bbq complex round-trip', () => {
    it('parses the full 1.4-style example with coercion', () => {
      const paramStr =
        'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0' +
        '&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
      const paramsObj = {
        a: [4, 5, 6],
        b: { x: [7], y: 8, z: [9, 0, true, false, undefined, ''] },
        c: 1
      };
      assert.deepEqual(deparam(paramStr), paramsObj);
    });
    it('parses pre-1.4-style without coercion', () => {
      const s = 'a=1&a=2&a=3&b=4&c=5&c=6&c=true&c=false&c=undefined&c=&d=7';
      const expected = {
        a: ['1', '2', '3'],
        b: '4',
        c: ['5', '6', 'true', 'false', 'undefined', ''],
        d: '7'
      };
      assert.deepEqual(deparam(s, false), expected);
    });
  });
});

describe('Reference Conformance Spec: deparam security guards', () => {
  describe('prototype-pollution rejection', () => {
    it('rejects parameters whose key path traverses __proto__', () => {
      const result = deparam('__proto__[polluted]=true');
      assert.deepEqual(result, {});
      if ({}.polluted !== undefined) {
        throw new Error('Object.prototype was polluted!');
      }
    });
    it('rejects parameters whose key path traverses constructor', () => {
      assert.deepEqual(deparam('a[constructor][foo]=bar'), {});
    });
    it('rejects parameters whose key path traverses prototype', () => {
      assert.deepEqual(deparam('a[prototype][foo]=bar'), {});
    });
    it('still parses harmless params alongside rejected ones', () => {
      assert.deepEqual(deparam('__proto__[x]=1&safe=2'), { safe: 2 });
    });
  });

  describe('depth-limit DoS guard', () => {
    it('parses depth 5 (the default cap)', () => {
      assert.deepEqual(deparam('a[b][c][d][e]=v'), {
        a: { b: { c: { d: { e: 'v' } } } }
      });
    });
    it('rejects parameters exceeding the default depth cap', () => {
      assert.deepEqual(deparam('a[b][c][d][e][f]=v'), {});
    });
    it('honors a custom maxDepth', () => {
      assert.deepEqual(deparam('a[b][c]=v', true, 2), {});
      assert.deepEqual(deparam('a[b]=v', true, 2), { a: { b: 'v' } });
    });
    it('falls back to the default for an invalid maxDepth', () => {
      assert.deepEqual(deparam('a[b][c][d][e]=v', true, -1), {
        a: { b: { c: { d: { e: 'v' } } } }
      });
      assert.deepEqual(deparam('a[b][c][d][e][f]=v', true, 0), {});
    });
  });
});

describe('Reference Conformance Spec: round-trip', () => {
  it('round-trips the bbq canonical case through param then deparam', () => {
    const obj = {
      a: [4, 5, 6],
      b: { x: [7], y: 8, z: [9, 0, true, false, undefined, ''] },
      c: 1
    };
    assert.deepEqual(deparam(param(obj)), obj);
  });
  it('round-trips a plain string', () => {
    assert.deepEqual(deparam(param({ prop: 'sillystring' })), { prop: 'sillystring' });
  });
  it('round-trips UTF-8 multibyte', () => {
    assert.deepEqual(deparam(param({ a: 't\xe9l\xe9 club ' })), { a: 't\xe9l\xe9 club ' });
  });
});
