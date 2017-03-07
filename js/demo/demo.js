(function() {
    var legalform = {
        "definition": [
            {
                "fields": [
                    {
                        "type": "text",
                        "label": "Text",
                        "name": "text",
                        "value": "",
                        "pattern": "",
                        "mask": ""
                    },
                    {
                        "type": "number",
                        "label": "Number",
                        "name": "number",
                        "value": "",
                        "decimals": "0",
                        "min": "",
                        "max": ""
                    },
                    {
                        "type": "amount",
                        "label": "Number with unit",
                        "name": "number_with_unit",
                        "value": "",
                        "optionValue": ["unit"],
                        "optionText": ["units"],
                        "decimals": "0",
                        "min": "",
                        "max": ""
                    },
                    {
                        "type": "money",
                        "label": "Amount",
                        "name": "amount",
                        "value": "",
                        "min": "",
                        "max": ""
                    },
                    {
                        "type": "date",
                        "label": "Date",
                        "name": "date",
                    },
                    {
                        "type": "email",
                        "label": "E-mail",
                        "name": "email",
                        "value": "",
                    },
                    {
                        "type": "textarea",
                        "label": "Text area",
                        "name": "textarea",
                    },
                    {
                        "type": "select",
                        "label": "Select",
                        "name": "select",
                        "url": "",
                        "optionValue": [
                            "1",
                            "2",
                            "3"
                        ],
                        "optionText": [
                            "one",
                            "two",
                            "three"
                        ],
                        "optionSelected": [],
                        "options": [
                            {
                                "value": "1",
                                "label": "one"
                            },
                            {
                                "value": "2",
                                "label": "two"
                            },
                            {
                                "value": "3",
                                "label": "three"
                            }
                        ]
                    },
                    {
                        "type": "group",
                        "label": "Option group",
                        "name": "option_group",
                        "optionValue": [
                            "1",
                            "2",
                            "3"
                        ],
                        "optionText": [
                            "one",
                            "two",
                            "three"
                        ]
                    },
                    {
                        "type": "checkbox",
                        "label": "Checkbox",
                        "name": "checkbox",
                        "text": "Yes or no"
                    },
                    {
                        "type": "likert",
                        "label": "Likert",
                        "name": "likert",
                        "keys": "Do you like green?\r\nDo you like blue?\r\nDo you like red?",
                        "values": "Hate it\r\nDislike it\r\nNeutral\r\nLike it\r\nLove it"
                    }
                ],
                "label": "All field types",
                "group": "",
                "article": "",
                "helptip": ""
            },
            {
                "fields": [
                    {
                        "type": "text",
                        "label": "Required",
                        "name": "required",
                        "value": "",
                        "required": "required",
                        "pattern": "",
                        "mask": ""
                    },
                    {
                        "type": "text",
                        "label": "Pattern",
                        "name": "pattern",
                        "value": "",
                        "helptext": "Please enter a lower case letter followed by one or more digits",
                        "pattern": "[a-z]\\d+",
                        "mask": ""
                    },
                    {
                        "type": "text",
                        "label": "Mask",
                        "name": "mask",
                        "value": "",
                        "helptext": "4 digits, 2 letters",
                        "pattern": "",
                        "mask": "9999aa"
                    },
                    {
                        "type": "number",
                        "label": "Even",
                        "name": "even",
                        "value": "",
                        "helptext": "An even number",
                        "decimals": "0",
                        "min": "",
                        "max": "",
                        "validation": "{{ validation.even % 2 === 0 }}"
                    },
                    {
                        "type": "number",
                        "label": "Min/Max",
                        "name": "min_max",
                        "value": "",
                        "helptext": "Between 3 and 7",
                        "decimals": "0",
                        "min": "3",
                        "max": "7"
                    },
                    {
                        "type": "email",
                        "label": "E-mail",
                        "name": "email",
                        "value": ""
                    },
                    {
                        "type": "checkbox",
                        "label": "",
                        "name": "continue",
                        "text": "Please select this to continue",
                        "required": "required"
                    }
                ],
                "label": "Validation",
                "group": "validation",
                "article": "",
                "helptip": ""
            }
        ],
        "defaults": {
            "text": "",
            "number": "",
            "number_with_unit": {
                "amount": "",
                "unit": "units"
            },
            "amount": "",
            "email": "",
            "select": "1",
            "validation": {
                "required": "",
                "pattern": "",
                "mask": "",
                "even": "",
                "min_max": "",
                "email": ""
            }
        },
        "computed": {
            "validation.even-validation": "${validation.even} % 2 === 0"
        },
        "meta": {
            "text": {
                "type": "text"
            },
            "number": {
                "type": "number"
            },
            "number_with_unit": {
                "type": "amount",
                "singular": ["unit"],
                "plural": ["units"]
            },
            "amount": {
                "type": "money"
            },
            "date": {
                "type": "date"
            },
            "email": {
                "type": "email"
            },
            "textarea": {
                "type": "textarea"
            },
            "select": {
                "type": "select"
            },
            "option_group": {
                "type": "group"
            },
            "checkbox": {
                "type": "checkbox"
            },
            "likert": {
                "type": "likert"
            },
            "validation": {
                "required": {
                    "type": "text"
                },
                "pattern": {
                    "type": "text"
                },
                "mask": {
                    "type": "text"
                },
                "even": {
                    "type": "number",
                    "validation": "validation.even % 2 === 0"
                },
                "min_max": {
                    "type": "number"
                },
                "email": {
                    "type": "email"
                },
                "continue": {
                    "type": "checkbox"
                }
            }
        }
    };

    var template = new LegalForm().build(legalform.definition);

    var ractive = new RactiveLegalForm({
        el: $('.wizard')[0],
        template: template,
        validation: new LegalFormValidation(),
        defaults: legalform.defaults,
        //computed: legalform.computed,
        meta: legalform.meta,
        locale: 'en'
    });

    window.ractive = ractive;
})();
