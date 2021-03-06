(function() {
    var legalform = {
        "definition": [
            {
                "fields" : [
                    {
                        "type" : "text",
                        "label" : "Text",
                        "name" : "text",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "password",
                        "label" : "Password",
                        "name" : "password",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "number",
                        "label" : "Number",
                        "name" : "number",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
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
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "amount",
                        "label" : "Number with unit multiple",
                        "name" : "number_with_unit_multiple",
                        "value" : "",
                        "optionValue" : [
                            "unit",
                            "alt_unit"
                        ],
                        "optionText" : [
                            "units",
                            "alt_units"
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "money",
                        "label" : "Amount",
                        "name" : "amount",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "date",
                        "label" : "Date",
                        "name" : "date",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "email",
                        "label" : "E-mail",
                        "name" : "email",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "textarea",
                        "label" : "Text area",
                        "name" : "textarea",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
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
                        "optionSelected" : [

                        ],
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
                        "type" : "group",
                        "label" : "Option group",
                        "name" : "option_group",
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
                        "validation" : ""
                    },
                    {
                        "type" : "checkbox",
                        "label" : "Checkbox",
                        "name" : "checkbox",
                        "text" : "Yes or no",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "likert",
                        "label" : "Likert",
                        "name" : "likert",
                        "keys" : "Do you like green?\r\nDo you like blue?\r\nDo you like red?",
                        "values" : "Hate it\r\nDislike it\r\nNeutral\r\nLike it\r\nLove it",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "type": "text",
                        "label": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean suscipit placerat risus sed ultrices. Duis semper massa sollicitudin, malesuada dui a, hendrerit dolor. Sed ut mattis lorem. Praesent rhoncus, urna sit amet pharetra pellentesque, tellus nulla eleifend risus, sit amet pulvinar mi erat facilisis leo. Praesent quam ipsum, hendrerit et augue elementum, placerat gravida lacus. Aliquam erat volutpat. Integer lectus nulla, ultricies in interdum ac, rhoncus in lacus. In vestibulum nunc ac dui bibendum, sed pulvinar metus tempus. Nulla facilisi.",
                        "name": "lorem"
                    }

                ],
                "label" : "All field types",
                "group" : "",
                "article" : "",
                "conditions" : "",
                "helptext" : "",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "type" : "text",
                        "label" : "Text",
                        "name" : "text",
                        "value" : "Default value",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "password",
                        "label" : "Password",
                        "name" : "password",
                        "value" : "Some_password",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "number",
                        "label" : "Number",
                        "name" : "number",
                        "value" : "12345",
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "amount",
                        "label" : "Number with unit",
                        "name" : "number_with_unit",
                        "value" : "12",
                        "optionValue" : [
                            "unit"
                        ],
                        "optionText" : [
                            "units"
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "money",
                        "label" : "Amount",
                        "name" : "amount",
                        "value" : "10",
                        "helptext" : "",
                        "conditions" : "",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "email",
                        "label" : "E-mail",
                        "name" : "email",
                        "value" : "test@example.com",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "textarea",
                        "label" : "Text area",
                        "name" : "textarea",
                        "value" : "Default text",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
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
                        "value" : "2",
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
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    }
                ],
                "label" : "Fields with default values",
                "group" : "defaults",
                "article" : "",
                "conditions" : "",
                "helptext" : "",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "type" : "text",
                        "label" : "First name",
                        "name" : "first_name",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "text",
                        "label" : "Last name of {{ expression.first_name || '...' }}",
                        "name" : "last_name",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "expression",
                        "name" : "name",
                        "expression" : ".first_name + \" \" + .last_name"
                    },
                    {
                        "type" : "select",
                        "label" : "I like {{ expression.name || '...' }}",
                        "name" : "like",
                        "url" : "",
                        "optionValue" : [
                            "1",
                            "0"
                        ],
                        "optionText" : [
                            "yes",
                            "no"
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : "",
                        "optionSelected" : [

                        ],
                        "options" : [
                            {
                                "value" : "1",
                                "label" : "yes"
                            },
                            {
                                "value" : "0",
                                "label" : "no"
                            }
                        ]
                    },
                    {
                        "type": "static",
                        "name": "static_data",
                        "content": "<p><strong>Entered user data:</strong></p><p><em>First name:</em> {{ expression.first_name }}</p><p><em>Last name:</em> {{ expression.last_name }}</p>",
                        "conditions" : ".like == 1"
                    },
                    {
                        "type" : "group",
                        "label" : "Option group",
                        "name" : "option_group",
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
                        "conditions" : ".like == 1",
                        "validation" : ""
                    }
                ],
                "label" : "Expression",
                "group" : "expression",
                "article" : "",
                "conditions" : "",
                "helptext" : "<p>This step shows the use of expressions as well as templating labels and texts. Fill out the first name and you see it being used in the form.</p>",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "type" : "select",
                        "label" : "Post",
                        "name" : "post",
                        "url" : "http://jsonplaceholder.typicode.com/posts",
                        "optionValue" : "id",
                        "optionText" : "title",
                        "helptext" : "",
                        "conditions" : "",
                        "external_source" : "true",
                        "jmespath" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "select",
                        "label" : "Comment",
                        "name" : "comment",
                        "url" : "http://jsonplaceholder.typicode.com/posts/{{ external.post }}/comments",
                        "optionValue" : "id",
                        "optionText" : "name",
                        "helptext" : "",
                        "conditions" : "",
                        "external_source" : "true",
                        "jmespath" : "",
                        "validation" : ""
                    },
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
                    },
                    {
                        "type" : "number",
                        "label" : "Photo id",
                        "name" : "photo_id",
                        "value" : "",
                        "helptext" : "Between 1 and 5000",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "1",
                        "max" : "5000",
                        "validation" : ""
                    },
                    {
                        "type" : "external_data",
                        "name" : "photo",
                        "url" : "https://jsonplaceholder.typicode.com/photos/{{ external.photo_id }}",
                        "jmespath" : "",
                        "conditions" : "external.photo_id != \"\""
                    },
                    {
                        "type" : "checkbox",
                        "label" : "{{ external.photo.title }}",
                        "name" : "photo_checkbox",
                        "text" : "{{ external.photo.url }}",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    }
                ],
                "label" : "External",
                "group" : "external",
                "article" : "",
                "conditions" : "",
                "helptext" : "<p>This step will perform an extern request at <a href=\"https://jsonplaceholder.typicode.com\">https://jsonplaceholder.typicode.com</a>.</p><p>Try typing in <code>est</code>.</p>",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "type" : "text",
                        "label" : "Required",
                        "name" : "required",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "required" : "required",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
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
                        "required" : "required",
                        "optionSelected" : [

                        ],
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
                        "type" : "text",
                        "label" : "Pattern",
                        "name" : "pattern",
                        "value" : "",
                        "helptext" : "Please enter a lower case letter followed by one or more digits",
                        "conditions" : "",
                        "pattern" : "[a-z]\\d+",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "text",
                        "label" : "Mask",
                        "name" : "mask",
                        "value" : "",
                        "helptext" : "4 digits, 2 letters",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "9999aa",
                        "validation" : ""
                    },
                    {
                        "type" : "password",
                        "label" : "Password",
                        "name" : "password",
                        "value" : "",
                        "helptext" : "Password should be at least 8 symbols long",
                        "conditions" : "",
                        "pattern" : ".{8,}",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "number",
                        "label" : "Even",
                        "name" : "even",
                        "value" : "",
                        "helptext" : "An even number",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : "validation.even % 2 === 0"
                    },
                    {
                        "type" : "number",
                        "label" : "Min/Max",
                        "name" : "min_max",
                        "value" : "",
                        "helptext" : "Between 3 and 7",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "3",
                        "max" : "7",
                        "validation" : ""
                    },
                    {
                        "type" : "email",
                        "label" : "E-mail",
                        "name" : "email",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "text",
                        "label" : "Show next step",
                        "name" : "show_next_step",
                        "value" : "",
                        "helptext" : "Type 'show' to see the next step",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "checkbox",
                        "label" : "",
                        "name" : "continue",
                        "text" : "Please select this to continue",
                        "helptext" : "",
                        "conditions" : "",
                        "required" : "required",
                        "validation" : ""
                    }
                ],
                "label" : "Validation",
                "group" : "validation",
                "article" : "",
                "conditions" : "",
                "helptext" : "<p>Please fill out everything correctly to continue.</p>",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "type" : "text",
                        "label" : "Show fields",
                        "name" : "show_fields",
                        "value" : "",
                        "helptext" : "Type 'show' to see the fields",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "text",
                        "label" : "Required",
                        "name" : "required",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "conditional_step.show_fields != 'show'",
                        "required" : "required",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "type" : "text",
                        "label" : "Masked field",
                        "name" : "masked_field",
                        "value" : "",
                        "helptext" : "",
                        "conditions" : "conditional_step.show_fields == 'show'",
                        "pattern" : "",
                        "mask" : "999aa",
                        "validation" : ""
                    },
                    {
                        "type" : "select",
                        "label" : "Post",
                        "name" : "post",
                        "url" : "http://jsonplaceholder.typicode.com/posts",
                        "optionValue" : "id",
                        "optionText" : "title",
                        "helptext" : "",
                        "conditions" : "conditional_step.show_fields == 'show'",
                        "external_source" : "true",
                        "validation" : ""
                    },
                    {
                        "type" : "number",
                        "label" : "Photo id",
                        "name" : "photo_id",
                        "value" : "",
                        "helptext" : "Between 1 and 5000",
                        "conditions" : "conditional_step.show_fields == 'show'",
                        "decimals" : "0",
                        "min" : "1",
                        "max" : "5000",
                        "validation" : ""
                    },
                    {
                        "type" : "external_data",
                        "name" : "photo",
                        "url" : "https://jsonplaceholder.typicode.com/photos/{{ conditional_step.photo_id }}",
                        "jmespath" : "",
                        "conditions" : "conditional_step.photo_id != \"\" && conditional_step.show_fields == 'show'",
                        "url_field" : "conditional_step.photo-url"
                    },
                    {
                        "type" : "checkbox",
                        "label" : "{{ conditional_step.photo.title }}",
                        "name" : "photo_checkbox",
                        "text" : "{{ conditional_step.photo.url }}",
                        "helptext" : "",
                        "conditions" : "conditional_step.show_fields == 'show'",
                        "validation" : ""
                    }
                ],
                "label" : "Conditional step",
                "group" : "conditional_step",
                "article" : "",
                "conditions" : "validation.show_next_step == 'show'",
                "helptext" : "",
                "helptip" : ""
            },
            {
              "fields" : [],
              "label" : "Final step",
              "group" : "final",
              "article" : "",
              "conditions" : "validation.show_next_step == 'show'",
              "helptext" : "",
              "helptip" : ""
            }
        ]
    };

    var dom = new Dom();
    var wizard = dom.findOne('.wizard');
    var variant = getVariant();
    variant.setWizard(wizard.element);

    var builder = new LegalForm(variant);
    var template = builder.build(legalform.definition);
    var options = builder.calc(legalform.definition);

    var ractive = new RactiveLegalForm({
        el: wizard.element,
        template: template,
        validation: new LegalFormValidation(),
        defaults: options.defaults,
        computed: options.computed,
        meta: options.meta,
        locale: 'en',
        values: {},
        functions: {},
        variant: variant,
        resolveInstanceMembers: false //prevent autocreation of `data` value, containing all ractive values
    });

    var helptext = builder.buildHelpText(legalform.definition);

    new Ractive({
        el: dom.findOne('#doc-help').element,
        template: helptext
    });

    window.ractive = ractive;

    function getVariant() {
        var page = document.location.pathname.match(/([^\/]+)\.html?/);
        var pageName = (page && page[1]) || 'index';

        switch(pageName) {
            case 'index':
            case 'live-contract':
                return new BootstrapVariant($);
            case 'material':
            case 'nomaterial':
                return new BootstrapMaterialVariant($);
            case 'bulma':
                return new BulmaVariant();
        }

        return null;
    }
})();
