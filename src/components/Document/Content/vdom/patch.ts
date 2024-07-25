import { EL, ShapeView } from "@kcdesign/data";
import _ from "lodash";

const xmlns = "http://www.w3.org/2000/svg";
const xlink = "http://www.w3.org/1999/xlink";
const xhtml = "http://www.w3.org/1999/xhtml";

export function createElement(tag: string): HTMLElement | SVGElement {
    // if (tag === "foreignObject") return document.createElement("foreignObject");
    if (tag === "div") return document.createElement("div");
    return document.createElementNS(xmlns, tag);
}

export function setAttribute(el: HTMLElement | SVGElement, key: string, value: string | { [key: string]: string }) {
    if (typeof value === 'object') {
        // parse value
        const attr = value as { [key: string]: string };

        let style = ""
        for (let b in attr) {
            style += b + ':' + attr[b] + ';';
        }

        value = style;
    }
    if (key === "xlink:href" || key === "href") {
        el.setAttributeNS(xlink, key, value);
    } else {
        el.setAttribute(key, value);
    }
}

export function batchSetAttribute(el: HTMLElement | SVGElement, attrs: {
    [key: string]: string | { [key: string]: string }
}, oldattrs: { [key: string]: string | { [key: string]: string } } = {}) {
    const tkeys = Object.keys(attrs);
    const okeys = Object.keys(oldattrs);
    for (let i = 0; i < tkeys.length; i++) {
        const k = tkeys[i];
        const oval = oldattrs[k];
        const tval = attrs[k];
        if (oval !== tval) {
            setAttribute(el, k, tval);
        }
    }
    for (let i = 0; i < okeys.length; i++) {
        const key = okeys[i];
        if (tkeys.indexOf(key) < 0) {
            el.removeAttribute(key);
        }
    }
}

const _escapeChars: { [key: string]: string } = {};
_escapeChars['<'] = '&lt;';
_escapeChars['>'] = '&gt;';
_escapeChars['&'] = '&amp;';

function escapeWebChar(text: string) {
    const ret: string[] = [];
    let i = 0, j = 0, len = text.length;
    for (; i < len; ++i) {
        const e = _escapeChars[text[i]];
        if (e) {
            if (i > j) ret.push(text.substring(j, i));
            ret.push(e);
            j = i + 1;
        }
    }
    if (ret.length > 0) {
        if (i > j) ret.push(text.substring(j, i));
        return ret.join('');
    }
    return text;
}

function inner_elpatch(tar: EL, old: EL | undefined) {
    let _old = old as EL & { el?: HTMLElement | SVGElement } | undefined;
    const _tar = tar as EL & { el?: HTMLElement | SVGElement };

    if (_tar === _old && _tar.el) return;

    if (_tar.eltag.length === 0) {
        _tar.el = undefined;
        return;
    }

    if (!_tar.el) {
        if (_old && _old.el && _old.eltag === _tar.eltag) { // 也是要判断下的
            _tar.el = _old.el;
        } else {
            _tar.el = createElement(_tar.eltag);
            if (!_tar.el) throw new Error("can not create element: " + _tar.eltag);
            _old = undefined;
        }
    } else if (_tar.el.tagName !== _tar.eltag) {
        const el = createElement(_tar.eltag);
        if (!el) throw new Error("can not create element: " + _tar.eltag);
        // if (_tar.el.parentNode) {
        //     _tar.el.parentNode.replaceChild(el, _tar.el);
        // }
        _tar.el = el;
        _old = undefined;
    }

    // attr
    batchSetAttribute(_tar.el, _tar.elattr, _old?.elattr);

    // string
    if (!Array.isArray(_tar.elchilds)) {
        if (!_old || _old.elchilds !== _tar.elchilds) {
            _tar.el.innerHTML = escapeWebChar(_tar.elchilds);
        }
        return;
    }

    // const reuse = new Map<string, EL & { el?: HTMLElement | SVGElement }>();
    // if (_old && Array.isArray(_old.elchilds)) _old.elchilds.forEach(c => {
    //     if (c.isViewNode) reuse.set((c as ShapeView).id, c);
    // });

    const getResue = (tchild: EL, _old: EL, i: number) => {
        if (!Array.isArray(_old.elchilds)) return undefined;
        const oldchild = _old.elchilds[i];
        if (!oldchild || oldchild.isViewNode) return undefined; // view节点不能用于普通节点的复用
        return oldchild.eltag === tchild.eltag ? oldchild : undefined;
    }

    // childs
    let idx = 0;
    for (let i = 0; i < _tar.elchilds.length; i++) { // 简单比较
        const tchild = _tar.elchilds[i] as EL & { el?: HTMLElement | SVGElement };
        if (!tchild.isViewNode) {
            const ochild = _old && getResue(tchild, _old, i) as (EL & { el?: HTMLElement | SVGElement }) | undefined;
            inner_elpatch(tchild, ochild); // 由view节点自己patch
        }
        if (!tchild.el) {
            // 是可能的
            // throw new Error("something wrong");
            continue;
        }
        const childNodes = _tar.el.childNodes;
        if (childNodes[idx] === tchild.el) {
            //
        } else if (childNodes[idx]) {
            _tar.el.insertBefore(tchild.el, childNodes[idx]);
        } else {
            _tar.el.appendChild(tchild.el);
        }
        ++idx;
    }
    const childNodes = _tar.el.childNodes;
    if (childNodes.length > idx) {
        let count = childNodes.length - idx;
        while (count--) _tar.el.removeChild(childNodes[childNodes.length - 1]);
    }

    // _old?.recycle((el: EL) => {
    //     (el as EL & { el?: HTMLElement | SVGElement }).el = undefined;
    // });

}

export function elpatch(tar: EL, old: EL | undefined) {
    inner_elpatch(tar, old);

    const _old = old as EL & { el?: HTMLElement | SVGElement } | undefined;
    const _tar = tar as EL & { el?: HTMLElement | SVGElement };
    if (!_tar.el?.parentNode && _old?.el?.parentNode) { // 未加入到dom
        const newel = _tar.el;
        const oldel = _old?.el!;
        const p = oldel?.parentNode!;
        if (newel === oldel) {
            // nothing
        } else if (newel) {
            p.replaceChild(newel, oldel);
        } else {
            p.removeChild(oldel);
        }
    }
}