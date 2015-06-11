var React = require('react');
var delayed = require('monorouter/lib/utils/delayed');


var win = typeof window !== 'undefined' ? window : null;
var script = React.DOM.script;

var DOMCache = React.createClass({
  getInitialState: function() {
    return {inDOM: false};
  },
  componentDidMount: function() {
    this.setState({inDOM: true});
  },
  shouldComponentUpdate: function() {
    return !this.state.inDOM;
  },
  render: function() {
    return script({dangerouslySetInnerHTML: {__html: this.renderScript()}});
  },
  renderScript: function() {
    // Because stringification is non-deterministic (and the server <script>
    // tag needs to match the browser's), we write the cache as a string instead
    // of a JS object.
    var str = win && win.__monorouterReactDOMCache || stringifyCache(this.props.cache);
    return 'window.__monorouterReactDOMCache = ' + JSON.stringify(str);
  }
});

function stringifyCache(cache) {
  // We explicitly escape these characters (Line separator U+2028 and Paragraph
  // Separator U+2029) because they are not valid JavaScript, but they *are*
  // valid JSON. Not escaping these can result in mysterious 'Unexpected token'
  // syntax errors in the browser.
  return JSON.stringify(cache).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
}

function createMiddleware(opts) {
  /**
   * A middleware that adds a `domCache` method to the response object for
   * serializing data to, and reading it from, the DOM.
   */
  return function(req, next) {
    this.domCache = domCache;
    this.setVars({domCache: this.domCache.render.bind(this)});
    next();
  };
}

/**
 * Wrap the provided function so as to catch thrown errors and relay them to the
 * response.
 */
function safe(fn, res) {
  return function() {
    try {
      return fn.apply(this, arguments);
    } catch (err) {
      res['throw'](err);
    }
  };
}

var domCache = delayed(function(key, getter, callback) {
  var cache;

  if (!(cache = this._cache)) {
    if (win) {
      if (!win.__monorouterReactDOMCache) {
        throw new Error('Cache not found. You may have forgotten to place it in the DOM, or initialized the router before it was available.');
      }
      cache = this._cache = JSON.parse(win.__monorouterReactDOMCache);
    } else {
      cache = this._cache = {};
    }
  }

  var data = cache[key];
  callback = safe(callback, this);
  if (data !== undefined) {
    callback.call(this, null, data);
  } else {
    safe(getter, this).call(this, function(err, data) {
      callback.call(this, err, err ? null : cache[key] = data);
    }.bind(this));
  }
});

domCache.render = function() {
  return (React.createFactory || function(x) {return x;})(DOMCache)({cache: this._cache});
};

module.exports = createMiddleware;
