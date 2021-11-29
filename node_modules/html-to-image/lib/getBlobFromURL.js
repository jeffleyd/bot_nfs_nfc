"use strict";
/* tslint:disable:max-line-length */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlobFromURL = void 0;
var util_1 = require("./util");
// KNOWN ISSUE
// -----------
// Can not handle redirect-url, such as when access 'http://something.com/avatar.png'
// will redirect to 'http://something.com/65fc2ffcc8aea7ba65a1d1feda173540'
var TIMEOUT = 30000;
var cache = {};
function isFont(filename) {
    return /ttf|otf|eot|woff2?/i.test(filename);
}
function getBlobFromURL(url, options) {
    var href = url.replace(/\?.*/, '');
    if (isFont(href)) {
        href = href.replace(/.*\//, '');
    }
    if (cache[href]) {
        return cache[href];
    }
    // cache bypass so we dont have CORS issues with cached images
    // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    if (options.cacheBust) {
        // tslint:disable-next-line
        url += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
    }
    var failed = function (reason) {
        var placeholder = '';
        if (options.imagePlaceholder) {
            var parts = options.imagePlaceholder.split(/,/);
            if (parts && parts[1]) {
                placeholder = parts[1];
            }
        }
        var msg = "Failed to fetch resource: " + url;
        if (reason) {
            msg = typeof reason === 'string' ? reason : reason.message;
        }
        if (msg) {
            console.error(msg);
        }
        return placeholder;
    };
    var deferred = window.fetch
        ? window
            .fetch(url)
            .then(function (res) {
            return res.blob().then(function (blob) { return ({
                blob: blob,
                contentType: res.headers.get('Content-Type') || '',
            }); });
        })
            .then(function (_a) {
            var blob = _a.blob, contentType = _a.contentType;
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    return resolve({
                        contentType: contentType,
                        blob: reader.result,
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        })
            .then(function (_a) {
            var blob = _a.blob, contentType = _a.contentType;
            return ({
                contentType: contentType,
                blob: util_1.getDataURLContent(blob),
            });
        })
        : new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            var timeout = function () {
                reject(new Error("Timeout of " + TIMEOUT + "ms occured while fetching resource: " + url));
            };
            var done = function () {
                if (req.readyState !== 4) {
                    return;
                }
                if (req.status !== 200) {
                    reject(new Error("Failed to fetch resource: " + url + ", status: " + req.status));
                    return;
                }
                var encoder = new FileReader();
                encoder.onloadend = function () {
                    resolve({
                        blob: util_1.getDataURLContent(encoder.result),
                        contentType: req.getResponseHeader('Content-Type') || '',
                    });
                };
                encoder.readAsDataURL(req.response);
            };
            req.onreadystatechange = done;
            req.ontimeout = timeout;
            req.responseType = 'blob';
            req.timeout = TIMEOUT;
            req.open('GET', url, true);
            req.send();
        });
    var promise = deferred.catch(failed);
    // cache result
    cache[href] = promise;
    return promise;
}
exports.getBlobFromURL = getBlobFromURL;
//# sourceMappingURL=getBlobFromURL.js.map