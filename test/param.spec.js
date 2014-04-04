'use strict';
require('chai').should();
var qss = require('../index.js');
var param = qss.param;
var deparam = qss.deparam;
var readableParam = function (s) {
  return decodeURIComponent(param(s));
};
describe('node-jquery-param', function () {
  it('loads', function () {
    param.should.be.a('function');
  });
  it('serializes strings', function () {
    param({ prop: 'sillystring' }).should.equal('prop=sillystring');
    deparam(param({ prop: 'sillystring' })).should.deep.equal({ prop: 'sillystring' });
  });
  it('serializes arrays', function () {
    readableParam({
      prop: [
        'one',
        'two'
      ]
    }).should.equal('prop[]=one&prop[]=two');
    deparam(param({
      prop: [
        'one',
        'two'
      ]
    })).should.deep.equal({
      prop: [
        'one',
        'two'
      ]
    });
  });
  it('serializes objects', function () {
    readableParam({ prop: { prop2: 'somestring' } }).should.equal('prop[prop2]=somestring');
    deparam(readableParam({ prop: { prop2: 'somestring' } })).should.deep.equal({ prop: { prop2: 'somestring' } });
  });
  it('serializes booleans', function () {
    param({ prop: false }).should.equal('prop=false');
    deparam(readableParam({ prop: false })).should.deep.equal({ prop: false });
  });
  it('serializes numbers', function () {
    param({ prop: 1234 }).should.equal('prop=1234');
    deparam(readableParam({ prop: 1234 })).should.deep.equal({ prop: 1234 });
  });
  it('returns an empty object when no parameter provided', function () {
    param().should.be.empty;
  });
  describe('Should work correctly with encoded characters', function () {
    it('serializes and encodes accented characters iso8859 ', function () {
      deparam('par=t%e9l%e9+club+').par.should.equal('t\xe9l\xe9 club ');
    });
    it('serializes and encodes accented characters UTF-8 ', function () {
      deparam('par=t%C3%A9l%C3%A9%20club%20').par.should.equal('t\xe9l\xe9 club ');
    });
  });
});