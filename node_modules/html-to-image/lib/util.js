"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlobFromImageURL = exports.svgToDataURL = exports.createImage = exports.getPixelRatio = exports.getNodeHeight = exports.getNodeWidth = exports.toArray = exports.canvasToBlob = exports.getDataURLContent = exports.toDataURL = exports.isDataUrl = exports.delay = exports.getMimeType = exports.getExtension = exports.uuid = void 0;
var WOFF = 'application/font-woff';
var JPEG = 'image/jpeg';
var mimes = {
    woff: WOFF,
    woff2: WOFF,
    ttf: 'application/font-truetype',
    eot: 'application/vnd.ms-fontobject',
    png: 'image/png',
    jpg: JPEG,
    jpeg: JPEG,
    gif: 'image/gif',
    tiff: 'image/tiff',
    svg: 'image/svg+xml',
};
exports.uuid = (function uuid() {
    // generate uuid for className of pseudo elements.
    // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
    var counter = 0;
    // ref: http://stackoverflow.com/a/6248722/2519373
    var random = function () {
        return ("0000" + ((Math.random() * Math.pow(36, 4)) << 0).toString(36)).slice(-4);
    };
    return function () {
        counter += 1;
        return "u" + random() + counter;
    };
})();
function getExtension(url) {
    var match = /\.([^./]*?)$/g.exec(url);
    return match ? match[1] : '';
}
exports.getExtension = getExtension;
function getMimeType(url) {
    var ext = getExtension(url).toLowerCase();
    return mimes[ext] || '';
}
exports.getMimeType = getMimeType;
function delay(ms) {
    return function (args) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(args);
            }, ms);
        });
    };
}
exports.delay = delay;
function isDataUrl(url) {
    return url.search(/^(data:)/) !== -1;
}
exports.isDataUrl = isDataUrl;
function toDataURL(content, mimeType) {
    return "data:" + mimeType + ";base64," + content;
}
exports.toDataURL = toDataURL;
function getDataURLContent(dataURL) {
    return dataURL.split(/,/)[1];
}
exports.getDataURLContent = getDataURLContent;
function toBlob(canvas) {
    return new Promise(function (resolve) {
        var binaryString = window.atob(canvas.toDataURL().split(',')[1]);
        var len = binaryString.length;
        var binaryArray = new Uint8Array(len);
        for (var i = 0; i < len; i += 1) {
            binaryArray[i] = binaryString.charCodeAt(i);
        }
        resolve(new Blob([binaryArray], { type: 'image/png' }));
    });
}
function canvasToBlob(canvas) {
    if (canvas.toBlob) {
        return new Promise(function (resolve) { return canvas.toBlob(resolve); });
    }
    return toBlob(canvas);
}
exports.canvasToBlob = canvasToBlob;
function toArray(arrayLike) {
    var result = [];
    for (var i = 0, l = arrayLike.length; i < l; i += 1) {
        result.push(arrayLike[i]);
    }
    return result;
}
exports.toArray = toArray;
function px(node, styleProperty) {
    var val = window.getComputedStyle(node).getPropertyValue(styleProperty);
    return parseFloat(val.replace('px', ''));
}
function getNodeWidth(node) {
    var leftBorder = px(node, 'border-left-width');
    var rightBorder = px(node, 'border-right-width');
    return node.clientWidth + leftBorder + rightBorder;
}
exports.getNodeWidth = getNodeWidth;
function getNodeHeight(node) {
    var topBorder = px(node, 'border-top-width');
    var bottomBorder = px(node, 'border-bottom-width');
    return node.clientHeight + topBorder + bottomBorder;
}
exports.getNodeHeight = getNodeHeight;
function getPixelRatio() {
    var ratio;
    var FINAL_PROCESS;
    try {
        FINAL_PROCESS = process;
    }
    catch (e) { }
    var val = FINAL_PROCESS && FINAL_PROCESS.env
        ? FINAL_PROCESS.env.devicePixelRatio
        : null;
    if (val) {
        ratio = parseInt(val, 10);
        if (isNaN(ratio)) {
            ratio = 1;
        }
    }
    return ratio || window.devicePixelRatio || 1;
}
exports.getPixelRatio = getPixelRatio;
function createImage(url) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () { return resolve(image); };
        image.onerror = reject;
        image.crossOrigin = 'anonymous';
        image.src = url;
    });
}
exports.createImage = createImage;
function svgToDataURL(svg) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve()
                    .then(function () { return new XMLSerializer().serializeToString(svg); })
                    .then(encodeURIComponent)
                    .then(function (html) { return "data:image/svg+xml;charset=utf-8," + html; })];
        });
    });
}
exports.svgToDataURL = svgToDataURL;
function getBlobFromImageURL(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, createImage(url).then(function (image) {
                    var width = image.width, height = image.height;
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    var ratio = getPixelRatio();
                    canvas.width = width * ratio;
                    canvas.height = height * ratio;
                    canvas.style.width = "" + width;
                    canvas.style.height = "" + height;
                    context.scale(ratio, ratio);
                    context.drawImage(image, 0, 0);
                    var dataURL = canvas.toDataURL(getMimeType(url));
                    return getDataURLContent(dataURL);
                })];
        });
    });
}
exports.getBlobFromImageURL = getBlobFromImageURL;
//# sourceMappingURL=util.js.map