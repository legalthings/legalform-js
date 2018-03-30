(function() {
    var legalform = {
        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#",
        "definition": [
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Text",
                        "name" : "text",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#password",
                        "label" : "Password",
                        "name" : "password",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Number",
                        "name" : "number",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#amount",
                        "label" : "Number with unit",
                        "name" : "number_with_unit",
                        "default" : "",
                        "options" : [
                            {"singular" : "unit", "plural" : "units"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#money",
                        "label" : "Amount",
                        "name" : "amount",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#date",
                        "label" : "Date",
                        "name" : "date",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#email",
                        "label" : "E-mail",
                        "name" : "email",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#textarea",
                        "label" : "Text area",
                        "name" : "textarea",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "label" : "Select",
                        "name" : "select",
                        "url" : "",
                        "options" : [
                            {"value" : "1", "label" : "one"},
                            {"value" : "2", "label" : "two"},
                            {"value" : "3", "label" : "three"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group",
                        "label" : "Option group",
                        "name" : "option_group",
                        "options" : [
                            {"value" : "1", "label" : "one"},
                            {"value" : "2", "label" : "two"},
                            {"value" : "3", "label" : "three"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
                        "label" : "Checkbox",
                        "name" : "checkbox",
                        "text" : "Yes or no",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#likert",
                        "label" : "Likert",
                        "name" : "likert",
                        "keys" : [
                            "Do you like green?",
                            "nDo you like blue?",
                            "Do you like red?"
                        ],
                        "options" : [
                            {"label" : "Hate it", "value" : "hate it"},
                            {"label" : "Dislike it", "value" : "dislike it"},
                            {"label" : "Neutral", "value" : "neutral"},
                            {"label" : "Like it", "value" : "like it"},
                            {"label" : "Love it", "value" : "love it"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean suscipit placerat risus sed ultrices. Duis semper massa sollicitudin, malesuada dui a, hendrerit dolor. Sed ut mattis lorem. Praesent rhoncus, urna sit amet pharetra pellentesque, tellus nulla eleifend risus, sit amet pulvinar mi erat facilisis leo. Praesent quam ipsum, hendrerit et augue elementum, placerat gravida lacus. Aliquam erat volutpat. Integer lectus nulla, ultricies in interdum ac, rhoncus in lacus. In vestibulum nunc ac dui bibendum, sed pulvinar metus tempus. Nulla facilisi.",
                        "name": "lorem"
                    }

                ],
                "label" : "All field types",
                "group" : "",
                "anchor" : "",
                "conditions" : "",
                "helptext" : "",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Text",
                        "name" : "text",
                        "default" : "Default value",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#password",
                        "label" : "Password",
                        "name" : "password",
                        "default" : "Some_password",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Number",
                        "name" : "number",
                        "default" : "12345",
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#amount",
                        "label" : "Number with unit",
                        "name" : "number_with_unit",
                        "default" : "12",
                        "options" : [
                            {"singular" : "unit", "plural" : "units"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#money",
                        "label" : "Amount",
                        "name" : "amount",
                        "default" : "10",
                        "helptext" : "",
                        "conditions" : "",
                        "min" : "",
                        "max" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#email",
                        "label" : "E-mail",
                        "name" : "email",
                        "default" : "test@example.com",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#textarea",
                        "label" : "Text area",
                        "name" : "textarea",
                        "default" : "Default text",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "label" : "Select",
                        "name" : "select",
                        "default" : "2",
                        "url" : "",
                        "options" : [
                            {"value" : "1", "label" : "one"},
                            {"value" : "2", "label" : "two"},
                            {"value" : "3", "label" : "three"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group",
                        "label" : "Option group",
                        "name" : "option_group",
                        "default" : "3",
                        "options" : [
                            {"value" : "1", "label" : "one"},
                            {"value" : "2", "label" : "two"},
                            {"value" : "3", "label" : "three"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
                        "label" : "Checkbox",
                        "name" : "checkbox",
                        "checked" : true,
                        "text" : "Yes or no",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    }

                ],
                "label" : "Fields with default values",
                "group" : "defaults",
                "anchor" : "",
                "conditions" : "",
                "helptext" : "",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "First name",
                        "name" : "first_name",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Last name of {{ expression.first_name || '...' }}",
                        "name" : "last_name",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#expression",
                        "name" : "name",
                        "expression" : ".first_name + \" \" + .last_name"
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "label" : "I like {{ expression.name || '...' }}",
                        "name" : "like",
                        "url" : "",
                        "options" : [
                            {"value" : "1", "label" : "yes"},
                            {"value" : "0", "label" : "no"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#static",
                        "name": "static_data",
                        "content": "<p><strong>Entered user data:</strong></p><p><em>First name:</em> {{ expression.first_name }}</p><p><em>Last name:</em> {{ expression.last_name }}</p>",
                        "conditions" : ".like == 1"
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select-group",
                        "label" : "Option group",
                        "name" : "option_group",
                        "options" : [
                            {"value" : "1", "label" : "one"},
                            {"value" : "2", "label" : "two"},
                            {"value" : "3", "label" : "three"}
                        ],
                        "helptext" : "",
                        "conditions" : ".like == 1",
                        "validation" : ""
                    }
                ],
                "label" : "Expression",
                "group" : "expression",
                "anchor" : "",
                "conditions" : "",
                "helptext" : "<p>This step shows the use of expressions as well as templating labels and texts. Fill out the first name and you see it being used in the form.</p>",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_select",
                        "label" : "Post",
                        "name" : "post",
                        "url" : "http://jsonplaceholder.typicode.com/posts",
                        "optionValue" : "id",
                        "optionText" : "title",
                        "helptext" : "",
                        "conditions" : "",
                        "jmespath" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_select",
                        "label" : "Comment",
                        "name" : "comment",
                        "url" : "http://jsonplaceholder.typicode.com/posts/{{ external.post }}/comments",
                        "optionValue" : "id",
                        "optionText" : "name",
                        "helptext" : "",
                        "conditions" : "",
                        "jmespath" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_select",
                        "label" : "Quote",
                        "name" : "quote",
                        "url" : "http://jsonplaceholder.typicode.com/posts/1",
                        "optionValue" : "id",
                        "optionText" : "value",
                        "helptext" : "",
                        "conditions" : "",
                        "jmespath" : "[{id: 'title', value: title}, {id: 'body', value: body}]",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Photo id",
                        "name" : "photo_id",
                        "default" : "",
                        "helptext" : "Between 1 and 5000",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "1",
                        "max" : "5000",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_data",
                        "name" : "photo",
                        "url" : "https://jsonplaceholder.typicode.com/photos/{{ external.photo_id }}",
                        "jmespath" : "",
                        "conditions" : "external.photo_id != \"\""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
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
                "anchor" : "",
                "conditions" : "",
                "helptext" : "<p>This step will perform an extern request at <a href=\"https://jsonplaceholder.typicode.com\">https://jsonplaceholder.typicode.com</a>.</p><p>Try typing in <code>est</code>.</p>",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Required",
                        "name" : "required",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "required" : "required",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#select",
                        "label" : "Select",
                        "name" : "select",
                        "url" : "",
                        "options" : [
                            {"value" : "1", "label" : "one"},
                            {"value" : "2", "label" : "two"},
                            {"value" : "3", "label" : "three"}
                        ],
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : "",
                        "required" : "required"
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Pattern",
                        "name" : "pattern",
                        "default" : "",
                        "helptext" : "Please enter a lower case letter followed by one or more digits",
                        "conditions" : "",
                        "pattern" : "[a-z]\\d+",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Mask",
                        "name" : "mask",
                        "default" : "",
                        "helptext" : "4 digits, 2 letters",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "9999aa",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#password",
                        "label" : "Password",
                        "name" : "password",
                        "default" : "",
                        "helptext" : "Password should be at least 8 symbols long",
                        "conditions" : "",
                        "pattern" : ".{8,}",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Even",
                        "name" : "even",
                        "default" : "",
                        "helptext" : "An even number",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "",
                        "max" : "",
                        "validation" : "validation.even % 2 === 0"
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Min/Max",
                        "name" : "min_max",
                        "default" : "",
                        "helptext" : "Between 3 and 7",
                        "conditions" : "",
                        "decimals" : "0",
                        "min" : "3",
                        "max" : "7",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#email",
                        "label" : "E-mail",
                        "name" : "email",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Show next step",
                        "name" : "show_next_step",
                        "default" : "",
                        "helptext" : "Type 'show' to see the next step",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
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
                "anchor" : "",
                "conditions" : "",
                "helptext" : "<p>Please fill out everything correctly to continue.</p>",
                "helptip" : ""
            },
            {
                "fields" : [
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Show fields",
                        "name" : "show_fields",
                        "default" : "",
                        "helptext" : "Type 'show' to see the fields",
                        "conditions" : "",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Required",
                        "name" : "required",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "conditional_step.show_fields != 'show'",
                        "required" : "required",
                        "pattern" : "",
                        "mask" : "",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#text",
                        "label" : "Masked field",
                        "name" : "masked_field",
                        "default" : "",
                        "helptext" : "",
                        "conditions" : "conditional_step.show_fields == 'show'",
                        "pattern" : "",
                        "mask" : "999aa",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_select",
                        "label" : "Post",
                        "name" : "post",
                        "url" : "http://jsonplaceholder.typicode.com/posts",
                        "optionValue" : "id",
                        "optionText" : "title",
                        "helptext" : "",
                        "conditions" : "conditional_step.show_fields == 'show'",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#number",
                        "label" : "Photo id",
                        "name" : "photo_id",
                        "default" : "",
                        "helptext" : "Between 1 and 5000",
                        "conditions" : "conditional_step.show_fields == 'show'",
                        "decimals" : "0",
                        "min" : "1",
                        "max" : "5000",
                        "validation" : ""
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#external_data",
                        "name" : "photo",
                        "url" : "https://jsonplaceholder.typicode.com/photos/{{ conditional_step.photo_id }}",
                        "jmespath" : "",
                        "conditions" : "conditional_step.photo_id != \"\" && conditional_step.show_fields == 'show'",
                        "url_field" : "conditional_step.photo-url"
                    },
                    {
                        "$schema": "http://specs.livecontracts.io/draft-01/04-form/schema.json#checkbox",
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
                "anchor" : "",
                "conditions" : "validation.show_next_step == 'show'",
                "helptext" : "",
                "helptip" : ""
            },
            {
              "fields" : [],
              "label" : "Final step",
              "group" : "final",
              "anchor" : "",
              "conditions" : "validation.show_next_step == 'show'",
              "helptext" : "",
              "helptip" : ""
          }
        ]
    };

    var builder = new LegalForm();

    var template = builder.build(legalform.definition);
    var options = builder.calc(legalform.definition);

    var ractive = new RactiveLegalForm({
        el: $('.wizard')[0],
        template: template,
        validation: new LegalFormValidation(),
        defaults: options.defaults,
        computed: options.computed,
        meta: options.meta,
        locale: 'en',
        resolveInstanceMembers: false //prevent autocreation of `data` value, containing all ractive values
    });

    var helptext = builder.buildHelpText(legalform.definition);

    new Ractive({
        el: $('#doc-help')[0],
        template: helptext
    });

    window.ractive = ractive;
})();
