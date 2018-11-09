
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ltriToUrl;
}

/**
 * Translate an LTRI to a URL
 *
 * @param {string} url  LTRI or URL
 * @return {string}
 */
function ltriToUrl(url) {
    if (url.match(/^https?:\/\//)) return url;

    var base = document.querySelector('head base').getAttribute('href') || '/';
    var scheme = window.location.protocol + '//';
    var host = window.location.host;

    base = base.replace(/service\/[a-z]+\//, 'service/');

    if (!base.match(/^(https?:)?\/\//)) {
        base = host + '/' + base.replace(/^\//, '');
    }

    url = url.replace('lt:', '');
    var auth = url.match(/^[^:\/@]+:[^:\/@]+@/);
    if (auth) {
        url = url.replace(auth[0], '');
        base = auth[0] + base;
    }

    url = url.replace(/^([a-z]+):(\/)?/, function(match, resource) {
        var start = resource === 'external' ? host : base.replace(/\/$/, '');

        return scheme + start + '/' + resource + '/';
    });

    return url;
}
