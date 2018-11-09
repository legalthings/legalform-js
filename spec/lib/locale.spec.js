'use strict';

describe("test formatLocale function", function() {
    var formatLocale = require('../../js/lib/locale');

    function formatLocaleProvider() {
        return [
            {note: '"nl_NL" should be formatted as "nl" for "short" format', locale: 'nl_NL', format: 'short', expected: 'nl'},
            {note: '"nl" should be formatted as "nl" for "short" format', locale: 'nl', format: 'short', expected: 'nl'},
            {note: '"NL" should be formatted as "NL" for "short" format', locale: 'NL', format: 'short', expected: 'NL'},
            {note: '"nl_NL" should be formatted as "nl" for "momentjs" format', locale: 'nl_NL', format: 'momentjs', expected: 'nl'},
            {note: '"en_US" should be formatted as "en-us" for "momentjs" format', locale: 'en_US', format: 'momentjs', expected: 'en-us'},
            {note: '"nl" should be formatted as "nl" for "momentjs" format', locale: 'nl', format: 'momentjs', expected: 'nl'},
            {note: '"NL" should be formatted as "nl" for "momentjs" format', locale: 'NL', format: 'momentjs', expected: 'nl'},
            {note: '"some_locale" should should just be returned, if format is empty', locale: 'some_locale', format: null, expected: 'some_locale'},
        ];
    }

    formatLocaleProvider().forEach(function(spec) {
        it(spec.note, function() {
            var result = formatLocale(spec.locale, spec.format);

            expect(result).toBe(spec.expected);
        });
    });

    it('should throw if format is not supported', function() {
        expect(function() {
            formatLocale('nl_NL', 'not_supported_format');
        }).toThrow('Unknown format "not_supported_format" for getting document locale');
    })
});
