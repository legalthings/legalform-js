
var calculationVars = {
    globals: [
        'Array', 'Date', 'JSON', 'Math', 'NaN', 'RegExp', 'decodeURI', 'decodeURIComponent', 'true', 'false',
        'encodeURI', 'encodeURIComponent', 'isFinite', 'isNaN', 'null', 'parseFloat', 'parseInt', 'undefined'
    ],
    computedRegexp: /("(?:[^"\\]+|\\.)*"|'(?:[^'\\]+|\\.)*')|(^|[^\w\.\)\]\"\'])(\.?)(\w*[a-zA-z]\w*(?:[\.\w]+(?=[^\w(]|$))?)/g
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = calculationVars;
}
