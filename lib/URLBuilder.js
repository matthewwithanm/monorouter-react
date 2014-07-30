var PropTypes = require('react').PropTypes;

/**
 * A mixin for giving components the ability to buld URLs
 */
var URLBuilder = {
  contextTypes: {
    router: PropTypes.object
  },
  url: function() {
    var router = this.context.router;
    return router.url.apply(router, arguments);
  }
};

module.exports = URLBuilder;
