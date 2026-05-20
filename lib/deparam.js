/* global unescape */
'use strict';

var qs = require('qs');

var DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
var DEFAULT_MAX_DEPTH = 5;

function safeDecodeURIComponent(str) {
  var withSpaces = str.replace(/\+/g, ' ');
  try { return decodeURIComponent(withSpaces); }
  catch (e) { return unescape(withSpaces); }
}

function safeDecoder(str, defaultDecoder, charset, type) {
  if (type === 'key') return defaultDecoder(str, defaultDecoder, charset);
  return safeDecodeURIComponent(str);
}

function keySegments(rawKey) {
  var decoded = safeDecodeURIComponent(rawKey);
  var match = /^([^[]*)((?:\[[^\]]*\])*)$/.exec(decoded);
  if (!match) return [decoded];
  var segments = [match[1]];
  var bracketed = match[2];
  if (bracketed) {
    var bracketRe = /\[([^\]]*)\]/g;
    var m;
    while ((m = bracketRe.exec(bracketed))) segments.push(m[1]);
  }
  return segments;
}

function preFilter(qsString, maxDepth) {
  if (!qsString) return qsString;
  return qsString.split('&').filter(function(pair) {
    var rawKey = pair.split('=')[0];
    if (!rawKey) return false;
    var segments = keySegments(rawKey);
    var nonEmpty = segments.filter(function(s) { return s !== ''; });
    if (nonEmpty.length > maxDepth) return false;
    for (var i = 0; i < segments.length; i++) {
      if (DANGEROUS_KEYS.indexOf(segments[i]) !== -1) return false;
    }
    return true;
  }).join('&');
}

function coerceScalar(v) {
  if (v === null) return undefined;
  if (v === undefined) return undefined;
  if (typeof v !== 'string') return v;
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  if (v === 'undefined') return undefined;
  if (!isNaN(+v)) return +v;
  return v;
}

function coerceWalk(o) {
  if (Array.isArray(o)) return o.map(coerceWalk);
  if (o && typeof o === 'object') {
    var out = {};
    for (var k in o) {
      if (Object.prototype.hasOwnProperty.call(o, k)) out[k] = coerceWalk(o[k]);
    }
    return out;
  }
  return coerceScalar(o);
}

exports.deparam = function(params, coerce, maxDepth) {
  if (typeof params !== 'string') return {};
  if (typeof coerce === 'undefined') coerce = true;
  if (typeof maxDepth !== 'number' || maxDepth < 1) maxDepth = DEFAULT_MAX_DEPTH;

  var filtered = preFilter(params, maxDepth);
  if (!filtered) return {};

  var parsed = qs.parse(filtered, {
    decoder: safeDecoder,
    depth: maxDepth,
    strictDepth: false,
    arrayLimit: 1000,
    parameterLimit: 10000,
    allowPrototypes: false,
    strictNullHandling: !!coerce
  });

  return coerce ? coerceWalk(parsed) : parsed;
};
