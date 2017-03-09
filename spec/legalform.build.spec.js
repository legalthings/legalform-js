'use strict';

describe("building a LegalForm", function() {
  var jQuery;
  var LegalForm = require('../js/legalform');

  beforeAll(function() {
      jasmine.addMatchers({toMatchHtml: require('./support/match-html')});
  })

  beforeAll(function(done) {
    require("jsdom").env("", function(err, window) {
      if (err) {
          return;
      }

      jQuery = require("jquery")(window);
      done();
    });
  });

  it("will build from a simple definition", function() {
    var definition = [
      {
        "fields": [
          {
            "type": "text",
            "label":"Foo",
            "name":"foo"
          }
        ]
      }
    ];

    var form = new LegalForm(jQuery).build(definition);

    expect(form).toMatchHtml([
'<div class="wizard-step">',
' <form class="form navmenu-form">',
'   <div class="form-group" data-role="wrapper">',
'     <label for="field:foo">Foo</label>',
'     <input class="form-control" type="text" name="foo" id="field:foo" value="{{ foo }}">',
'   </div>',
'  </form>',
'</div>'
].join(''));
  });
});
