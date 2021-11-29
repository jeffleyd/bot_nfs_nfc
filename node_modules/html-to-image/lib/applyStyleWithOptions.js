"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStyleWithOptions = void 0;
function applyStyleWithOptions(clonedNode, options) {
    var style = clonedNode.style;
    if (options.backgroundColor) {
        style.backgroundColor = options.backgroundColor;
    }
    if (options.width) {
        style.width = options.width + "px";
    }
    if (options.height) {
        style.height = options.height + "px";
    }
    var manual = options.style;
    if (manual != null) {
        Object.keys(manual).forEach(function (key) {
            // @ts-expect-error
            style[key] = manual[key];
        });
    }
    return clonedNode;
}
exports.applyStyleWithOptions = applyStyleWithOptions;
//# sourceMappingURL=applyStyleWithOptions.js.map