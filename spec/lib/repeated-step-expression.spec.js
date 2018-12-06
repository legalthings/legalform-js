'use strict';

describe("test inserting repeated step index into expression", function() {
    var tmplToExpression = require('../../js/lib/repeated-step-expression');

    function usePlaceholderProvider() {
        return [
            {
                note: 'insert indexes for "foo" step',
                group: 'foo',
                expression: '${foo.bar} + ${baz.bar} + "test" + "foo." + ${foo.zoo} + ${test.foo.zoo}',
                expected: '${foo[2].bar} + ${baz.bar} + "test" + "foo." + ${foo[2].zoo} + ${test.foo.zoo}'
            },
            {
                note: 'insert indexes for "foo.bar.baz" step',
                group: 'foo.bar.baz',
                expression: '${foo.bar.baz.prop1} + ${baz.bar} + "test" + "foo.bar.baz." + ${foo.bar.baz.prop2} + ${test.foo.bar.baz.zoo}',
                expected: '${foo.bar.baz[2].prop1} + ${baz.bar} + "test" + "foo.bar.baz." + ${foo.bar.baz[2].prop2} + ${test.foo.bar.baz.zoo}'
            },
            {
                note: 'return expression as it is if step group is not set',
                group: '',
                expression: '${foo.bar} + ${baz.bar} + "test" + "foo." + ${foo.zoo} + ${test.foo.zoo}',
                expected: '${foo.bar} + ${baz.bar} + "test" + "foo." + ${foo.zoo} + ${test.foo.zoo}'
            },
            {
                note: 'return expression as it is if step group is not found in expression',
                group: 'not_used',
                expression: '${foo.bar} + ${baz.bar} + "test" + "foo." + ${foo.zoo} + ${test.foo.zoo}',
                expected: '${foo.bar} + ${baz.bar} + "test" + "foo." + ${foo.zoo} + ${test.foo.zoo}'
            },
        ];
    }

    usePlaceholderProvider().forEach(function(spec) {
        it(spec.note, function() {
            var result = tmplToExpression(spec.expression, spec.group, 2);

            expect(result).toBe(spec.expected);
        });
    });
});
