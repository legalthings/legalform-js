
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

    var base = $('head base').attr('href') || '/';

    if (!base.match(/^(https?:)?\/\//)) {
        var location = window.location;
        base = location.protocol + '//' + location.host + '/' + base.replace(/^\//, '');
    }

    url = url.replace('lt:', '');

    var auth = url.match(/^[^:\/@]+:[^:\/@]+@/);
    if (auth) {
        url = url.replace(auth[0], '');
        base = auth[0] + base;
    }

    url = base.replace(/\/$/, '') + '/' + url.replace(/^([a-z]+):(\/)?/, function(match, resource) {
        return resource + '/';
    });

    return url;
}
