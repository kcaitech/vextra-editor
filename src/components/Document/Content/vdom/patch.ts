import { EL, ShapeView } from "@kcdesign/data";
const xmlns = "http://www.w3.org/2000/svg";
const xlink = "http://www.w3.org/1999/xlink";
const xhtml = "http://www.w3.org/1999/xhtml";

function createElement(tag: string): HTMLElement | SVGElement {
    if (tag === "foreignObject") return document.createElement(tag);
    if (tag === "div") return document.createElement("div");
    return document.createElementNS(xmlns, tag);
}

function setAttribute(el: HTMLElement | SVGElement, key: string, value: string | { [key: string]: string }) {
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

export function elpatch(tar: EL, old: EL | undefined) {
    const _old = old as EL & { el?: HTMLElement | SVGElement } | undefined;
    const _tar = tar as EL & { el?: HTMLElement | SVGElement };

    if (_tar === _old && _tar.el) return;

    if (_tar.tag.length === 0) {
        _tar.el = undefined;
        return;
    }

    if (!_tar.el) {
        if (_old && _old.el && _old.tag === _tar.tag) {
            _tar.el = _old.el;
        }
        else {
            _tar.el = createElement(_tar.tag);
            if (!_tar.el) throw new Error("can not create element: " + _tar.tag);
        }
    }

    // attr
    const tkeys = Object.keys(_tar.attr);
    const okeys = Object.keys(_old?.attr || {});
    for (let i = 0; i < tkeys.length; i++) {
        const k = tkeys[i];
        const oval = _old?.attr[k];
        const tval = _tar.attr[k];
        if (oval !== tval) {
            setAttribute(_tar.el, k, tval);
        }
    }
    for (let i = 0; i < okeys.length; i++) {
        const key = okeys[i];
        if (tkeys.indexOf(key) < 0) {
            _tar.el.removeAttribute(key);
        }
    }

    // string
    if (!Array.isArray(_tar.childs)) {
        _tar.el.innerHTML = _tar.childs;
        // const childNodes = _tar.el.childNodes;
        // if (childNodes.length > 0) {
        //     let count = childNodes.length;
        //     while (count--) _tar.el.removeChild(childNodes[childNodes.length - 1]);
        // }
        return;
    }

    const reuse = new Map<string, EL & { el?: HTMLElement | SVGElement }>();
    if (_old && Array.isArray(_old.childs)) _old.childs.forEach(c => {
        if (c.isViewNode) reuse.set((c as ShapeView).id, c);
    });

    const getResue = (tchild: EL, _old: EL | undefined, i: number) => {
        const r = tchild.isViewNode ? reuse.get((tchild as ShapeView).id) : undefined;
        return r || _old?.childs[i];
    }

    // childs
    let idx = 0;
    for (let i = 0; i < _tar.childs.length; i++) { // 简单比较
        const tchild = _tar.childs[i] as EL & { el?: HTMLElement | SVGElement };
        const ochild = getResue(tchild, _old, i) as EL & { el?: HTMLElement | SVGElement };
        elpatch(tchild, ochild);
        if (!tchild.el) {
            // 是可能的
            // throw new Error("something wrong");
            continue;
        }
        const childNodes = _tar.el.childNodes;
        if (childNodes[idx] === tchild.el) {
            //
        }
        else if (childNodes[idx]) {
            _tar.el.insertBefore(tchild.el, childNodes[idx]);
        }
        else {
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

    return _tar;
}
