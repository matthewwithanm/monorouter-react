var React = require('react');
var delayed = require('monorouter/lib/utils/delayed');
var extend = require('xtend');


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
    return 'window.__monorouterReactDOMCache = ' + JSON.stringify(this.props.cache);
  }
});

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

      // We want the things we add to the cache to persist for the rest of this
      // request but not beyond that, so we make a copy of the cache object
      // instead of mutating it directly.
      cache = this._cache = extend(win.__monorouterReactDOMCache);
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
  return DOMCache({cache: this._cache});
};

module.exports = createMiddleware;
