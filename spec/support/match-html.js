var compare = require('dom-compare').compare;
var reporter = require('dom-compare').GroupingReporter;
var jsdom = require("jsdom");

module.exports = function() {
  return {
    compare: function(actual, expected) {
      if (typeof actual !== 'object') {
        actual = jsdom.jsdom(actual);
      }

      if (typeof expected !== 'object') {
        expected = jsdom.jsdom(expected);
      }

      var result = compare(expected, actual, {stripSpaces: true});

      return {
        pass: result.getResult(),
        message: result.getResult()
          ? "Expected HTML not to match"
          : "Expected HTML to match: " + reporter.report(result)
      };
    }
  };
};
