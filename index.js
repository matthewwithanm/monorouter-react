var engine = require('./lib/engine');
var domCache = require('./lib/domCache');


function extension(router) {
  router.engine = extension.engine;
  router.use(domCache());
  return router;
}

extension.engine = engine;

module.exports = extension;
