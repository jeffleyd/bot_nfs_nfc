import { uuid, toArray } from './util';
var Pseudo;
(function (Pseudo) {
    function clonePseudoElement(nativeNode, clonedNode, pseudo) {
        const style = window.getComputedStyle(nativeNode, pseudo);
        const content = style.getPropertyValue('content');
        if (content === '' || content === 'none') {
            return;
        }
        const className = uuid();
        // fix: Cannot assign to read only property 'className' of object '#<…
        try {
            clonedNode.className = `${clonedNode.className} ${className}`;
        }
        catch (err) {
            return;
        }
        const styleElement = document.createElement('style');
        styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));
        clonedNode.appendChild(styleElement);
    }
    Pseudo.clonePseudoElement = clonePseudoElement;
    function getPseudoElementStyle(className, pseudo, style) {
        const selector = `.${className}:${pseudo}`;
        const cssText = style.cssText
            ? formatCssText(style)
            : formatCssProperties(style);
        return document.createTextNode(`${selector}{${cssText}}`);
    }
    function formatCssText(style) {
        const content = style.getPropertyValue('content');
        return `${style.cssText} content: '${content.replace(/'|"/g, '')}';`;
    }
    function formatCssProperties(style) {
        return toArray(style)
            .map((name) => {
            const value = style.getPropertyValue(name);
            const priority = style.getPropertyPriority(name);
            return `${name}: ${value}${priority ? ' !important' : ''};`;
        })
            .join(' ');
    }
})(Pseudo || (Pseudo = {}));
export function clonePseudoElements(nativeNode, clonedNode) {
    const pseudos = [':before', ':after'];
    pseudos.forEach((pseudo) => Pseudo.clonePseudoElement(nativeNode, clonedNode, pseudo));
}
//# sourceMappingURL=clonePseudoElements.js.map