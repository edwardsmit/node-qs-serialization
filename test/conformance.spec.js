'use strict';

require('chai').should();

var qss = require('../index.js');
var param = qss.param;
var deparam = qss.deparam;

function decoded(obj) {
  return decodeURIComponent(param(obj));
}

describe('Reference Conformance Spec: param', function () {
  describe('edge cases', function () {
    it('returns empty string with no argument', function () {
      param().should.equal('');
    });
    it('returns empty string for an empty object', function () {
      param({}).should.equal('');
    });
    it('skips an empty array (emits nothing for the key)', function () {
      param({ a: [] }).should.equal('');
    });
  });

  describe('scalar serialization', function () {
    it('serializes a string value', function () {
      param({ a: 'b' }).should.equal('a=b');
    });
    it('serializes a number value', function () {
      param({ a: 1234 }).should.equal('a=1234');
    });
    it('serializes boolean true', function () {
      param({ a: true }).should.equal('a=true');
    });
    it('serializes boolean false', function () {
      param({ a: false }).should.equal('a=false');
    });
    it('drops null-valued keys silently', function () {
      param({ a: null }).should.equal('');
    });
    it('serializes an empty string', function () {
      param({ a: '' }).should.equal('a=');
    });
  });

  describe('function values are invoked', function () {
    it('uses the function return value, not the function itself', function () {
      param({
        a: function () {
          return 'computed';
        }
      }).should.equal('a=computed');
    });
  });

  describe('encoding', function () {
    it('encodes spaces as plus signs (not %20)', function () {
      param({ a: 'hello world' }).should.equal('a=hello+world');
    });
    it('encodes reserved characters', function () {
      param({ a: '&=?#' }).should.equal('a=%26%3D%3F%23');
    });
    it('encodes UTF-8 multibyte characters', function () {
      param({ a: 't\xe9l\xe9' }).should.equal('a=t%C3%A9l%C3%A9');
    });
    it('encodes the key as well as the value', function () {
      param({ 'a key': 'a value' }).should.equal('a+key=a+value');
    });
  });

  describe('arrays (top-level, jQuery traditional bracket notation)', function () {
    it('serializes an array of strings with empty brackets', function () {
      decoded({ a: ['x', 'y', 'z'] }).should.equal('a[]=x&a[]=y&a[]=z');
    });
    it('serializes an array of numbers', function () {
      decoded({ a: [1, 2, 3] }).should.equal('a[]=1&a[]=2&a[]=3');
    });
  });

  describe('nested objects', function () {
    it('serializes a one-level nested object with bracket notation', function () {
      decoded({ a: { b: 'c' } }).should.equal('a[b]=c');
    });
    it('serializes a multi-level nested object', function () {
      decoded({ a: { b: { c: 'd' } } }).should.equal('a[b][c]=d');
    });
  });

  describe('arrays of non-scalars (numeric index gets emitted)', function () {
    it('emits numeric indices for arrays of objects', function () {
      decoded({ a: [{ b: 'c' }] }).should.equal('a[0][b]=c');
    });
    it('emits numeric indices for arrays of arrays', function () {
      decoded({ a: [['x', 'y']] }).should.equal('a[0][]=x&a[0][]=y');
    });
  });

  describe('multiple top-level keys', function () {
    it('preserves insertion order joined by &', function () {
      param({ a: 1, b: 2, c: 3 }).should.equal('a=1&b=2&c=3');
    });
  });

  describe('the canonical bbq complex case', function () {
    it('serializes the full jquery-bbq compatibility example', function () {
      var obj = {
        a: [4, 5, 6],
        b: { x: [7], y: 8, z: [9, 0, true, false, undefined, ''] },
        c: 1
      };
      var expected =
        'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0' +
        '&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
      decoded(obj).should.equal(expected);
    });
  });
});

describe('Reference Conformance Spec: deparam', function () {
  describe('edge cases', function () {
    it('returns an empty object for no argument', function () {
      deparam().should.deep.equal({});
    });
    it('returns an empty object for a non-string argument', function () {
      deparam(123).should.deep.equal({});
      deparam(null).should.deep.equal({});
      deparam({}).should.deep.equal({});
    });
  });

  describe('scalar deserialization with coercion (default)', function () {
    it('keeps a plain string as a string', function () {
      deparam('a=hello').should.deep.equal({ a: 'hello' });
    });
    it('coerces numeric strings to numbers', function () {
      deparam('a=1234').should.deep.equal({ a: 1234 });
    });
    it('coerces "true" / "false" to booleans', function () {
      deparam('a=true').should.deep.equal({ a: true });
      deparam('a=false').should.deep.equal({ a: false });
    });
    it('coerces "null" to null', function () {
      deparam('a=null').should.deep.equal({ a: null });
    });
    it('coerces "undefined" to undefined', function () {
      deparam('a=undefined').should.deep.equal({ a: undefined });
    });
    it('leaves an empty string value as ""', function () {
      deparam('a=').should.deep.equal({ a: '' });
    });
  });

  describe('scalar deserialization without coercion', function () {
    it('keeps numeric strings as strings', function () {
      deparam('a=1234', false).should.deep.equal({ a: '1234' });
    });
    it('keeps "true"/"false" as strings', function () {
      deparam('a=true', false).should.deep.equal({ a: 'true' });
      deparam('a=false', false).should.deep.equal({ a: 'false' });
    });
  });

  describe('keys with no value', function () {
    it('with coerce: bare key yields undefined value', function () {
      deparam('a').should.deep.equal({ a: undefined });
    });
    it('without coerce: bare key yields empty string', function () {
      deparam('a', false).should.deep.equal({ a: '' });
    });
  });

  describe('arrays via bracket notation', function () {
    it('parses a[]=1 into a single-element array', function () {
      deparam('a[]=1').should.deep.equal({ a: [1] });
    });
    it('parses repeated a[] into a multi-element array', function () {
      deparam('a[]=1&a[]=2&a[]=3').should.deep.equal({ a: [1, 2, 3] });
    });
    it('parses pre-1.4 style repeated bare keys into arrays', function () {
      deparam('a=1&a=2&a=3').should.deep.equal({ a: [1, 2, 3] });
    });
    it('parses repeated bare keys without coercion as string arrays', function () {
      deparam('a=1&a=2&a=3', false).should.deep.equal({ a: ['1', '2', '3'] });
    });
  });

  describe('nested objects via bracket notation', function () {
    it('parses one level of nesting', function () {
      deparam('a[b]=c').should.deep.equal({ a: { b: 'c' } });
    });
    it('parses multiple levels of nesting', function () {
      deparam('a[b][c]=d').should.deep.equal({ a: { b: { c: 'd' } } });
    });
  });

  describe('character decoding', function () {
    it('decodes UTF-8 percent encoding', function () {
      deparam('a=t%C3%A9l%C3%A9').should.deep.equal({ a: 't\xe9l\xe9' });
    });
    it('falls back to ISO-8859 (unescape) for non-UTF8 percent sequences', function () {
      deparam('a=t%e9l%e9').should.deep.equal({ a: 't\xe9l\xe9' });
    });
    it('decodes "+" as space (legacy form-encoded)', function () {
      deparam('a=hello+world').should.deep.equal({ a: 'hello world' });
    });
    it('decodes "%20" as space', function () {
      deparam('a=hello%20world').should.deep.equal({ a: 'hello world' });
    });
    it('handles a mix of + and %20 in the same value', function () {
      deparam('a=1+2%203+4').should.deep.equal({ a: '1 2 3 4' });
    });
  });

  describe('the canonical bbq complex round-trip', function () {
    it('parses the full 1.4-style example with coercion', function () {
      var paramStr =
        'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0' +
        '&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
      var paramsObj = {
        a: [4, 5, 6],
        b: { x: [7], y: 8, z: [9, 0, true, false, undefined, ''] },
        c: 1
      };
      deparam(paramStr).should.deep.equal(paramsObj);
    });
    it('parses pre-1.4-style without coercion', function () {
      var s = 'a=1&a=2&a=3&b=4&c=5&c=6&c=true&c=false&c=undefined&c=&d=7';
      var expected = {
        a: ['1', '2', '3'],
        b: '4',
        c: ['5', '6', 'true', 'false', 'undefined', ''],
        d: '7'
      };
      deparam(s, false).should.deep.equal(expected);
    });
  });
});

describe('Reference Conformance Spec: deparam security guards', function () {
  describe('prototype-pollution rejection', function () {
    it('rejects parameters whose key path traverses __proto__', function () {
      var result = deparam('__proto__[polluted]=true');
      result.should.deep.equal({});
      ({}).polluted === undefined
        ? null
        : (function () {
            throw new Error('Object.prototype was polluted!');
          })();
    });
    it('rejects parameters whose key path traverses constructor', function () {
      deparam('a[constructor][foo]=bar').should.deep.equal({});
    });
    it('rejects parameters whose key path traverses prototype', function () {
      deparam('a[prototype][foo]=bar').should.deep.equal({});
    });
    it('still parses harmless params alongside rejected ones', function () {
      deparam('__proto__[x]=1&safe=2').should.deep.equal({ safe: 2 });
    });
  });

  describe('depth-limit DoS guard', function () {
    it('parses depth 5 (the default cap)', function () {
      deparam('a[b][c][d][e]=v').should.deep.equal({
        a: { b: { c: { d: { e: 'v' } } } }
      });
    });
    it('rejects parameters exceeding the default depth cap', function () {
      deparam('a[b][c][d][e][f]=v').should.deep.equal({});
    });
    it('honors a custom maxDepth', function () {
      deparam('a[b][c]=v', true, 2).should.deep.equal({});
      deparam('a[b]=v', true, 2).should.deep.equal({ a: { b: 'v' } });
    });
    it('falls back to the default for an invalid maxDepth', function () {
      deparam('a[b][c][d][e]=v', true, -1).should.deep.equal({
        a: { b: { c: { d: { e: 'v' } } } }
      });
      deparam('a[b][c][d][e][f]=v', true, 0).should.deep.equal({});
    });
  });
});

describe('Reference Conformance Spec: round-trip', function () {
  it('round-trips the bbq canonical case through param then deparam', function () {
    var obj = {
      a: [4, 5, 6],
      b: { x: [7], y: 8, z: [9, 0, true, false, undefined, ''] },
      c: 1
    };
    deparam(param(obj)).should.deep.equal(obj);
  });
  it('round-trips a plain string', function () {
    deparam(param({ prop: 'sillystring' })).should.deep.equal({ prop: 'sillystring' });
  });
  it('round-trips UTF-8 multibyte', function () {
    deparam(param({ a: 't\xe9l\xe9 club ' })).should.deep.equal({ a: 't\xe9l\xe9 club ' });
  });
});
