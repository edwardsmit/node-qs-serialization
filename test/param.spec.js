'use strict';

require('chai').should();

var qss = require('../index.js');
var param = qss.param;
var deparam = qss.deparam;

function readableParam(s) {
  return decodeURIComponent(param(s));
}

describe('node-qs-serialization.param', function() {
  it('loads', function() {
    param.should.be.a('function');
  });
  it('serializes strings', function() {
    param({ prop: 'sillystring' }).should.equal('prop=sillystring');
    deparam(param({ prop: 'sillystring' })).should
      .deep.equal({ prop: 'sillystring' });
  });
  it('serializes arrays', function() {
    readableParam({prop: ['one', 'two']}).should
      .equal('prop[]=one&prop[]=two');
    deparam(param({prop: ['one', 'two']})).should
      .deep.equal({prop: ['one', 'two']});
  });
  it('serializes objects', function() {
    readableParam({prop: {prop2: 'somestring'}}).should
      .equal('prop[prop2]=somestring');
    deparam(readableParam({prop: {prop2: 'somestring'}})).should
      .deep.equal({prop: {prop2: 'somestring'}});
  });
  it('serializes booleans', function() {
    param({prop: false}).should.equal('prop=false');
    deparam(param({prop: false})).should.deep.equal({prop: false});
  });
  it('serializes numbers', function() {
    param({prop: 1234}).should.equal('prop=1234');
    deparam(param({prop: 1234})).should.deep.equal({prop: 1234});
  });
  it('returns an empty object when no parameter provided', function() {
    param().should.be.empty;
  });
  describe('Should work correctly with encoded characters', function() {
    it('serializes and encodes accented characters', function() {
      param({prop: 't\xe9l\xe9 club '}).should
        .equal('prop=t%C3%A9l%C3%A9+club+');
      deparam(param({prop: 't\xe9l\xe9 club '})).should
        .deep.equal({prop: 't\xe9l\xe9 club '});
    });
  });
});
