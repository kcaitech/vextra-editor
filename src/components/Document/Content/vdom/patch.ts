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

function elpatch(nu: EL, old: EL | undefined): EL {
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
            elpatch(c, undefined);
            _nu.el.appendChild(c.el!);
        }
        if (_old) _old.recycle();
        return _nu;
    }

    // 可以复用
    // attr
    _nu.el = _old.el;
    const nkeys = Object.keys(_nu.attr);
    const okeys = Object.keys(_old.attr);
    for (let i = 0; i < nkeys.length; i++) {
        const key = nkeys[i];
        const ov = _old.attr[key];
        const cv = _nu.attr[key];
        if (ov !== cv) {
            setAttribute(_nu.el, key, cv);
        }
    }
    for (let i = 0; i < okeys.length; i++) {
        const key = okeys[i];
        if (nkeys.indexOf(key) < 0) {
            _nu.el.removeAttribute(key);
        }
    }

    // childs
    for (let i = 0; i < _nu.childs.length; i++) { // 简单比较
        const uc = _nu.childs[i] as EL & { el?: HTMLElement | SVGElement };
        const oc = _old.childs[i] as EL & { el?: HTMLElement | SVGElement };
        elpatch(uc, oc);
        if (!uc.el) {
            // uc.recycle(); // 因为view层数据缓存，新的不可回收
            throw new Error("something wrong");
        }
        if (oc) { // index 相同
            if (oc.el !== uc.el) _nu.el.replaceChild(uc.el, oc.el!);
        }
        else {
            if (_old.childs.length > i) throw new Error("something wrong");
            _nu.el.appendChild(uc.el);
        }
    }
    if (_old.childs.length > _nu.childs.length) {
        let count = _old.childs.length - _nu.childs.length;
        while (count--) _nu.el.removeChild(_nu.el.childNodes[_nu.el.childNodes.length - 1]);
    }

    _old.recycle();

    return _nu;
}

interface ShapeDom extends ShapeView {
    el?: HTMLElement | SVGElement;
    bind(node: HTMLElement /* old, for reuse */): void;
    unbind(): void;
}


type RResult = { tag: string, attr: { [key: string]: string }, childs: (ShapeView | EL)[] }
// function dompatch(nu: ShapeView, old: ShapeView | undefined) {
//     const r = nu.render();
//     if (!r) {
//         (nu as ShapeDom).unbind();
//     }
//     else {
//         patch((nu as ShapeDom).el, r as RResult, old?.render() as RResult);
//     }
// }

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
    // const reuse = new Map<string, ShapeView>();
    // if (oldRr) {
    //     oldRr.childs.forEach(c => { if (c instanceof ShapeView) reuse.set(c.id(), c) });
    // }

    const pel = el;

    let idx = 0;
    rr.childs.forEach((c) => {
        let cel: HTMLElement | SVGElement | undefined;
        if (c instanceof ShapeView) {
            // const old = reuse.get(c.id());
            // todo
            // dompatch(c, old);
            c.render(); // todo ??
            cel = (c as ShapeDom).el;

        }
        else {
            // 
            const old = oldRr?.childs[idx] as EL & { el?: HTMLElement | SVGElement };
            elpatch(c, old);
            cel = (c as EL & { el?: HTMLElement | SVGElement }).el;
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