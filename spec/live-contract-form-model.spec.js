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
                            {"name" : "test_name1", "value" : "test_value1"},
                            {"name" : "test_name2", "value" : "test_value2"}
                        ]
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getListOptions(field)).toEqual([
            {"name" : "test_name1", "value" : "test_value1"},
            {"name" : "test_name2", "value" : "test_value2"}
        ]);
    });

    it("should correctly get list selected values", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema": "some-schema",
                        "options_selected" : [
                            "test_value1",
                            "test_value2"
                        ]
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getListSelectedValues(field)).toEqual([
            "test_value1",
            "test_value2"
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
                        "values" : [
                            "first answer",
                            "second answer",
                            "third answer",
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
            "values" : [
                "first answer",
                "second answer",
                "third answer",
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

    it("should correctly get field simple value", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "some-schema",
                        "value" : "some-value"
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getFieldValue(field)).toEqual("some-value");
    });

    it("should correctly get field list value", function() {
        var definition = [
            {
                "fields" : [
                    {
                        "$schema" : "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "options_selected" : [
                            "test_value1",
                            "test_value2"
                        ]
                    }
                ]
            }
        ];

        var model = (new FormModel(definition)).getModel();
        var field = definition[0]['fields'][0];

        expect(model.getFieldValue(field)).toEqual([
            "test_value1",
            "test_value2"
        ]);
    });
});
