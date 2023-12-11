import { EL, ShapeView } from "@kcdesign/data";
const xmlns = "http://www.w3.org/2000/svg";
const xlink = "http://www.w3.org/1999/xlink";
const xhtml = "http://www.w3.org/1999/xhtml";

function createElement(tag: string): HTMLElement | SVGElement {
    if (tag === "foreignObject") return document.createElement(tag);
    if (tag === "div") return document.createElement("div");
    return document.createElementNS(xmlns, tag);
}

function setAttribute(el: HTMLElement | SVGElement, key: string, value: string) {
    if (key === "xlink:href") {
        el.setAttributeNS(xlink, key, value);
    } else {
        el.setAttribute(key, value);
    }
}

function elpatch(old: EL | undefined, nu: EL): EL {
    const _old = old as EL & { el?: HTMLElement | SVGElement };
    const _nu = nu as EL & { el?: HTMLElement | SVGElement };
    if (!_old || !_old.el || _old.tag !== _nu.tag) {
        _nu.el = createElement(_nu.tag);
        if (!_nu.el) throw new Error("can not create element: " + _nu.tag);
        for (let key in _nu.attr) {
            setAttribute(_nu.el, key, _nu.attr[key]);
        }
        for (let i = 0; i < _nu.childs.length; i++) {
            const c = _nu.childs[i] as EL & { el?: HTMLElement | SVGElement };
            elpatch(undefined, c);
            _nu.el.appendChild(c.el!);
        }
        if (_old) _old.recycle();
        return _nu;
    }

    // attr
    const nkeys = Object.keys(_nu.attr);
    const okeys = Object.keys(_old.attr);
    for (let i = 0; i < nkeys.length; i++) {
        const key = nkeys[i];
        const ov = _old.attr[key];
        const cv = _nu.attr[key];
        if (ov !== cv) {
            setAttribute(_old.el, key, cv);
        }
    }
    for (let i = 0; i < okeys.length; i++) {
        const key = okeys[i];
        if (nkeys.indexOf(key) < 0) {
            _old.el.removeAttribute(key);
        }
    }
    _old.attr = _nu.attr;

    // childs
    const childs = [];
    for (let i = 0; i < _nu.childs.length; i++) { // 简单比较
        const uc = _nu.childs[i] as EL & { el?: HTMLElement | SVGElement };
        const oc = _old.childs[i] as EL & { el?: HTMLElement | SVGElement };
        elpatch(oc, uc);
        if (!uc.el) {
            uc.recycle();
            // 使用旧的el
            childs.push(oc);
            continue;
        }
        childs.push(uc);
        if (oc) {
            _old.el.replaceChild(uc.el, oc.el!);
        }
        else {
            if (_old.childs.length > i) throw new Error("something wrong");
            _old.el.appendChild(uc.el);
        }
    }
    if (_old.childs.length > _nu.childs.length) {
        let count = _nu.childs.length - _old.childs.length;
        for (let i = 0; i < count; i++) {
            (_old.childs[_old.childs.length - 1 - i].recycle());
        }
        while (count--) _old.el.removeChild(_old.el.childNodes[_old.el.childNodes.length - 1]);
    }
    _old.childs = childs;

    return _old;
}

interface ShapeDom extends ShapeView {
    el?: HTMLElement | SVGElement;
    bind(node: HTMLElement /* old, for reuse */): void;
    unbind(): void;
}


type RResult = { tag: string, attr: { [key: string]: string }, childs: (ShapeView | EL)[] }
function dompatch(old: ShapeView | undefined, nu: ShapeView) {
    const r = nu.render();
    if (!r) {
        (nu as ShapeDom).unbind();
    }
    else {
        patch((nu as ShapeDom).el, r as RResult, old?.render() as RResult);
    }
}

export function patch(el: HTMLElement | SVGElement | undefined, rr: RResult | undefined, oldRr: RResult | undefined): HTMLElement | SVGElement | undefined {

    // todo
    if (!rr) {
        // return el;
        if (el) el.remove();
        return;
    }

    // patch attr
    if (!el) {
        el = createElement(rr.tag);
        Object.keys(rr.attr).forEach((key) => {
            setAttribute(el!, key, rr.attr[key]);
        });
    }
    else {
        const saveprops = oldRr?.attr || {};
        const nkeys = Object.keys(rr.attr);
        const okeys = Object.keys(saveprops);
        for (let i = 0; i < nkeys.length; i++) {
            const key = nkeys[i];
            const ov = saveprops[key];
            const cv = rr.attr[key];
            if (ov !== cv) {
                setAttribute(el, key, cv);
            }
        }
        for (let i = 0; i < okeys.length; i++) {
            const key = okeys[i];
            if (nkeys.indexOf(key) < 0) {
                el.removeAttribute(key);
            }
        }
    }

    // patch childs
    const reuse = new Map<string, ShapeView>();
    if (oldRr) {
        oldRr.childs.forEach(c => { if (c instanceof ShapeView) reuse.set(c.id(), c) });
    }

    const pel = el;

    let idx = 0;
    rr.childs.forEach((c) => {
        let cel: HTMLElement | SVGElement | undefined;
        if (c instanceof ShapeView) {
            const old = reuse.get(c.id());
            dompatch(old, c);
            cel = (c as ShapeDom).el;
            
        }
        else {
            // 
            const old = oldRr?.childs[idx] as EL & { el?: HTMLElement | SVGElement };
            const _c = elpatch(old, c) as EL & { el?: HTMLElement | SVGElement };
            cel = _c.el;
        }

        if (!cel) {
            // // index
        }
        else if (pel.childNodes[idx] === cel) {
            // 
            ++idx;
        }
        else if (pel.childNodes[idx]) {
            pel.insertBefore(cel, pel.childNodes[idx]);
            ++idx;
        }
        else {
            pel.appendChild(cel);
            ++idx;
        }
    });

    while (pel.childNodes[idx]) {
        pel.removeChild(pel.childNodes[pel.childNodes.length - 1]);
    }

    return el;
}