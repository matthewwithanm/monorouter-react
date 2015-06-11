var React = require('react');
var TestUtils = require('react/addons').addons.TestUtils;
var assert = require('chai').assert;
var domCache = require('../domCache');


describe('domCache', function() {

  it('properly escapes line separator and paragraph separator characters', function(done) {
    var stubRouter = Object.create(StubRouter);
    stubRouter.use(domCache());
    stubRouter.domCache('test',
      function(cb) { cb(null, '\u2028\u2029'); },
      function(err) {
        if (err) done(err);
        this.render(function(props) {
          var result = render(props.domCache());
          var html = result.props.dangerouslySetInnerHTML.__html;
          assert.notMatch(html, /\u2028/);
          assert.match(html, /\\u2028/);
          assert.notMatch(html, /\u2029/);
          assert.match(html, /\\u2029/);
          done();
        })
      });
  });

});

function render(element) {
  var renderer = TestUtils.createRenderer();
  renderer.render(element);
  return renderer.getRenderOutput();
}

var StubRouter = {
  setVars: function(vars) {
    this.vars = vars;
  },
  use: function(fn) {
    fn.bind(this)({}, function(){});
  },
  render: function(fn) {
    fn(this.vars);
  }
};
