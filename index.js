var engine = require('./lib/engine');
var domCache = require('./lib/domCache');
var URLBuilder = require('./lib/URLBuilder');


function makeExtension(opts) {
  var extension = function(router) {
    router.engine = extension.engine;
    router.use(domCache());
    return router;
  };
  extension.engine = engine;
  return extension;
}

makeExtension.engine = engine;
makeExtension.domCache = domCache;
makeExtension.URLBuilder = URLBuilder;

module.exports = makeExtension;
