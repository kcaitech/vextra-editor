/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { EL } from "@kcaitech/vextra-core";
import _ from "lodash";

const xmlns = "http://www.w3.org/2000/svg";
const xlink = "http://www.w3.org/1999/xlink";
const xhtml = "http://www.w3.org/1999/xhtml";

const htmlelement: { [key: string]: 1 } = {
    'div': 1,
    'canvas': 1,
}

export function createElement(tag: string): HTMLElement | SVGElement {
    if (htmlelement[tag]) return document.createElement(tag);
    return document.createElementNS(xmlns, tag);
}

export function setAttribute(el: HTMLElement | SVGElement, key: string, value: (string | number) | { [key: string]: (string | number) }) {
    if (typeof value === 'object') {
        // parse value
        const attr = value as { [key: string]: string };

        let style = ""
        for (let b in attr) {
            style += b + ':' + attr[b] + ';';
        }

        value = style;
    }
    if (typeof value === 'number') value = String(value);
    if (key === "xlink:href" || key === "href") {
        el.setAttributeNS(xlink, key, value);
    } else {
        el.setAttribute(key, value);
    }
}

export function batchSetAttribute(el: HTMLElement | SVGElement, attrs: {
    [key: string]: (string | number) | { [key: string]: (string | number) }
}, oldattrs: { [key: string]: (string | number) | { [key: string]: (string | number) } } = {}) {
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
    } else {
        // todo 脱离文档更新？
    }

    // attr
    batchSetAttribute(_tar.el, _tar.elattr, _old?.elattr);

    // string
    if (!Array.isArray(_tar.elchilds)) {
        if (!_old || _old.elchilds !== _tar.elchilds) {
            _tar.el.innerHTML = (_tar.elchilds);
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
        if (!tchild.el) { // 子对象渲染完后，parent也需要渲染
            // 是可能的
            // throw new Error("something wrong");
            tchild.el = createElement('g');
            // continue;
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
    const _old = old as EL & { el?: HTMLElement | SVGElement } | undefined;
    const _tar = tar as EL & { el?: HTMLElement | SVGElement };
    
    // todo 待验证是否有用
    // let _tar_el: HTMLElement | SVGElement | undefined;
    // if (_tar.el) {
    //     _tar_el = _tar.el;
    //     _tar_el.style.display = 'none'
    // }

    // let _old_el: HTMLElement | SVGElement | undefined;
    // if (_old?.el) {
    //     _old_el = _old.el;
    //     _old_el.style.display = 'none'
    // }

    inner_elpatch(tar, old);

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

    // if (_tar_el) {
    //     _tar_el.style.display = ''
    // }
    // if (_old_el) {
    //     _old_el.style.display = ''
    // }
}