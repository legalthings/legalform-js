'use strict';

var util = require('util');

describe("calculating LegalForm options", function() {
    var jQuery;
    var LegalForm = require('../js/legalform');

    beforeAll(function(done) {
        require("jsdom").env("", function(err, window) {
            if (err) {
                return;
            }

            jQuery = require("jquery")(window);
            done();
        });
    });

    it("will produce empty options for empty fields", function() {
        var definition = [
            {
                "fields": []
            }
        ];

        var options = new LegalForm(jQuery).calc(definition);
        expect(options).toEqual({
            defaults: {},
            computed: {},
            meta: {}
        });
    });

    it("will produce only meta", function() {
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

        var options = new LegalForm(jQuery).calc(definition);
        expect(options).toEqual({
            defaults: {},
            computed: {},
            meta: {
                foo: {type: 'text'}
            }
        });
    });

    it("will correctly handle common case", function() {
        var definition = [
            {
                "label" : "First step",
                "group" : "first",
                "conditions" : "",
                "fields" : [
                    {
                        "type" : "text",
                        "label" : "Text",
                        "name" : "text",
                        "value" : "Default text",
                        "conditions" : ""
                    },
                    {
                        "type" : "text",
                        "label" : "More text",
                        "name" : "more_text",
                        "value" : "'Default text with value ' + {{ some_value }} + ' continue text ' + {{ another_value }} + {{ .scoped_value }} + {{ group.value }}",
                        "conditions" : ""
                    },
                    {
                        "type" : "password",
                        "label" : "Password",
                        "name" : "password",
                        "conditions" : ""
                    },
                    {
                        "type" : "number",
                        "label" : "Number",
                        "name" : "number",
                        "value" : "10",
                        "conditions" : "first.text === 'test'"
                    },
                    {
                        "type" : "amount",
                        "label" : "Number with unit",
                        "name" : "number_with_unit",
                        "value" : "",
                        "optionValue" : [
                            "unit"
                        ],
                        "optionText" : [
                            "units"
                        ],
                        "conditions" : ""
                    },
                    {
                        "type" : "money",
                        "label" : "Amount",
                        "name" : "amount",
                        "value" : "",
                        "conditions" : ""
                    },
                    {
                        "type" : "expression",
                        "name" : "expression",
                        "expression" : ".text + \" \" + .number"
                    }
                ]
            },
            {
                "label" : "Second step",
                "group" : "second",
                "conditions" : "first.text === 'test'",
                "fields" : [
                    {
                        "type" : "date",
                        "label" : "Date",
                        "name" : "date",
                        "conditions" : "",
                        "max_date": "25-10-2018",
                        "min_date": null
                    },
                    {
                        "type" : "email",
                        "label" : "E-mail",
                        "name" : "email",
                        "value" : "test@gmail.com",
                        "conditions" : ".data === '2017-12-08'"
                    },
                    {
                        "type" : "textarea",
                        "label" : "Text area",
                        "name" : "textarea",
                        "conditions" : "",
                        "validation" : "second.textarea === 'test'"
                    },
                    {
                        "type" : "select",
                        "label" : "Select",
                        "name" : "select",
                        "value" : "2",
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
                        "conditions" : "",
                        "validation" : "",
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
            },
            {
                "label" : "Third step",
                "group" : "third",
                "conditions" : "",
                "repeater" : "first.number + 1",
                "fields" : [
                    {
                        "type" : "group",
                        "label" : "Option group",
                        "name" : "option_group",
                        "value" : "3",
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
                        "conditions" : ""
                    },
                    {
                        "type" : "checkbox",
                        "label" : "Checkbox",
                        "name" : "checkbox",
                        "text" : "Yes or no",
                        "validation": "third.checkbox === 'on'"
                    },
                    {
                        "type" : "likert",
                        "label" : "Likert",
                        "name" : "likert",
                        "keys" : "Do you like green?\r\nDo you like blue?\r\nDo you like red?",
                        "values" : "Hate it\r\nDislike it\r\nNeutral\r\nLike it\r\nLove it",
                    },
                    {
                        "type" : "external_data",
                        "name" : "photo",
                        "url" : "https://jsonplaceholder.typicode.com/photos/{{ second.email }}",
                        "conditions" : "third.checkbox == \"on\"",
                        "headerName": "Test header",
                        "headerValue": "Test value",
                        "jmespath" : null
                    },
                    {
                        "type": "static",
                        "name": "static_data",
                        "content": "<p>{{ second.email }}<em>Some data</em></p>",
                        "conditions" : "third.checkbox == \"on\""
                    }
                ]
            }
        ];

        var expected = {
            defaults: {
                first: { text: 'Default text', number: '10', number_with_unit: { amount: '', unit: 'units' }, amount: '' },
                second: { email: 'test@gmail.com', select: '2' },
                third: [
                    { option_group: '3' }
                ]
            },
            computed: {
                'first.more_text-default': '\'Default text with value \' + ${some_value} + \' continue text \' + ${another_value} + ${first.scoped_value} + ${group.value}',
                'first.number-conditions': '( ${first.text} === \'test\')',
                'first.expression-expression': '${first.text} + " " + ${first.number}',
                'second.date-conditions': '( ${first.text} === \'test\')',
                'second.email-conditions': '( ${first.text} === \'test\') && ( ${second.data} === \'2017-12-08\')',
                'second.textarea-validation': ' ${second.textarea} === \'test\'',
                'second.textarea-conditions': '( ${first.text} === \'test\')',
                'second.select-conditions': '( ${first.text} === \'test\')',
                'third.checkbox-validation': ' ${third.checkbox} === \'on\'',
                'third.photo-url': '\'https://jsonplaceholder.typicode.com/photos/\' + ${second.email} + \'\'',
                'third.photo-conditions': '( ${third.checkbox} == "on")',
                'third.static_data-conditions': '( ${third.checkbox} == "on")',
                'third-repeater': '${first.number} + 1'
            },
            meta: {
                first: {
                    text: { type: 'text' },
                    more_text: { type: 'text'},
                    password: { type: 'password' },
                    number: { type: 'number', conditions_field: 'first.number-conditions' },
                    number_with_unit: { type: 'amount', singular: ['unit'], plural: ['units'] },
                    amount: { type: 'money' },
                    expression: { type: 'expression' }
                },
                second: {
                    date: { type: 'date', conditions_field: 'second.date-conditions', max_date: '25-10-2018', yearly: false, min_date: null },
                    email: { type: 'email', conditions_field: 'second.email-conditions' },
                    textarea: { type: 'textarea', conditions_field: 'second.textarea-conditions', validation: 'second.textarea === \'test\'' },
                    select: { type: 'select', conditions_field: 'second.select-conditions', validation: '' }
                },
                third: [
                    {
                        option_group: { type: 'group' },
                        checkbox: { type: 'checkbox', validation: 'third.checkbox === \'on\'' },
                        likert: { type: 'likert' },
                        photo: {
                            type: 'external_data',
                            conditions_field: 'third.photo-conditions',
                            url: 'https://jsonplaceholder.typicode.com/photos/{{ second.email }}',
                            conditions: 'third.checkbox == "on"',
                            url_field: 'third.photo-url',
                            headerName: 'Test header',
                            headerValue: 'Test value',
                            jmespath: null
                        },
                        static_data: {type: 'static', conditions_field: 'third.static_data-conditions' }
                    }
                ]
            }
        };

        var options = new LegalForm(jQuery).calc(definition);
        expect(options).toEqual(expected);
    });
});
