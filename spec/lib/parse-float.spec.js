'use strict';

describe("test parseNumber function", function() {
    var parseNumber = require('../../js/lib/parse-number');

    var data = [
        {number: 0, expected: 0, note: '0 should be converted to 0.0'},
        {number: '0', expected: 0, note: 'string 0 should be converted to 0.0'},
        {number: 1, expected: 1.0, note: '1 should be converted to 1.0'},
        {number: 134, expected: 134.0, note: '134 should be converted to 134.0'},
        {number: 1.34, expected: 1.34, note: '1.34 should be converted to 1.34'},
        {number: '1,34', expected: 1.34, note: '1,34 should be converted to 1.34'},
        {number: '12,503,348.09', expected: 12503348.09, note: '12,503,348.09 should be converted to 12503348.09'},
        {number: '12.503.348,09', expected: 12503348.09, note: '12.503.348,09 should be converted to 12503348.09'},
        {number: '12503348.09', expected: 12503348.09, note: '12503348.09 should be converted to 12503348.09'},
        {number: '12503348,09', expected: 12503348.09, note: '12503348,09 should be converted to 12503348.09'},
        {number: '12,503.348.09', expected: null, note: '12,503.348.09 should be converted to null'},
        {number: '12,503.348,09', expected: null, note: '12,503.348,09 should be converted to null'},
        {number: 'a12', expected: null, note: 'a12 should be converted to null'},
        {number: undefined, expected: null, note: 'undefined should be converted to null'},
        {number: null, expected: null, note: 'null should be converted to null'},
        {number: {amount: '1,34'}, expected: 1.34, note: 'should correctly convert number with unit from 1,34 to 1.34'}
    ];

    for (var i = 0; i < data.length; i++) {
        var given = data[i];

        testDataItem(given);
    }

    function testDataItem(given) {
        it(given.note, function() {
            var result = parseNumber(given.number);

            expect(result).toBe(given.expected);
        });
    }
});
