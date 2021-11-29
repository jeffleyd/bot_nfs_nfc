var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cloneNode } from './cloneNode';
import { embedImages } from './embedImages';
import { embedWebFonts, getWebFontCss } from './embedWebFonts';
import { createSvgDataURL } from './createSvgDataURL';
import { applyStyleWithOptions } from './applyStyleWithOptions';
import { delay, createImage, canvasToBlob, getNodeWidth, getNodeHeight, getPixelRatio, } from './util';
function getImageSize(domNode, options = {}) {
    const width = options.width || getNodeWidth(domNode);
    const height = options.height || getNodeHeight(domNode);
    return { width, height };
}
export function toSvg(domNode, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { width, height } = getImageSize(domNode, options);
        return cloneNode(domNode, options, true)
            .then((clonedNode) => embedWebFonts(clonedNode, options))
            .then((clonedNode) => embedImages(clonedNode, options))
            .then((clonedNode) => applyStyleWithOptions(clonedNode, options))
            .then((clonedNode) => createSvgDataURL(clonedNode, width, height));
    });
}
export const toSvgDataURL = toSvg;
export function toCanvas(domNode, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toSvg(domNode, options)
            .then(createImage)
            .then(delay(100))
            .then((image) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const ratio = options.pixelRatio || getPixelRatio();
            const { width, height } = getImageSize(domNode, options);
            const canvasWidth = options.canvasWidth || width;
            const canvasHeight = options.canvasHeight || height;
            canvas.width = canvasWidth * ratio;
            canvas.height = canvasHeight * ratio;
            canvas.style.width = `${canvasWidth}`;
            canvas.style.height = `${canvasHeight}`;
            if (options.backgroundColor) {
                context.fillStyle = options.backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            return canvas;
        });
    });
}
export function toPixelData(domNode, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { width, height } = getImageSize(domNode, options);
        return toCanvas(domNode, options).then((canvas) => {
            const ctx = canvas.getContext('2d');
            return ctx.getImageData(0, 0, width, height).data;
        });
    });
}
export function toPng(domNode, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toCanvas(domNode, options).then((canvas) => canvas.toDataURL());
    });
}
export function toJpeg(domNode, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toCanvas(domNode, options).then((canvas) => canvas.toDataURL('image/jpeg', options.quality || 1));
    });
}
export function toBlob(domNode, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toCanvas(domNode, options).then(canvasToBlob);
    });
}
export function getWebFontEmbedCss(domNode, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return getWebFontCss(domNode, options);
    });
}
//# sourceMappingURL=index.js.map