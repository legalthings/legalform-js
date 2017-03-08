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
                        "helptext": "",
                        "conditions": "",
                        "pattern": "",
                        "mask": "",
                        "validation": ""
                    },
                    {
                        "type": "number",
                        "label": "Number",
                        "name": "number",
                        "value": "",
                        "helptext": "",
                        "conditions": "",
                        "decimals": "0",
                        "min": "",
                        "max": "",
                        "validation": ""
                    },
                    {
                        "type": "amount",
                        "label": "Number with unit",
                        "name": "number_with_unit",
                        "value": "",
                        "optionValue": [
                            "unit"
                        ],
                        "optionText": [
                            "units"
                        ],
                        "helptext": "",
                        "conditions": "",
                        "decimals": "0",
                        "min": "",
                        "max": "",
                        "validation": ""
                    },
                    {
                        "type": "money",
                        "label": "Amount",
                        "name": "amount",
                        "value": "",
                        "helptext": "",
                        "conditions": "",
                        "min": "",
                        "max": "",
                        "validation": ""
                    },
                    {
                        "type": "date",
                        "label": "Date",
                        "name": "date",
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
                    },
                    {
                        "type": "email",
                        "label": "E-mail",
                        "name": "email",
                        "value": "",
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
                    },
                    {
                        "type": "textarea",
                        "label": "Text area",
                        "name": "textarea",
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
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
                        "helptext": "",
                        "conditions": "",
                        "validation": "",
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
                        ],
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
                    },
                    {
                        "type": "checkbox",
                        "label": "Checkbox",
                        "name": "checkbox",
                        "text": "Yes or no",
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
                    },
                    {
                        "type": "likert",
                        "label": "Likert",
                        "name": "likert",
                        "keys": "Do you like green?\r\nDo you like blue?\r\nDo you like red?",
                        "values": "Hate it\r\nDislike it\r\nNeutral\r\nLike it\r\nLove it",
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
                    }
                ],
                "label": "All field types",
                "group": "",
                "article": "",
                "conditions": "",
                "helptext": "",
                "helptip": ""
            },
            {
                "fields": [
                    {
                        "type": "text",
                        "label": "First name",
                        "name": "first_name",
                        "value": "",
                        "helptext": "",
                        "conditions": "",
                        "pattern": "",
                        "mask": "",
                        "validation": ""
                    },
                    {
                        "type": "text",
                        "label": "Last name of {{ expression.first_name || '...' }}",
                        "name": "last_name",
                        "value": "",
                        "helptext": "",
                        "conditions": "",
                        "pattern": "",
                        "mask": "",
                        "validation": ""
                    },
                    {
                        "type": "expression",
                        "name": "name",
                        "expression": ".first_name + \" \" + .last_name"
                    },
                    {
                        "type": "select",
                        "label": "I like {{ expression.name || '...' }}",
                        "name": "like",
                        "url": "",
                        "optionValue": [
                            "1",
                            "0"
                        ],
                        "optionText": [
                            "yes",
                            "no"
                        ],
                        "helptext": "",
                        "conditions": "",
                        "validation": "",
                        "optionSelected": [],
                        "options": [
                            {
                                "value": "1",
                                "label": "yes"
                            },
                            {
                                "value": "0",
                                "label": "no"
                            }
                        ]
                    }
                ],
                "label": "Expression",
                "group": "expression",
                "article": "",
                "conditions": "",
                "helptext": "",
                "helptip": ""
            },
            {
                "fields": [
                    {
                        "type": "select",
                        "label": "Post",
                        "name": "post",
                        "url": "http://jsonplaceholder.typicode.com/posts",
                        "optionValue": "id",
                        "optionText": "title",
                        "helptext": "",
                        "conditions": "external.photo_id != \"\"",
                        "external_source": "true",
                        "validation": ""
                    },
                    {
                        "type": "number",
                        "label": "Photo id",
                        "name": "photo_id",
                        "value": "",
                        "helptext": "Between 1 and 5000",
                        "conditions": "",
                        "decimals": "0",
                        "min": "1",
                        "max": "5000",
                        "validation": ""
                    },
                    {
                        "type": "external_data",
                        "name": "photo",
                        "url": "https://jsonplaceholder.typicode.com/photos/{{ photo_id }}",
                        "jmespath": "",
                        "conditions": "photo_id != \"\""
                    },
                    {
                        "type": "checkbox",
                        "label": "{{ external.photo.title }}",
                        "name": "photo_checkbox",
                        "text": "{{ external.photo.url }}",
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
                    }
                ],
                "label": "External",
                "group": "external",
                "article": "",
                "conditions": "",
                "helptext": "",
                "helptip": ""
            },
            {
                "fields": [
                    {
                        "type": "text",
                        "label": "Required",
                        "name": "required",
                        "value": "",
                        "helptext": "",
                        "conditions": "",
                        "required": "required",
                        "pattern": "",
                        "mask": "",
                        "validation": ""
                    },
                    {
                        "type": "text",
                        "label": "Pattern",
                        "name": "pattern",
                        "value": "",
                        "helptext": "Please enter a lower case letter followed by one or more digits",
                        "conditions": "",
                        "pattern": "[a-z]\\d+",
                        "mask": "",
                        "validation": ""
                    },
                    {
                        "type": "text",
                        "label": "Mask",
                        "name": "mask",
                        "value": "",
                        "helptext": "4 digits, 2 letters",
                        "conditions": "",
                        "pattern": "",
                        "mask": "9999aa",
                        "validation": ""
                    },
                    {
                        "type": "number",
                        "label": "Even",
                        "name": "even",
                        "value": "",
                        "helptext": "An even number",
                        "conditions": "",
                        "decimals": "0",
                        "min": "",
                        "max": "",
                        "validation": "validation.even % 2 === 0"
                    },
                    {
                        "type": "number",
                        "label": "Min/Max",
                        "name": "min_max",
                        "value": "",
                        "helptext": "Between 3 and 7",
                        "conditions": "",
                        "decimals": "0",
                        "min": "3",
                        "max": "7",
                        "validation": ""
                    },
                    {
                        "type": "email",
                        "label": "E-mail",
                        "name": "email",
                        "value": "",
                        "helptext": "",
                        "conditions": "",
                        "validation": ""
                    },
                    {
                        "type": "checkbox",
                        "label": "",
                        "name": "continue",
                        "text": "Please select this to continue",
                        "helptext": "",
                        "conditions": "",
                        "required": "required",
                        "validation": ""
                    }
                ],
                "label": "Validation",
                "group": "validation",
                "article": "",
                "conditions": "",
                "helptext": "",
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
            },
            "expression": {
                "first_name": "",
                "last_name": "",
                "like": "1"
            },
            "external": {
                "post": [],
                "photo_id": ""
            }
        },
        "computed": {
            "validation.even-validation": " ${validation.even} % 2 === 0",
            "expression.name": "${expression.first_name} + \" \" + ${expression.last_name}",
            "external.photo-url": "'https://jsonplaceholder.typicode.com/photos/' + ${photo_id} + ''",
            "external.photo-conditions": "( ${photo_id} != \"\")",
            "external.post-conditions": "( ${external.photo_id} != \"\")"
        },
        "meta": {
            "text": {
                "type": "text",
                "validation": ""
            },
            "number": {
                "type": "number",
                "validation": ""
            },
            "number_with_unit": {
                "type": "amount",
                "validation": "",
                "singular": [
                    "unit"
                ],
                "plural": [
                    "units"
                ]
            },
            "amount": {
                "type": "money",
                "validation": ""
            },
            "date": {
                "type": "date",
                "validation": ""
            },
            "email": {
                "type": "email",
                "validation": ""
            },
            "textarea": {
                "type": "textarea",
                "validation": ""
            },
            "select": {
                "type": "select",
                "validation": ""
            },
            "option_group": {
                "type": "group",
                "validation": ""
            },
            "checkbox": {
                "type": "checkbox",
                "validation": ""
            },
            "likert": {
                "type": "likert",
                "validation": ""
            },
            "validation": {
                "required": {
                    "type": "text",
                    "validation": ""
                },
                "pattern": {
                    "type": "text",
                    "validation": ""
                },
                "mask": {
                    "type": "text",
                    "validation": ""
                },
                "even": {
                    "type": "number",
                    "validation": "validation.even % 2 === 0"
                },
                "min_max": {
                    "type": "number",
                    "validation": ""
                },
                "email": {
                    "type": "email",
                    "validation": ""
                },
                "continue": {
                    "type": "checkbox",
                    "validation": ""
                }
            },
            "expression": {
                "first_name": {
                    "type": "text",
                    "validation": ""
                },
                "last_name": {
                    "type": "text",
                    "validation": ""
                },
                "name": {
                    "type": "expression"
                },
                "like": {
                    "type": "select",
                    "validation": ""
                }
            },
            "external": {
                "post": {
                    "type": "select",
                    "validation": "",
                    "conditions_field": "external.post-conditions",
                    "conditions": "external.photo_id != \"\"",
                    "external_source": true
                },
                "photo_id": {
                    "type": "number",
                    "validation": ""
                },
                "photo": {
                    "type": "external_data",
                    "conditions_field": "external.photo-conditions",
                    "jmespath": "",
                    "url": "https://jsonplaceholder.typicode.com/photos/{{ photo_id }}",
                    "conditions": "photo_id != \"\"",
                    "url_field": "external.photo-url"
                },
                "photo_checkbox": {
                    "type": "checkbox",
                    "validation": ""
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
        computed: legalform.computed,
        meta: legalform.meta,
        locale: 'en'
    });

    window.ractive = ractive;
})();
