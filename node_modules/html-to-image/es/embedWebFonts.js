var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toArray } from './util';
import { shouldEmbed, embedResources } from './embedResources';
const cssFetchPromiseStore = {};
export function parseWebFontRules(clonedNode) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!clonedNode.ownerDocument) {
                reject(new Error('Provided element is not within a Document'));
            }
            resolve(toArray(clonedNode.ownerDocument.styleSheets));
        })
            .then((styleSheets) => getCssRules(styleSheets))
            .then(getWebFontRules);
    });
}
export function embedWebFonts(clonedNode, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return (options.fontEmbedCss != null
            ? Promise.resolve(options.fontEmbedCss)
            : getWebFontCss(clonedNode, options)).then((cssString) => {
            const styleNode = document.createElement('style');
            const sytleContent = document.createTextNode(cssString);
            styleNode.appendChild(sytleContent);
            if (clonedNode.firstChild) {
                clonedNode.insertBefore(styleNode, clonedNode.firstChild);
            }
            else {
                clonedNode.appendChild(styleNode);
            }
            return clonedNode;
        });
    });
}
export function getWebFontCss(node, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return parseWebFontRules(node)
            .then((rules) => Promise.all(rules.map((rule) => {
            const baseUrl = rule.parentStyleSheet
                ? rule.parentStyleSheet.href
                : null;
            return embedResources(rule.cssText, baseUrl, options);
        })))
            .then((cssStrings) => cssStrings.join('\n'));
    });
}
export function getCssRules(styleSheets) {
    return __awaiter(this, void 0, void 0, function* () {
        const ret = [];
        const promises = [];
        // First loop inlines imports
        styleSheets.forEach((sheet) => {
            if ('cssRules' in sheet) {
                try {
                    toArray(sheet.cssRules).forEach((item, index) => {
                        if (item.type === CSSRule.IMPORT_RULE) {
                            let importIndex = index + 1;
                            promises.push(fetchCSS(item.href, sheet)
                                .then(embedFonts)
                                .then((cssText) => {
                                const parsed = parseCSS(cssText);
                                parsed.forEach((rule) => {
                                    try {
                                        sheet.insertRule(rule, rule.startsWith('@import')
                                            ? (importIndex = importIndex + 1)
                                            : sheet.cssRules.length);
                                    }
                                    catch (error) {
                                        console.log('Error inserting rule from remote css', {
                                            rule,
                                            error,
                                        });
                                    }
                                });
                            })
                                .catch((e) => {
                                console.log('Error loading remote css', e.toString());
                            }));
                        }
                    });
                }
                catch (e) {
                    const inline = styleSheets.find((a) => a.href === null) || document.styleSheets[0];
                    if (sheet.href != null) {
                        promises.push(fetchCSS(sheet.href, inline)
                            .then(embedFonts)
                            .then((cssText) => {
                            const parsed = parseCSS(cssText);
                            parsed.forEach((rule) => {
                                inline.insertRule(rule, sheet.cssRules.length);
                            });
                        })
                            .catch((e) => {
                            console.log('Error loading remote stylesheet', e.toString());
                        }));
                    }
                    console.log('Error inlining remote css file', e.toString());
                }
            }
        });
        return Promise.all(promises).then(() => {
            // Second loop parses rules
            styleSheets.forEach((sheet) => {
                if ('cssRules' in sheet) {
                    try {
                        toArray(sheet.cssRules).forEach((item) => {
                            ret.push(item);
                        });
                    }
                    catch (e) {
                        console.log(`Error while reading CSS rules from ${sheet.href}`, e.toString());
                    }
                }
            });
            return ret;
        });
    });
}
function getWebFontRules(cssRules) {
    return cssRules
        .filter((rule) => rule.type === CSSRule.FONT_FACE_RULE)
        .filter((rule) => shouldEmbed(rule.style.getPropertyValue('src')));
}
function parseCSS(source) {
    if (source === undefined) {
        return [];
    }
    let cssText = source;
    const css = [];
    const cssKeyframeRegex = '((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
    const combinedCSSRegex = '((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' +
        '*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})'; // to match css & media queries together
    const cssCommentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
    const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
    // strip out comments
    cssText = cssText.replace(cssCommentsRegex, '');
    const keyframesRegex = new RegExp(cssKeyframeRegex, 'gi');
    let arr;
    while (true) {
        arr = keyframesRegex.exec(cssText);
        if (arr === null) {
            break;
        }
        css.push(arr[0]);
    }
    cssText = cssText.replace(keyframesRegex, '');
    // unified regex
    const unified = new RegExp(combinedCSSRegex, 'gi');
    while (true) {
        arr = importRegex.exec(cssText);
        if (arr === null) {
            arr = unified.exec(cssText);
            if (arr === null) {
                break;
            }
            else {
                importRegex.lastIndex = unified.lastIndex;
            }
        }
        else {
            unified.lastIndex = importRegex.lastIndex;
        }
        css.push(arr[0]);
    }
    return css;
}
function fetchCSS(url, sheet) {
    if (cssFetchPromiseStore[url]) {
        return cssFetchPromiseStore[url];
    }
    const promise = fetch(url).then((res) => {
        return {
            url,
            cssText: res.text(),
        };
    }, (e) => {
        console.log('ERROR FETCHING CSS: ', e.toString());
    });
    cssFetchPromiseStore[url] = promise;
    return promise;
}
function embedFonts(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return data.cssText.then((resolved) => {
            let cssText = resolved;
            const regexUrlFind = /url\(["']?([^"')]+)["']?\)/g;
            const fontLocations = cssText.match(/url\([^)]+\)/g) || [];
            const fontLoadedPromises = fontLocations.map((location) => {
                let url = location.replace(regexUrlFind, '$1');
                if (!url.startsWith('https://')) {
                    const source = data.url;
                    url = new URL(url, source).href;
                }
                return new Promise((resolve, reject) => {
                    fetch(url)
                        .then((res) => res.blob())
                        .then((blob) => {
                        const reader = new FileReader();
                        reader.addEventListener('load', (res) => {
                            // Side Effect
                            cssText = cssText.replace(location, `url(${reader.result})`);
                            resolve([location, reader.result]);
                        });
                        reader.readAsDataURL(blob);
                    })
                        .catch(reject);
                });
            });
            return Promise.all(fontLoadedPromises).then(() => cssText);
        });
    });
}
//# sourceMappingURL=embedWebFonts.js.map