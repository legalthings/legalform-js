
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = tmplToExpression;
}

var dotRegExp = /\./g;

/**
 * Insert repeated step index into expression
 * @param  {object} step
 * @param  {string} expression
 * @return {string}
 */
function tmplToExpression(expressionTmpl, group, idx) {
    var prefix = group + '.';
    prefix = prefix.replace(dotRegExp, '\\.');

    var prefixRegExp = new RegExp('\\$\\{' + prefix, 'g');
    var replacement = '${' + group + '[' + idx + '].';

    return expressionTmpl.replace(prefixRegExp, replacement);
}
