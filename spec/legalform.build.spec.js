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

        expect(form).toMatchHtml(`
            <div class="wizard-step">
             <form class="form navmenu-form">
               <div class="form-group" data-role="wrapper">
                 <label for="field:foo">Foo</label>
                 <input class="form-control" type="text" name="foo" id="field:foo" value="{{ foo }}">
               </div>
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

    it("will build form with number field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type": "number",
                        "label": "Foo",
                        "name": "foo",
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
                        <input class="form-control" type="text" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}" pattern="\\d+">

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with number with unit field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "amount",
                        "label" : "Foo",
                        "name" : "foo",
                        "optionValue" : [
                            "unit"
                        ],
                        "optionText" : [
                            "units"
                        ]
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
                        <div class="input-group" >
                            <input class="form-control" name="test_group.foo.amount" value="{{ test_group.foo.amount }}" type="text" pattern="\\d+">
                            <span class="input-group-addon">{{ test_group.foo.unit }}</span>
                        </div>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with number with unit field, using multiple units", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "amount",
                        "label" : "Foo",
                        "name" : "foo",
                        "optionValue" : [
                            "unit",
                            "alpha",
                            "beta"
                        ],
                        "optionText" : [
                            "units",
                            "alphas",
                            "betas"
                        ]
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
                        <div class="input-group" >
                            <input class="form-control" name="test_group.foo.amount" value="{{ test_group.foo.amount }}" type="text" pattern="\\d+">
                            <div class="input-group-btn">
                                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">{{ test_group.foo.unit }} <span class="caret"></span></button>
                                <ul class="dropdown-menu pull-right dropdown-select" data-name="test_group.foo.unit" role="menu">
                                {{# test_group.foo.amount == 1 ? meta.test_group.foo.singular : meta.test_group.foo.plural }}
                                    <li><a>{{ . }}</a></li>
                                {{/ meta }}
                                </ul>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with amount field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "money",
                        "label" : "Foo",
                        "name" : "foo",
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
                        <div class="input-group">
                            <span class="input-group-addon">{{ valuta }}</span>
                            <input class="form-control" type="text" pattern="\\d+(,\\d\\d)?" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">
                        </div>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with date field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "date",
                        "label" : "Foo",
                        "name" : "foo",
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
                        <div class="input-group" data-picker="date" >
                            <input class="form-control" type="text" data-mask="99-99-9999" name="test_group.foo" value="{{ test_group.foo }}">
                            <span class="input-group-addon">
                                <span class="fa fa-calendar"></span>
                            </span>
                        </div>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with email field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type": "email",
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
                        <input class="form-control" type="email" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with textarea field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type": "textarea",
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
                        <textarea class="form-control" rows="3" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}"></textarea>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with select field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "select",
                        "label" : "Foo",
                        "name" : "foo",
                        "url" : "",
                        "optionValue" : [
                            "1",
                            "2",
                            "3"
                        ],
                        "optionText" : [
                            "one",
                            "two",
                            "three"
                        ],
                        "optionSelected" : [],
                        "options" : [
                            {
                                "value" : "1",
                                "label" : "one"
                            },
                            {
                                "value" : "2",
                                "label" : "two"
                            },
                            {
                                "value" : "3",
                                "label" : "three"
                            }
                        ]
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
                        <select class="form-control" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}" >
                            <option value="1">one</option>
                            <option value="2">two</option>
                            <option value="3">three</option>
                        </select>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with option group field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "group",
                        "label" : "Foo",
                        "name" : "foo",
                        "optionValue" : [
                            "1",
                            "2",
                            "3"
                        ],
                        "optionText" : [
                            "one",
                            "two",
                            "three"
                        ]
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
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="1" /> one
                            </label>
                        </div>
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="2" /> two
                            </label>
                        </div>
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="3" /> three
                            </label>
                        </div>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with multiple option group field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "group",
                        "label" : "Foo",
                        "name" : "foo",
                        "multiple" : "multiple",
                        "optionValue" : [
                            "1",
                            "2",
                            "3"
                        ],
                        "optionText" : [
                            "one",
                            "two",
                            "three"
                        ]
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
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" multiple="multiple" type="checkbox" name="{{ test_group.foo }}" value="1" /> one
                            </label>
                        </div>
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" multiple="multiple" type="checkbox" name="{{ test_group.foo }}" value="2" /> two
                            </label>
                        </div>
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" multiple="multiple" type="checkbox" name="{{ test_group.foo }}" value="3" /> three
                            </label>
                        </div>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with checkbox field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "checkbox",
                        "label" : "Foo",
                        "name" : "foo",
                        "text" : "Yes or no"
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
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" type="checkbox" checked="{{ test_group.foo }}" /> Yes or no
                            </label>
                        </div>

                    </div>
                </form>
            </div>
        `);
    });

    it("will build form with likert field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "likert",
                        "label" : "Foo",
                        "name" : "foo",
                        "keys" : "Do you like green?\r\nDo you like blue?\r\nDo you like red?",
                        "values" : "Hate it\r\nDislike it\r\nNeutral\r\nLike it\r\nLove it"
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
                        <table class="likert" data-id="test_group.foo">
                            <tr>
                                <td></td>
                                <td><div class="likert-option">Hate it</div></td>
                                <td><div class="likert-option">Dislike it</div></td>
                                <td><div class="likert-option">Neutral</div></td>
                                <td><div class="likert-option">Like it</div></td>
                                <td><div class="likert-option">Love it</div></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like green?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Hate it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Like it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Love it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like blue?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Hate it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Like it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Love it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like red?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Hate it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Like it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Love it" /></td>
                            </tr>
                        </table>

                    </div>
                </form>
            </div>
        `);
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
});
