
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ajaxGet;
}

/**
 * Send ajax request
 * @param {string} url
 * @param {object} options
 * @return Promise
 */
function ajaxRequest(url, options) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        const method = typeof options.method !== 'undefined' ? options.method : 'GET';
        const sync = typeof options.sync !== 'undefined' ? options.sync : false;

        xhr.open(method, url, !sync);

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

        if (method.toLowerCase() === 'post' && typeof options.data !== 'undefined') {
            const data = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
            xhr.send(data);
        } else {
            xhr.send();
        }
    });
}
