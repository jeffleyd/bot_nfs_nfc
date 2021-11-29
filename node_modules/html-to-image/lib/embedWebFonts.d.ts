import { Options } from './options';
export declare function parseWebFontRules(clonedNode: HTMLElement): Promise<CSSRule[]>;
export declare function embedWebFonts(clonedNode: HTMLElement, options: Options): Promise<HTMLElement>;
export declare function getWebFontCss(node: HTMLElement, options: Options): Promise<string>;
export declare function getCssRules(styleSheets: CSSStyleSheet[]): Promise<CSSStyleRule[]>;
