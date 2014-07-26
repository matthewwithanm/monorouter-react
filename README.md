monorouter-react
================

ReactJS utils for [monorouter].


Usage
-----

```javascript
var monorouter = require('monorouter');
var reactRouting = require('monorouter-react');

monorouter()
  .setup(reactRouting()) // Use all the utilities
  .route('myurl', function(req) { // Route as normal
    // snip
  });
```

Or you can use the utilities individually (as shown below).


Utilities
---------


### reactEngine

The React engine is used to tell the router how to render React stuff:

```javascript
var monorouter = require('monorouter');
var reactEngine = require('monorouter-react/lib/engine');

monorouter({engine: reactEngine}) // Use the React engine for rendering.
  .route('myurl', function(req) {
    this.render(function() {
      return <div>Hello world!</div>;
    });
  });
```


### domCache

The DOM cache middleware is used to cache data in (and read data from) the DOM.
This is very important for isomorphic React apps because the initial state of
the browser app much match what was sent by the server. If you're getting your
data from a service, it's possible that your server and client could get
different results. To address this, the DOM cache plugin serializes data into
the DOM and (on the browser side), read its from the DOM. This guarantees the
data is the same on both sides of the wire.

The middleware adds a `domCache` method to the routing context (`this` in your
route handlers) which takes three arguments:

- **`key`**: A cache key to use for the data
- **`getter(cb)`**: A function used to look up the data when it can't be found in
  the cache. The function is passed a callback with the signature *`(err, data)`*
  which it should invoke once the data is loaded (or if there is an error).
- **`callback(err, data)`**: A function which will be invoked after the data is
  available.

This middleware will also pass a prop to your view named `domCache` which you
use to place the cache in your template.

```javascript
var monorouter = require('monorouter');
var domCache = require('monorouter-react/lib/domCache');

monorouter({engine: reactEngine})
  .use(domCache())
  .route('myurl', function(req, next) {
    this.domCache('mycachekey', function(cb) {
      // This function is for loading your data. It's only called if the data
      // can't be found in the cache. After it's loaded, pass it to the
      // callback. Since the data will be serialized into the response, it's
      // best to only pass what you need.
      xhr('http://example.com/people.json', function(err, data) {
        if (err) return cb(err);
        cb(null, {name: data.people[0].name});
      });
    }, function(err, data) {
      // This function is called after the data is ready.
      if (err) return next(err);
      this.render(function(props) {
        // Render a view using our loaded data. Don't forget to place the cache
        // too!
        return (
          <div>
            <h2>The first person is {data.name}!</h2>
            {props.domCache()}
          </div>
        );
      });
    });
  });
```

[monorouter]: https://github.com/matthewwithanm/monorouter
