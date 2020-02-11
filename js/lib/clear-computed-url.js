
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = clearComputedUrl;
}

/**
 * Remove placeholders of empty values (e.g. 'null', 'undefined') in computed external url
 * @return {string}
 */
function clearComputedUrl(url) {
    return url.replace(/=(undefined|null)\b/g, '=');
}
