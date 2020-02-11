
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ajaxGet;
}

/**
 * Unescape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function ajaxGet(url, options) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url);

        if (typeof options.headers !== 'undefined') {
            for (var name in options.headers) {
                var header = options.headers[name];

                for (var j = 0; j < header.length; j++) {
                    xhr.setRequestHeader(name, header[j]);
                }
            }
        }

        xhr.onload = function() {
            xhr.status < 400 ? resolve(xhr.response) : reject(Error(xhr.statusText));
        };

        xhr.onerror = function(e) {
            reject(Error(`Network Error: ${e}`));
        }

        xhr.send();
    });
}
