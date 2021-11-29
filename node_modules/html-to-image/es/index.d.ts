import { Options } from './options';
export declare function toSvg(domNode: HTMLElement, options?: Options): Promise<string>;
export declare const toSvgDataURL: typeof toSvg;
export declare function toCanvas(domNode: HTMLElement, options?: Options): Promise<HTMLCanvasElement>;
export declare function toPixelData(domNode: HTMLElement, options?: Options): Promise<Uint8ClampedArray>;
export declare function toPng(domNode: HTMLElement, options?: Options): Promise<string>;
export declare function toJpeg(domNode: HTMLElement, options?: Options): Promise<string>;
export declare function toBlob(domNode: HTMLElement, options?: Options): Promise<Blob | null>;
export declare function getWebFontEmbedCss(domNode: HTMLElement, options?: Options): Promise<string>;
