var React = require('react');

module.exports = {
  renderInto: function(router, element) {
    React.withContext({router: router}, function() {
      React.render(router.render(), element);
    });
  },
  renderToString: function(router) {
    var string;
    React.withContext({router: router}, function() {
      string = React.renderToString(router.render());
    });
    return string;
  }
};
