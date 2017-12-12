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

    it("will build form with text fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type": "text",
                        "label":"Foo",
                        "name":"foo"
                    },
                    {
                        "type" : "text",
                        "label" : "Bar",
                        "name" : "bar",
                        "value" : "Default value",
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
                        "type": "password",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "type" : "password",
                        "label" : "Bar",
                        "name" : "bar",
                        "value" : "Default value",
                        "required" : "required",
                        "helptext" : "Password should contain digits and letters, at least 10 symbols",
                        "conditions" : ".foo === 'test'",
                        "pattern" : "[\\d\\w]*",
                        "validation" : ".bar.length >= 10"
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
                        "type": "number",
                        "label": "Foo",
                        "name": "foo",
                    },
                    {
                        "type" : "number",
                        "label" : "Bar",
                        "name" : "bar",
                        "value" : "2",
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

        var form = new LegalForm(jQuery).build(definition);

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
                        "type" : "amount",
                        "label" : "Foo",
                        "name" : "foo",
                        "optionValue" : [
                            "unit"
                        ],
                        "optionText" : [
                            "units"
                        ]
                    },
                    {
                        "type" : "amount",
                        "label" : "Bar",
                        "name" : "bar",
                        "optionValue" : [
                            "unit"
                        ],
                        "optionText" : [
                            "units"
                        ],
                        "value" : "2",
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
                    },
                    {
                        "type" : "amount",
                        "label" : "Bar",
                        "name" : "bar",
                        "optionValue" : [
                            "unit",
                            "alpha",
                            "beta"
                        ],
                        "optionText" : [
                            "units",
                            "alphas",
                            "betas"
                        ],
                        "value" : "2",
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

        var form = new LegalForm(jQuery).build(definition);

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
                        "type" : "money",
                        "label" : "Foo",
                        "name" : "foo",
                    },
                    {
                        "type" : "money",
                        "label" : "Bar",
                        "name" : "bar",
                        "value" : "2",
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

                    {{#  test_group.foo == 4 }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <div class="input-group">
                            <span class="input-group-addon">{{ valuta }}</span>
                            <input class="form-control" type="text" pattern="\\d+(,\\d\\d)?" name="test_group.bar" value="{{ test_group.bar }}" required="required" validation=".bar % 2 === 0" min="2" max="8" id="field:test_group.bar">
                        </div>
                        <span class="help" rel="tooltip" data-html="true" data-title="Number should be between 2 and 8, and be even"><strong>?</strong></span>
                    </div>
                    {{/  test_group.foo == 4 }}

                </form>
                <div class="wizards-actions">
            </div>
        `);
    });

    it("will build form with date fields", function() {
        var definition = [
            {
                "group": "test_group",
                "fields": [
                    {
                        "type" : "date",
                        "label" : "Foo",
                        "name" : "foo",
                    },
                    {
                        "type" : "date",
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
                        "type": "email",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "type": "email",
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

        var form = new LegalForm(jQuery).build(definition);

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
                        "type": "textarea",
                        "label": "Foo",
                        "name": "foo"
                    },
                    {
                        "type": "textarea",
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

        var form = new LegalForm(jQuery).build(definition);

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
                    },
                    {
                        "type" : "select",
                        "label" : "Foo required",
                        "name" : "foo_required",
                        "url" : "",
                        "required" : "required",
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
                    },
                    {
                        "type" : "select",
                        "label" : "Bar",
                        "name" : "bar",
                        "url" : "http://jsonplaceholder.typicode.com/posts",
                        "optionValue" : "id",
                        "optionText" : "title",
                        "helptext" : "Enter post name",
                        "conditions" : ".foo == '1'",
                        "external_source" : "true",
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

        var form = new LegalForm(jQuery).build(definition);

        expect(form).toMatchHtml(`
            <div class="wizard-step">
                <form class="form navmenu-form">

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo">Foo</label>
                        <select class="form-control" name="test_group.foo" id="field:test_group.foo" value="{{ test_group.foo }}" >
                            <option class="dropdown-item" value="">&nbsp;</option>
                            <option class="dropdown-item" value="1">one</option>
                            <option class="dropdown-item" value="2">two</option>
                            <option class="dropdown-item" value="3">three</option>
                        </select>
                    </div>

                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.foo_required">Foo required <span class="required">*</span></label>
                        <select class="form-control" name="test_group.foo_required" id="field:test_group.foo_required" value="{{ test_group.foo_required }}" required="required">
                            <option class="dropdown-item" value="" disabled>&nbsp;</option>
                            <option class="dropdown-item" value="1">one</option>
                            <option class="dropdown-item" value="2">two</option>
                            <option class="dropdown-item" value="3">three</option>
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
                        "type" : "select",
                        "label" : "Quote",
                        "name" : "quote",
                        "url" : "http://jsonplaceholder.typicode.com/posts/1",
                        "optionValue" : "id",
                        "optionText" : "value",
                        "helptext" : "",
                        "conditions" : "",
                        "external_source" : "true",
                        "jmespath" : "[{id: 'title', value: title}, {id: 'body', value: body}]",
                        "validation" : ""
                    }
                ]
            }
        ];

        var form = new LegalForm(jQuery).build(definition);

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
                    },
                    {
                        "type" : "group",
                        "label" : "Bar",
                        "name" : "bar",
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
                        "required" : "required",
                        "helptext" : "Value should be less than 3",
                        "conditions" : ".foo == '1'",
                        "validation" : ".bar < 3"
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
                        <div class="option"><label><input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="1" /> one</label></div>
                        <div class="option"><label><input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="2" /> two</label></div>
                        <div class="option"><label><input data-id="test_group.foo" type="radio" name="{{ test_group.foo }}" value="3" /> three</label></div>
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
                    },
                    {
                        "type" : "group",
                        "label" : "Bar",
                        "name" : "bar",
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
                        ],
                        "required" : "required",
                        "helptext" : "Value should be less than 3",
                        "conditions" : ".foo == '1'",
                        "validation" : ".bar.length < 3"
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
                        "type" : "checkbox",
                        "label" : "Foo",
                        "name" : "foo",
                        "text" : "Yes or no"
                    },
                    {
                        "type" : "checkbox",
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

                    {{#  test_group.foo == 'on' }}
                    <div class="form-group" data-role="wrapper">
                        <label for="field:test_group.bar">Bar <span class="required">*</span></label>
                        <div class="option">
                            <label><input data-id="test_group.bar" required="required" validation=".bar == 'on'" type="checkbox" checked="{{ test_group.bar }}" /> Yes or no</label>
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
                        "type" : "likert",
                        "label" : "Foo",
                        "name" : "foo",
                        "keys" : "Do you like green?\r\nDo you like blue?\r\nDo you like red?",
                        "values" : "Dislike it\r\nNeutral\r\nLike it"
                    },
                    {
                        "type" : "likert",
                        "label" : "Bar",
                        "name" : "bar",
                        "keys" : "Do you like green?\r\nDo you like blue?\r\nDo you like red?",
                        "values" : "Dislike it\r\nNeutral\r\nLike it",
                        "required" : "required",
                        "helptext" : "This value is required",
                        "conditions" : ".foo == 'Neutral'"
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
                                <td><div class="likert-option">Dislike it</div></td>
                                <td><div class="likert-option">Neutral</div></td>
                                <td><div class="likert-option">Like it</div></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like green?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[0]}}" value="Like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like blue?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[1]}}" value="Like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like red?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.foo[2]}}" value="Like it" /></td>
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
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[0]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[0]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[0]}}" value="Like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like blue?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[1]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[1]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[1]}}" value="Like it" /></td>
                            </tr>
                            <tr>
                                <td><div class="likert-question">Do you like red?</div></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[2]}}" value="Dislike it" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[2]}}" value="Neutral" /></td>
                                <td class="likert-answer"><input type="radio" name="{{test_group.bar[2]}}" value="Like it" /></td>
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
                        "type" : "text",
                        "label" : "Text",
                        "name" : "text",
                        "value" : "Default text"
                    },
                    {
                        "type" : "password",
                        "label" : "Password",
                        "name" : "password"
                    },
                    {
                        "type" : "number",
                        "label" : "Number",
                        "name" : "number",
                        "value" : "2",
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
                        "type" : "amount",
                        "label" : "Number with unit",
                        "name" : "number_with_unit",
                        "value" : "",
                        "optionValue" : [
                            "unit",
                            "alpha",
                            "teta"
                        ],
                        "optionText" : [
                            "units",
                            "alphas",
                            "tetas"
                        ]
                    },
                    {
                        "type" : "money",
                        "label" : "Amount",
                        "name" : "amount",
                        "value" : "5",
                        "conditions" : "first_step.number == 4",
                        "min" : "2",
                        "max" : "8"
                    },
                    {
                        "type" : "date",
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
                        "type" : "email",
                        "label" : "E-mail",
                        "name" : "email",
                        "value" : "test@gmail.com"
                    },
                    {
                        "type" : "textarea",
                        "label" : "Text area",
                        "name" : "textarea"
                    },
                    {
                        "type" : "select",
                        "label" : "Select",
                        "name" : "select",
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
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : "",
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
                        <label for="field:second_step.amount">Amount</label>
                        <div class="input-group"><span class="input-group-addon">{{ valuta }}</span>
                            <input class="form-control" type="text" pattern="\\d+(,\\d\\d)?" name="second_step.amount" value="{{ second_step.amount }}" min="2" max="8" id="field:second_step.amount">
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
                            <option class="dropdown-item" value="1">one</option>
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
