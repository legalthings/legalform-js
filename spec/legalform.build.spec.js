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

    it("will build form with static field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type": "text",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "type": "static",
                        "name": "bar",
                        "content": "<p>Foo text: {{ test_group.foo }}</p>",
                        "conditions": ".foo === 'test'"
                    }
                ]
            }
        ];

        var form = new LegalForm(jQuery).build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <input class="form-control" type="text" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">
                    </div>
                    {{#  test_group.foo === 'test' }}
                    <div class="form-group" data-role="wrapper">
                        <p>Foo text: {{ test_group.foo }}</p>
                    </div>
                    {{/  test_group.foo === 'test' }}
                </form>
            </div>
        `);
    });

    it("will build form with password field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type": "password",
                        "label": "Foo",
                        "name": "foo"
                    }
                ]
            }
        ];

        var form = new LegalForm(jQuery).build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <input class="form-control" type="password" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">
                    </div>
                </form>
            </div>
        `);
    });
});
