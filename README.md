node-qs-serialization
===================
Serialization and deserialization of Javascript objects for use in the querystring part of an url without any external dependency.
Slightly modified from jQuery's $.param function [$.param method](http://api.jquery.com/jQuery.param/) and Ben Alman's [jquery-bbq](https://github.com/cowboy/jquery-bbq/) with license info for both included.

param serializes any Javascript object to a valid querystring.
deparam deserializes a provided querystring.

```javascript
var param = require('node-qs-serialization').param;
var deparam = require('node-qs-serialization').deparam;

var paramStr = 'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
var paramsObj = {
    a: [4,5,6],
    b:{
        x:[7],
        y:8,
        z:[9,0,true,false,undefined,'']
    },
    c:1
};

param(paramsObj).should.equal(paramStr);
deparam(paramStr).should.deep.equal(paramsObj);

```

Install
==============
```
npm install git://github.com/edwardsmit/node-qs-serialization.git
```

Usage
===============
```
var param = require('node-qs-serialization').param;
var deparam = require('node-qs-serialization').deparam;
var paramsObj = deparam(querystring);
var querystring = param(paramsObj);
```

License
===============
MIT
