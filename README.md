# node-qs-serialization

Serialization and deserialization of Javascript objects for use in the querystring part of an url.
Slightly modified from jQuery's $.param function [$.param method](http://api.jquery.com/jQuery.param/) and Ben Alman's [jquery-bbq](https://github.com/cowboy/jquery-bbq/) with license info for both included.

`deparam` delegates parsing to [`qs`](https://github.com/ljharb/qs) and adds an ISO-8859 percent-encoding fallback, type coercion, and per-parameter depth and prototype-key rejection on top. `param` is the original pure-JS jQuery-traditional serializer.

param serializes any Javascript object to a valid querystring.
deparam deserializes a provided querystring.

```javascript
var param = require('node-qs-serialization').param;
var deparam = require('node-qs-serialization').deparam;

var paramStr =
  'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
var paramsObj = {
  a: [4, 5, 6],
  b: {
    x: [7],
    y: 8,
    z: [9, 0, true, false, undefined, '']
  },
  c: 1
};

param(paramsObj).should.equal(paramStr);
deparam(paramStr).should.deep.equal(paramsObj);
```

# Install

```
npm install node-qs-serialization
```

(Or from source: `npm install github:edwardsmit/node-qs-serialization`.)

# Usage

```
var param = require('node-qs-serialization').param;
var deparam = require('node-qs-serialization').deparam;
var paramsObj = deparam(querystring);
var querystring = param(paramsObj);
```

### `deparam(querystring, coerce = true, maxDepth = 5)`

- `coerce` — when `true` (default), strings `"true"`, `"false"`, `"null"`, `"undefined"` and numeric values are converted to their JS equivalents.
- `maxDepth` — caps nested bracket depth (default `5`). Parameters whose key path exceeds this depth are silently dropped. Keys equal to `__proto__`, `constructor`, or `prototype` are always rejected to prevent prototype pollution.

# Security

See [SECURITY.md](./SECURITY.md) for disclosure policy.

# License

MIT — see [LICENSE](./LICENSE) for full text including the attributions to jQuery and jquery-bbq from which `param` and `deparam` are adapted.
