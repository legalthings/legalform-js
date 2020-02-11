'use strict';

describe("building a LegalForm for live-contract model", function() {
    var jQuery;
    var LegalForm = require('../js/legalform');
    var BootstrapVariant = require('../js/variants/bootstrap');
    var legalForm = null;

    beforeAll(function(done) {
        require("jsdom").env("", function(err, window) {
            if (err) {
                return;
            }

            jQuery = require("jquery")(window);
            done();
        });
    });

    beforeAll(function() {
        jasmine.addMatchers({toMatchHtml: require('./support/match-html')});

        var variant = new BootstrapVariant(jQuery);
        legalForm = new LegalForm(variant);
    })

    it("will build form with text fields", function() {
        var definition = [
            {
                "group" : "test_group",
                "anchor" : "1",
                "fields" : [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" :"Foo",
                        "name" :"foo"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Bar",
                        "name" : "bar",
                        "default" : "Default value",
                        "required" : "required",
                        "helptext" : "Test help text",
                        "conditions" : ".foo === 'test'",
                        "pattern" : "[\\d\\w]*",
                        "mask" : "999aa",
                        "validation" : ".bar === '123ab'"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step" data-article="1">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <input class="form-control" type="text" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">
                    </div>

                    {{#  test_group.foo === 'test' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <input class="form-control" type="text" name="test_group.bar" value="{{ test_group.bar }}" required="required" pattern="[\\d\\w]*" data-mask="999aa" validation=".bar === '123ab'" id="field:test_group.bar">
                        <span class="help" rel="tooltip" data-html="true" data-title="Test help text"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo === 'test' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with password fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#password",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#password",
                        "label" : "Bar",
                        "name" : "bar",
                        "default" : "Default value",
                        "required" : "required",
                        "helptext" : "Password should contain digits and letters, at least 10 symbols",
                        "conditions" : ".foo === 'test'",
                        "pattern" : "[\\d\\w]*",
                        "validation" : ".bar.length >= 10"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <input class="form-control" type="password" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">
                    </div>

                    {{#  test_group.foo === 'test' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <input class="form-control" type="password" name="test_group.bar" value="{{ test_group.bar }}" required="required" pattern="[\\d\\w]*" validation=".bar.length >= 10" id="field:test_group.bar">
                        <span class="help" rel="tooltip" data-html="true" data-title="Password should contain digits and letters, at least 10 symbols"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo === 'test' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with number fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label": "Foo",
                        "name": "foo",
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Bar",
                        "name" : "bar",
                        "default" : "2",
                        "decimals" : "0",
                        "required" : "required",
                        "helptext" : "Number should be between 2 and 8, and be even",
                        "conditions" : ".foo == 4",
                        "validation" : ".bar % 2 === 0",
                        "min" : "2",
                        "max" : "8"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <input class="form-control" type="text" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}" pattern="\\d+">
                    </div>

                    {{#  test_group.foo == 4 }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <input class="form-control" type="text" name="test_group.bar" value="{{ test_group.bar }}" decimals="0" required="required" validation=".bar % 2 === 0" min="2" max="8" id="field:test_group.bar" pattern="\\d+">
                        <span class="help" rel="tooltip" data-html="true" data-title="Number should be between 2 and 8, and be even"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 4 }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with number with unit fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#amount",
                        "label" : "Foo",
                        "name" : "foo",
                        "options" : [
                            {"singular" : "unit", "plural" : "units"}
                        ]
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#amount",
                        "label" : "Bar",
                        "name" : "bar",
                        "options" : [
                            {"singular" : "unit", "plural" : "units"}
                        ],
                        "default" : "2",
                        "decimals" : "0",
                        "required" : "required",
                        "helptext" : "Number should be between 2 and 8, and be even",
                        "conditions" : ".foo == 4",
                        "validation" : ".bar % 2 === 0",
                        "min" : "2",
                        "max" : "8"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

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

                    {{#  test_group.foo == 4 }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <div class="input-group" ><input class="form-control" name="test_group.bar.amount" value="{{ test_group.bar.amount }}" type="text" decimals="0" required="required" validation=".bar % 2 === 0" min="2" max="8" pattern="\\d+"><span class="input-group-addon">{{ test_group.bar.unit }}</span></div>
                        <span class="help" rel="tooltip" data-html="true" data-title="Number should be between 2 and 8, and be even"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 4 }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with number with unit fields, using multiple units", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#amount",
                        "label" : "Foo",
                        "name" : "foo",
                        "options" : [
                            {"singular" : "unit", "plural" : "units"},
                            {"singular" : "alpha", "plural" : "alphas"},
                            {"singular" : "beta", "plural" : "betas"}
                        ]
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#amount",
                        "label" : "Bar",
                        "name" : "bar",
                        "options" : [
                            {"singular" : "unit", "plural" : "units"},
                            {"singular" : "alpha", "plural" : "alphas"},
                            {"singular" : "beta", "plural" : "betas"}
                        ],
                        "default" : "2",
                        "decimals" : "0",
                        "required" : "required",
                        "helptext" : "Number should be between 2 and 8, and be even",
                        "conditions" : ".foo == 4",
                        "validation" : ".bar % 2 === 0",
                        "min" : "2",
                        "max" : "8"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <div class="input-group" >
                            <input class="form-control" name="test_group.foo.amount" value="{{ test_group.foo.amount }}" type="text" pattern="\\d+">
                            <div class="input-group-btn">
                                <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">{{ test_group.foo.unit }} </button>
                                <ul class="dropdown-menu pull-right dropdown-select" data-name="test_group.foo.unit" role="menu">
                                {{# test_group.foo.amount == 1 ? meta.test_group.foo.singular : meta.test_group.foo.plural }}
                                    <li><a>{{ . }}</a></li>
                                {{/ meta }}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {{#  test_group.foo == 4 }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <div class="input-group" ><input class="form-control" name="test_group.bar.amount" value="{{ test_group.bar.amount }}" type="text" decimals="0" required="required" validation=".bar % 2 === 0" min="2" max="8" pattern="\\d+">
                            <div class="input-group-btn"><button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">{{ test_group.bar.unit }} </button>
                                <ul class="dropdown-menu pull-right dropdown-select" data-name="test_group.bar.unit" role="menu">
                                    {{# test_group.bar.amount == 1 ? meta.test_group.bar.singular : meta.test_group.bar.plural }}<li><a>{{ . }}</a></li>{{/ meta }}
                                </ul>
                            </div>
                        </div>
                        <span class="help" rel="tooltip" data-html="true" data-title="Number should be between 2 and 8, and be even"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 4 }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with amount fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#money",
                        "label" : "Foo",
                        "name" : "foo",
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#money",
                        "label" : "Bar",
                        "name" : "bar",
                        "default" : "2",
                        "required" : "required",
                        "helptext" : "Number should be between 2 and 8, and be even",
                        "conditions" : ".foo == 4",
                        "validation" : ".bar % 2 === 0",
                        "min" : "2",
                        "max" : "8"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);
        var expected = `
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo" class="label-addon">Foo</label>
                        <div class="input-group">
                            <span class="input-group-addon">{{ valuta }}</span>
                            <input class="form-control" type="text" pattern="^(?:((?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,\\d{2})?)|((?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{2})?))$" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">
                        </div>
                    </div>

                    {{#  test_group.foo == 4 }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar" class="label-addon">Bar<span class="required">*</span></label>
                        <div class="input-group">
                            <span class="input-group-addon">{{ valuta }}</span>
                            <input class="form-control" type="text" pattern="^(?:((?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,\\d{2})?)|((?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{2})?))$" name="test_group.bar" value="{{ test_group.bar }}" required="required" validation=".bar % 2 === 0" min="2" max="8" id="field:test_group.bar">
                        </div>
                        <span class="help" rel="tooltip" data-html="true" data-title="Number should be between 2 and 8, and be even"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 4 }}
                </form>
            <div class="wizards-actions">

            </div>
            </div>`;

        expect(form).toMatchHtml(expected);
    });

    it("will build form with date fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#date",
                        "label" : "Foo",
                        "name" : "foo",
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#date",
                        "label" : "Bar",
                        "name" : "bar",
                        "today" : "today",
                        "required" : "required",
                        "helptext" : "Date should be set to day after 'Foo'",
                        "conditions" : ".foo == '05-12-2017'",
                        "validation" : ".bar == '06-12-2017'",
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

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

                    {{#  test_group.foo == '05-12-2017' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <div class="input-group" data-picker="date" >
                            <input class="form-control" type="text" data-mask="99-99-9999" name="test_group.bar" today="today" required="required" validation=".bar == '06-12-2017'" value="{{ test_group.bar }}">
                            <span class="input-group-addon">
                                <span class="fa fa-calendar"></span>
                            </span>
                        </div>
                        <span class="help" rel="tooltip" data-html="true" data-title="Date should be set to day after 'Foo'"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == '05-12-2017' }}

                </form>
                <div class="wizards-actions">
            </div>
        `);
    });

    it("will build form with email fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#email",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#email",
                        "label": "Bar",
                        "name": "bar",
                        "required" : "required",
                        "helptext" : "Email should have at least 11 symbols",
                        "conditions" : ".foo == 'test@gmail.com'",
                        "validation" : ".bar.length > 10",
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <input class="form-control" type="email" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}">
                    </div>

                    {{#  test_group.foo == 'test@gmail.com' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <input class="form-control" type="email" name="test_group.bar" required="required" validation=".bar.length > 10" id="field:test_group.bar" value="{{ test_group.bar }}">
                        <span class="help" rel="tooltip" data-html="true" data-title="Email should have at least 11 symbols"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 'test@gmail.com' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with textarea fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#textarea",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#textarea",
                        "label": "Bar",
                        "name": "bar",
                        "required" : "required",
                        "helptext" : "Text should have maximum 100 symbols",
                        "conditions" : ".foo == 'test'",
                        "validation" : ".bar.length <= 100",
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <textarea class="form-control" rows="3" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}"></textarea>
                    </div>

                    {{#  test_group.foo == 'test' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <textarea class="form-control" rows="3" name="test_group.bar" required="required" validation=".bar.length <= 100" id="field:test_group.bar" value="{{ test_group.bar }}"></textarea>
                        <span class="help" rel="tooltip" data-html="true" data-title="Text should have maximum 100 symbols"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 'test' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with select fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "label" : "Foo",
                        "name" : "foo",
                        "url" : "",
                        "options" : [
                            {
                                "value" : "1",
                                "label" : "one"
                            },
                            {
                                "value" : "2",
                                "label" : "two",
                                "condition" : ".other == 'test'"
                            },
                            {
                                "value" : "3",
                                "label" : "three"
                            }
                        ]
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "label" : "Foo required",
                        "name" : "foo_required",
                        "url" : "",
                        "required" : "required",
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
                                "label" : "three",
                                "condition" : ".other == '10'"
                            }
                        ]
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_select",
                        "label" : "Bar",
                        "name" : "bar",
                        "url" : "http://jsonplaceholder.typicode.com/posts",
                        "optionValue" : "id",
                        "optionText" : "title",
                        "helptext" : "Enter post name",
                        "conditions" : ".foo == '1'",
                        "validation" : ".bar === 'test'",
                        "required" : "required",
                        "headerName" : [
                            "Header1",
                            "Header2",
                            "Header3"
                        ],
                        "headerValue" : [
                            "Value1",
                            "Value2",
                            "Value3"
                        ]
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <select class="form-control" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}" >
                            <option class="dropdown-item" value="">&nbsp;</option>
                            <option class="dropdown-item" value="1">one</option>
                            {{#  test_group.other == 'test' }}
                            <option class="dropdown-item" value="2">two</option>
                            {{/  test_group.other == 'test' }}
                            <option class="dropdown-item" value="3">three</option>
                        </select>
                    </div>

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo_required">Foo required <span class="required">*</span></label>
                        <select class="form-control" name="test_group.foo_required" id="field:test_group.foo_required" value="{{ test_group.foo_required }}" required="required">
                            <option class="dropdown-item" value="" disabled>&nbsp;</option>
                            <option class="dropdown-item" value="1">one</option>
                            <option class="dropdown-item" value="2">two</option>
                            {{#  test_group.other == '10' }}
                            <option class="dropdown-item" value="3">three</option>
                            {{/  test_group.other == '10' }}
                        </select>
                    </div>

                    {{#  test_group.foo == '1' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <input class="form-control" type="text" name="test_group.bar" url="http://jsonplaceholder.typicode.com/posts" external_source="true" validation=".bar === 'test'" required="required" headerName="Header1,Header2,Header3" headerValue="Value1,Value2,Value3" id="field:test_group.bar" value="{{ test_group.bar }}" value_field="id" label_field="title">
                        <span class="help" rel="tooltip" data-html="true" data-title="Enter post name"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == '1' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with select fields with jmespath", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_select",
                        "label" : "Quote",
                        "name" : "quote",
                        "url" : "http://jsonplaceholder.typicode.com/posts/1",
                        "optionValue" : "id",
                        "optionText" : "value",
                        "helptext" : "",
                        "conditions" : "",
                        "jmespath" : "[{id: 'title', value: title}, {id: 'body', value: body}]",
                        "validation" : ""
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.quote">Quote</label>
                        <input class="form-control" type="text" name="test_group.quote" url="http://jsonplaceholder.typicode.com/posts/1" external_source="true" jmespath="[{id: 'title', value: title}, {id: 'body', value: body}]" id="field:test_group.quote" value="{{ test_group.quote }}" value_field="id" label_field="value">
                    </div>
                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with option group fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group",
                        "label" : "Foo",
                        "name" : "foo",
                        "options" : [
                            {
                                "value" : "1",
                                "label" : "one"
                            },
                            {
                                "value" : "2",
                                "label" : "two",
                                "condition" : ".other == 'test'"
                            },
                            {
                                "value" : "3",
                                "label" : "three",
                                "condition" : ".other == '10'"
                            }
                        ]
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group",
                        "label" : "Bar",
                        "name" : "bar",
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
                        ],
                        "required" : "required",
                        "helptext" : "Value should be less than 3",
                        "conditions" : ".foo == '1'",
                        "validation" : ".bar < 3"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <div class="option"><label><input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="1" /> one</label></div>
                        {{#  test_group.other == 'test' }}
                        <div class="option"><label><input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="2" /> two</label></div>
                        {{/  test_group.other == 'test' }}
{{#  test_group.other == '10' }}
                        <div class="option"><label><input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="3" /> three</label></div>
                        {{/  test_group.other == '10' }}
                    </div>

                    {{#  test_group.foo == '1' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <div class="option"><label><input data-id="test_group.bar" required="required" validation=".bar < 3" type="radio" name="{{ test_group.bar }}" value="1" /> one</label></div>
                        <div class="option"><label><input data-id="test_group.bar" required="required" validation=".bar < 3" type="radio" name="{{ test_group.bar }}" value="2" /> two</label></div>
                        <div class="option"><label><input data-id="test_group.bar" required="required" validation=".bar < 3" type="radio" name="{{ test_group.bar }}" value="3" /> three</label></div>
                        <span class="help" rel="tooltip" data-html="true" data-title="Value should be less than 3"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == '1' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with multiple option group fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group",
                        "label" : "Foo",
                        "name" : "foo",
                        "multiple" : "multiple",
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
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group",
                        "label" : "Bar",
                        "name" : "bar",
                        "multiple" : "multiple",
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
                        ],
                        "required" : "required",
                        "helptext" : "Value should be less than 3",
                        "conditions" : ".foo == '1'",
                        "validation" : ".bar.length < 3"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <div class="option"><label><input data-id="test_group.foo" multiple="multiple" type="checkbox" name="{{ test_group.foo }}" value="1" /> one</label></div>
                        <div class="option"><label><input data-id="test_group.foo" multiple="multiple" type="checkbox" name="{{ test_group.foo }}" value="2" /> two</label></div>
                        <div class="option"><label><input data-id="test_group.foo" multiple="multiple" type="checkbox" name="{{ test_group.foo }}" value="3" /> three</label></div>
                    </div>

                    {{#  test_group.foo == '1' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <div class="option"><label><input data-id="test_group.bar" multiple="multiple" required="required" validation=".bar.length < 3" type="checkbox" name="{{ test_group.bar }}" value="1" /> one</label></div>
                        <div class="option"><label><input data-id="test_group.bar" multiple="multiple" required="required" validation=".bar.length < 3" type="checkbox" name="{{ test_group.bar }}" value="2" /> two</label></div>
                        <div class="option"><label><input data-id="test_group.bar" multiple="multiple" required="required" validation=".bar.length < 3" type="checkbox" name="{{ test_group.bar }}" value="3" /> three</label></div>
                        <span class="help" rel="tooltip" data-html="true" data-title="Value should be less than 3"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == '1' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with checkbox fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
                        "label" : "Foo",
                        "name" : "foo",
                        "text" : "Yes or no"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
                        "label" : "Neither or either",
                        "name" : "neither",
                        "required" : "required"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
                        "label" : "Bar",
                        "name" : "bar",
                        "text" : "Yes or no",
                        "required" : "required",
                        "helptext" : "This value is required",
                        "conditions" : ".foo == 'on'",
                        "validation" : ".bar == 'on'"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);
        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <div class="option">
                            <label>
                                <input data-id="test_group.foo" type="checkbox" checked="{{ test_group.foo }}" /> Yes or no
                            </label>
                        </div>
                    </div>

                    <div class="form-group" data-role="wrapper">
                        <div class="option">
                            <label>
                                <input data-id="test_group.neither" required="required" type="checkbox" checked="{{ test_group.neither }}" /> Neither or either <span class="required">*</span>
                            </label>
                        </div>
                    </div>

                    {{#  test_group.foo == 'on' }}
                    <div class="form-group" data-role="wrapper">
                        <div class="option">
                            <label><input data-id="test_group.bar" required="required" validation=".bar == 'on'" type="checkbox" checked="{{ test_group.bar }}" /> Yes or no <span class="required">*</span></label>
                        </div>
                        <span class="help" rel="tooltip" data-html="true" data-title="This value is required"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 'on' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with likert fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#likert",
                        "label" : "Foo",
                        "name" : "foo",
                        "keys" : [
                            "Do you like green?",
                            "Do you like blue?",
                            "Do you like red?"
                        ],
                        "options" : [
                            {"label" : "Dislike it", "value" : "dislike it"},
                            {"label" : "Neutral", "value" : "neutral"},
                            {"label" : "Like it", "value" : "like it"}
                        ]
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#likert",
                        "label" : "Bar",
                        "name" : "bar",
                        "keys" : [
                            "Do you like green?",
                            "Do you like blue?",
                            "Do you like red?"
                        ],
                        "options" : [
                            {"label" : "Dislike it", "value" : "dislike it"},
                            {"label" : "Neutral", "value" : "neutral"},
                            {"label" : "Like it", "value" : "like it"}
                        ],
                        "required" : "required",
                        "helptext" : "This value is required",
                        "conditions" : ".foo == 'Neutral'"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <table class="likert" data-id="test_group.foo">
                            <tr>
                                <td></td>
                                <td><div class="likert-option">Dislike it</div></td>
                                <td><div class="likert-option">Neutral</div></td>
                                <td><div class="likert-option">Like it</div></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like green?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like blue?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like red?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="like it" /></td>
                            </tr>
                        </table>
                    </div>

                    {{#  test_group.foo == 'Neutral' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <table class="likert" data-id="test_group.bar">
                            <tr>
                                <td></td>
                                <td><div class="likert-option">Dislike it</div></td>
                                <td><div class="likert-option">Neutral</div></td>
                                <td><div class="likert-option">Like it</div></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like green?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[0]}}" value="dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[0]}}" value="neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[0]}}" value="like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like blue?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[1]}}" value="dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[1]}}" value="neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[1]}}" value="like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like red?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[2]}}" value="dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[2]}}" value="neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[2]}}" value="like it" /></td>
                            </tr>
                        </table>
                        <span class="help" rel="tooltip" data-html="true" data-title="This value is required"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 'Neutral' }}

                </form>
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with static field", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#static",
                        "name": "bar",
                        "content": "<p>Foo text: {{ test_group.foo }}</p>",
                        "conditions": ".foo === 'test'"
                    }
                ]
            }
        ];

        var form = legalForm.build(definition);

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
                <div class="wizards-actions">
                </div>
            </div>
        `);
    });

    it("will build form with multiple steps", function() {
        var definition = [
            {
                "label" : "First step",
                "group" : "first_step",
                "fields" : [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Text",
                        "name" : "text",
                        "default" : "Default text"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#password",
                        "label" : "Password",
                        "name" : "password"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Number",
                        "name" : "number",
                        "default" : "2",
                        "decimals" : "0",
                        "required" : "required",
                        "helptext" : "Number should be between 2 and 8, and be even",
                        "conditions" : ".text == 'test'",
                        "min" : "2",
                        "max" : "8"
                    }
                ]
            },
            {
                "label" : "Second step",
                "group" : "second_step",
                "fields" : [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#amount",
                        "label" : "Number with unit",
                        "name" : "number_with_unit",
                        "default" : "",
                        "options" : [
                            {"singular" : "unit", "plural" : "units"},
                            {"singular" : "alpha", "plural" : "alphas"},
                            {"singular" : "beta", "plural" : "betas"}
                        ],
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#money",
                        "label" : "Amount",
                        "name" : "amount",
                        "default" : "5",
                        "conditions" : "first_step.number == 4",
                        "min" : "2",
                        "max" : "8"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#date",
                        "label" : "Date",
                        "name" : "date"
                    }
                ]
            },
            {
                "label" : "Third step",
                "group" : "third_step",
                "conditions" : "second_step.amount == 8",
                "fields" : [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#email",
                        "label" : "E-mail",
                        "name" : "email",
                        "default" : "test@gmail.com"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#textarea",
                        "label" : "Text area",
                        "name" : "textarea"
                    },
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "label" : "Select",
                        "name" : "select",
                        "url" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : "",
                        "options" : [
                            {
                                "value" : "1",
                                "label" : "one",
                                "condition" : ".other == 'foo'"
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

        var form = legalForm.build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <h3>First step</h3>
                <form class="form navmenu-form">
                    <div class="form-group" data-role="wrapper">
                        <label for="field:first_step.text">Text</label>
                        <input class="form-control" type="text" name="first_step.text" value="{{ first_step.text }}" id="field:first_step.text">
                    </div>
                    <div class="form-group" data-role="wrapper">
                        <label for="field:first_step.password">Password</label>
                        <input class="form-control" type="password" name="first_step.password" id="field:first_step.password" value="{{ first_step.password }}">
                    </div>
                    {{#  first_step.text == 'test' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:first_step.number">Number <span class="required">*</span></label>
                        <input class="form-control" type="text" name="first_step.number" value="{{ first_step.number }}" decimals="0" required="required" min="2" max="8" id="field:first_step.number" pattern="\\d+">
                        <span class="help" rel="tooltip" data-html="true" data-title="Number should be between 2 and 8, and be even"><strong>?</strong></span>
                    </div>
                    {{/  first_step.text == 'test' }}
                </form>
                <div class="wizards-actions">
                </div>
            </div>
            <div class="wizard-step">
                <h3>Second step</h3>
                <form class="form navmenu-form">
                    <div class="form-group" data-role="wrapper">
                        <label for="field:second_step.number_with_unit">Number with unit</label>
                        <div class="input-group">
                            <input class="form-control" name="second_step.number_with_unit.amount" value="{{ second_step.number_with_unit.amount }}" type="text" pattern="\\d+">
                            <div class="input-group-btn">
                                <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">{{ second_step.number_with_unit.unit }} </button>
                                <ul class="dropdown-menu pull-right dropdown-select" data-name="second_step.number_with_unit.unit" role="menu">
                                    {{# second_step.number_with_unit.amount == 1 ? meta.second_step.number_with_unit.singular : meta.second_step.number_with_unit.plural }}
                                    <li><a>{{ . }}</a></li>{{/ meta }}
                                </ul>
                            </div>
                        </div>
                    </div>
                    {{#  first_step.number == 4 }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:second_step.amount" class="label-addon">Amount</label>
                        <div class="input-group"><span class="input-group-addon">{{ valuta }}</span>
                            <input class="form-control" type="text" pattern="^(?:((?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,\\d{2})?)|((?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{2})?))$" name="second_step.amount" value="{{ second_step.amount }}" min="2" max="8" id="field:second_step.amount">
                        </div>
                    </div>
                    {{/  first_step.number == 4 }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:second_step.date">Date</label>
                        <div class="input-group" data-picker="date">
                            <input class="form-control" type="text" data-mask="99-99-9999" name="second_step.date" value="{{ second_step.date }}"><span class="input-group-addon"><span class="fa fa-calendar"></span></span>
                        </div>
                    </div>
                </form>
                <div class="wizards-actions">
                </div>
            </div>
            {{# second_step.amount == 8 }}
            <div class="wizard-step">
                <h3>Third step</h3>
                <form class="form navmenu-form">
                    <div class="form-group" data-role="wrapper">
                        <label for="field:third_step.email">E-mail</label>
                        <input class="form-control" type="email" name="third_step.email" value="{{ third_step.email }}" id="field:third_step.email">
                    </div>
                    <div class="form-group" data-role="wrapper">
                        <label for="field:third_step.textarea">Text area</label>
                        <textarea class="form-control" rows="3" name="third_step.textarea" id="field:third_step.textarea" value="{{ third_step.textarea }}"></textarea>
                    </div>
                    <div class="form-group" data-role="wrapper">
                        <label for="field:third_step.select">Select</label>
                        <select class="form-control" name="third_step.select" id="field:third_step.select" value="{{ third_step.select }}">
                            <option class="dropdown-item" value="">&nbsp;</option>
                            {{#  third_step.other == 'foo' }}
                            <option class="dropdown-item" value="1">one</option>
                            {{/  third_step.other == 'foo' }}
                            <option class="dropdown-item" value="2">two</option>
                            <option class="dropdown-item" value="3">three</option>
                        </select>
                    </div>
                </form>
                <div class="wizards-actions">
                </div>
            </div>
            {{/ second_step.amount == 8 }}
        `);
    });
});
