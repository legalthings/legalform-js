'use strict';

describe("check FormModel methods for live-contract model", function() {
    var jQuery;
    var FormModel = require('../js/model/form-model');

    beforeAll(function(done) {
        require("jsdom").env("", function(err, window) {
            if (err) {
                return;
            }

            jQuery = require("jquery")(window);
            done();
        });
    });

    it("should use live contract model", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "some-shema"
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        expect(model.type).toEqual('live_contract_form');
    });

    it("should use live contract model for step definition", function() {
        var definition = {
            "$schema": "some-shema"
        };

        var model = (new FormModel(definition)).getModel();
        expect(model.type).toEqual('live_contract_form');
    });

    it("should correctly get step anchor", function() {
        var definition = [
            {
                "anchor" : "12"
            },
            {
                "anchor" : "34",
                "fields" : [
                    {
                        "$schema": "some-shema"
                    }
                ]
            },
            {

            }
        ];

        var model = (new FormModel(definition)).getModel();

        expect(model.getStepAnchor(definition[0])).toEqual('12');
        expect(model.getStepAnchor(definition[1])).toEqual('34');
        expect(model.getStepAnchor(definition[2])).toEqual(undefined);
    });

    it("should correctly get field type", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text"
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getFieldType(field)).toEqual('text');
    });

    it("should correctly get field type, if returned type differs from given in schema", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group"
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getFieldType(field)).toEqual('group');
    });

    it("should correctly get amount units", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "some-schema",
                        "options" : [
                            {"singular" : "test_singular1", "plural" : "test_plural1"},
                            {"singular" : "test_singular2", "plural" : "test_plural2"}
                        ]
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getAmountUnits(field)).toEqual([
            {"singular" : "test_singular1", "plural" : "test_plural1"},
            {"singular" : "test_singular2", "plural" : "test_plural2"}
        ]);
    });

    it("should correctly get amount units in splitted form", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "some-schema",
                        "options" : [
                            {"singular" : "test_singular1", "plural" : "test_plural1"},
                            {"singular" : "test_singular2", "plural" : "test_plural2"}
                        ]
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getAmountUnits(field, true)).toEqual({
            "singular" : ["test_singular1", "test_singular2"],
            "plural" : ["test_plural1", "test_plural2"]
        });
    });

    it("should correctly get list options", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "some-schema",
                        "options" : [
                            {"label" : "test_name1", "value" : "test_value1"},
                            {"label" : "test_name2", "value" : "test_value2"}
                        ]
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getListOptions(field)).toEqual([
            {"label" : "test_name1", "value" : "test_value1"},
            {"label" : "test_name2", "value" : "test_value2"}
        ]);
    });

    it("should correctly get likert questions and answers", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "some-schema",
                        "keys" : [
                            "first question",
                            "second question",
                            "third question",
                        ],
                        "options" : [
                            {"label" : "First answer", "value" : "first_answer"},
                            {"label" : "Second answer", "value" : "second_answer"},
                            {"label" : "Third answer", "value" : "third_answer"}
                        ]
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getLikertData(field)).toEqual({
            "keys" : [
                "first question",
                "second question",
                "third question",
            ],
            "options" : [
                {"label" : "First answer", "value" : "first_answer"},
                {"label" : "Second answer", "value" : "second_answer"},
                {"label" : "Third answer", "value" : "third_answer"}
            ]
        });
    });

    it("should correctly change field type", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select"
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        model.changeFieldType(field, 'text');

        expect(field.$schema).toEqual("http://specs.livecontracts.io/draft-01/04-form/schema.json#text");
        expect(model.getFieldType(field)).toEqual("text");
    });

    it("should correctly get field value", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "some-schema",
                        "default" : "some-value"
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getFieldValue(field)).toEqual("some-value");
    });

    it("should show that checkbox is not set to 'checked' by default", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "some-schema",
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.isCheckboxFieldChecked(field)).toEqual(false);
    });

    it("should show that checkbox is not set to 'checked'", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "some-schema",
                        "checked" : false
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.isCheckboxFieldChecked(field)).toEqual(false);
    });

    it("should show that checkbox is set to 'checked'", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "some-schema",
                        "checked" : true
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.isCheckboxFieldChecked(field)).toEqual(true);
    });

    it("should get empty date limits for date field", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "some-schema",
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getDateLimits(field)).toEqual({});
    });
});
