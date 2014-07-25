var engine = require('./lib/engine');


function extension(router) {
  router.engine = extension.engine;
}

extension.engine = engine;

module.exports = extension;
