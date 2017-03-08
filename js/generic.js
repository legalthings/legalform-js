
//Extend url to search for options
function extendExternalUrl(url, search) {
    if (url.match('%value%')) url = url.replace('%value%', encodeURI(search));
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
        // For now we consider 'legalforms' resource equal to base url
        return resource == 'legalforms' ? '' : resource + '/';
    });

    return url;
}