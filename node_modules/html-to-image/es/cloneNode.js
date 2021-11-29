var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getBlobFromURL } from './getBlobFromURL';
import { clonePseudoElements } from './clonePseudoElements';
import { createImage, toArray, toDataURL, getMimeType } from './util';
function cloneSingleNode(node, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (node instanceof HTMLCanvasElement) {
            const dataURL = node.toDataURL();
            if (dataURL === 'data:,') {
                return Promise.resolve(node.cloneNode(false));
            }
            return createImage(dataURL);
        }
        if (node instanceof HTMLVideoElement && node.poster) {
            return Promise.resolve(node.poster)
                .then((url) => getBlobFromURL(url, options))
                .then((data) => toDataURL(data.blob, getMimeType(node.poster) || data.contentType))
                .then((dataURL) => createImage(dataURL));
        }
        return Promise.resolve(node.cloneNode(false));
    });
}
function cloneChildren(nativeNode, clonedNode, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const children = toArray(((_a = nativeNode.shadowRoot) !== null && _a !== void 0 ? _a : nativeNode).childNodes);
        if (children.length === 0) {
            return Promise.resolve(clonedNode);
        }
        return children
            .reduce((done, child) => done
            .then(() => cloneNode(child, options))
            .then((clonedChild) => {
            if (clonedChild) {
                clonedNode.appendChild(clonedChild);
            }
        }), Promise.resolve())
            .then(() => clonedNode);
    });
}
function decorate(nativeNode, clonedNode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(clonedNode instanceof Element)) {
            return clonedNode;
        }
        return Promise.resolve()
            .then(() => cloneCssStyle(nativeNode, clonedNode))
            .then(() => clonePseudoElements(nativeNode, clonedNode))
            .then(() => cloneInputValue(nativeNode, clonedNode))
            .then(() => clonedNode);
    });
}
function cloneCssStyle(nativeNode, clonedNode) {
    const source = window.getComputedStyle(nativeNode);
    const target = clonedNode.style;
    if (!target) {
        return;
    }
    if (source.cssText) {
        target.cssText = source.cssText;
    }
    else {
        toArray(source).forEach((name) => {
            target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
        });
    }
}
function cloneInputValue(nativeNode, clonedNode) {
    if (nativeNode instanceof HTMLTextAreaElement) {
        clonedNode.innerHTML = nativeNode.value;
    }
    if (nativeNode instanceof HTMLInputElement) {
        clonedNode.setAttribute('value', nativeNode.value);
    }
}
export function cloneNode(nativeNode, options, isRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isRoot && options.filter && !options.filter(nativeNode)) {
            return Promise.resolve(null);
        }
        return Promise.resolve(nativeNode)
            .then((clonedNode) => cloneSingleNode(clonedNode, options))
            .then((clonedNode) => cloneChildren(nativeNode, clonedNode, options))
            .then((clonedNode) => decorate(nativeNode, clonedNode));
    });
}
//# sourceMappingURL=cloneNode.js.map