var engine = require('./lib/engine');


function extension(router) {
  router.engine = extension.engine;
  return router;
}

extension.engine = engine;

module.exports = extension;
