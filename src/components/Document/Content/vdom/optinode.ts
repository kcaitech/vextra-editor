import { EL, stringh, ShapeView } from "@kcdesign/data";
import { batchSetAttribute, createElement, elpatch } from "./patch";


export type NodeType = ShapeView & EL & {
    el?: HTMLElement | SVGElement,
    optiel?: HTMLElement | SVGElement,
    optiel_type?: 'none' | 'image' | 'canvas' | 'canvas_pre',
    optiel_dirty?: boolean,
    canOptiNode: boolean,
    m_save_version: number,
    m_save_render: EL & { el?: HTMLElement | SVGElement },
}
// export const OPTI_NODE_COUNT = 3000;
// export const MAX_OPTI_LEVEL = 3;
const _2IMAGE_NODE_COUNT = 10; // 小于这个的不转成image了
const _2CANVAS_NODE_COUNT = 300; // 太大了需要用canvas


export function optiNode(_this: NodeType, optiType: 'image' | 'canvas', visible: boolean, focused: boolean, _image?: {
    loaded: boolean,
    imageel: SVGImageElement
}): boolean | {
    loaded: boolean,
    imageel: SVGImageElement
} {
    if (_this.optiel && (_this.optiel_type === 'none' || !_this.optiel_dirty)) return true;
    if (!_this.eltag) {
        return false;
    }

    if (visible && focused) {
        unOptiNode(_this);
        return false;
    }
    if (visible) {
        return opti2image(_this, optiType, _image);
    } else {
        opti2none(_this);
    }

    // 这个是不显示
    return true;
}

export function opti2none(_this: NodeType) {
    if (_this.optiel) {
        if (_this.optiel_type === 'none') return;
        _this.el = _this.optiel;
        _this.optiel = undefined;
    }

    _this.optiel = createElement(_this.eltag);
    _this.optiel_dirty = undefined;
    _this.optiel_type = 'none';
    const saveel = _this.el;
    _this.el = _this.optiel;
    _this.optiel = saveel;

    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
}

function opti2image(_this: NodeType, optiType: 'image' | 'canvas', _image?: {
    loaded: boolean,
    imageel: SVGImageElement
}) {
    if (_this.nodeCount < _2IMAGE_NODE_COUNT) {
        unOptiNode(_this);
        return false;
    }
     else if (_this.nodeCount < _2CANVAS_NODE_COUNT) {
        _opti2image(_this);
        return true;
    } else {
        return _opti2canvas(_this, _image);
    }
}

function _opti2image(_this: NodeType) {

    let el = _this.el; // 当前在dom
    if (_this.optiel) {
        if (_this.optiel_type === 'image' && !_this.optiel_dirty) return true;
        el = _this.optiel;
    }

    // 打包成svg
    const frame = _this.visibleFrame;
    const svgprops: any = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        preserveAspectRatio: "xMinYMin meet",
        overflow: "visible", // 阴影可能在外面，或者说visibleFrame现在计算的还不对
        viewbox: `${frame.x} ${frame.y} ${frame.width} ${frame.height}`,
        width: frame.width,
        height: frame.height
    }
    const svg = stringh('svg', svgprops, el?.innerHTML.replaceAll("#", "%23"));
    const href = "data:image/svg+xml," + svg;
    _this.optiel = createElement('image');
    const props: any = {};
    props.href = href;
    props.x = frame.x;
    props.y = frame.y;
    props.width = frame.width;
    props.height = frame.height;
    Object.assign(props, _this.elattr);
    batchSetAttribute(_this.optiel, props);

    const saveel = _this.el;
    _this.el = _this.optiel;
    _this.optiel = el;
    _this.optiel_dirty = undefined;
    _this.optiel_type = 'image';
    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
    return true;
}

function _opti2canvas(_this: NodeType, _image?: {
    loaded: boolean,
    imageel: SVGImageElement
}) {
    let el = _this.el; // 当前在dom
    if (_this.optiel) {
        if (_this.optiel_type === 'canvas' && !_this.optiel_dirty) return true; // 优化完成
        el = _this.optiel;
    }

    const image = _opti2canvasStep1(_this, el, _image);
    if (image.loaded) {
        _opti2canvasStep2(_this, el, image);
        return true;
    }
    return image;
}

function _opti2canvasStep1(_this: NodeType, el: SVGElement | HTMLElement | undefined, _image?: {
    loaded: boolean,
    imageel: SVGImageElement
}): {
    loaded: boolean,
    imageel: SVGImageElement
} {
    if (_image && _this.optiel_type === 'canvas_pre' && !_this.optiel_dirty) return _image; // 优化完成

    const frame = _this.visibleFrame;
    const svgprops: any = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        preserveAspectRatio: "xMinYMin meet",
        overflow: "hidden",
        viewbox: `${frame.x} ${frame.y} ${frame.width} ${frame.height}`,
        width: frame.width,
        height: frame.height
    }
    const svg = stringh('svg', svgprops, el?.innerHTML.replaceAll("#", "%23"));
    const href = "data:image/svg+xml," + svg;
    const imageel = createElement('image') as SVGImageElement;
    const imageprops: any = {};
    imageprops.href = href;
    imageprops.x = frame.x;
    imageprops.y = frame.y;
    imageprops.width = frame.width;
    imageprops.height = frame.height;
    batchSetAttribute(imageel, imageprops);
    const ret = {
        loaded: false,
        imageel
    }
    imageel.onload = () => {
        ret.loaded = true;
    }
    _this.optiel_type = 'canvas_pre';
    _this.optiel_dirty = undefined;
    return ret;
}

function _opti2canvasStep2(_this: NodeType, el: SVGElement | HTMLElement | undefined, _image: {
    loaded: boolean,
    imageel: SVGImageElement
}) {
    // if (_this.optiel) {
    //     if (_this.optiel_type === 'canvas' && !_this.optiel_dirty) return;
    //     _this.el = _this.optiel;
    //     _this.optiel = undefined;
    // }

    const frame = _this.visibleFrame;
    const canvas = createElement('canvas') as HTMLCanvasElement;
    batchSetAttribute(canvas, { width: frame.width, height: frame.height }); // todo 要获取当前缩放值，计算真实的显示大小
    const canvasCtx = canvas.getContext('2d')!;

    // 判断是否cancel掉了

    canvasCtx.drawImage(_image.imageel, 0, 0); // foreignObject会丢失
    const href = canvas.toDataURL();
    const props: any = {};
    _this.optiel = createElement('image');
    props.href = href;

    // _this.optiel = createElement('foreignObject');
    // _this.optiel.appendChild(canvas);

    props.x = frame.x;
    props.y = frame.y;
    props.width = frame.width;
    props.height = frame.height;
    Object.assign(props, _this.elattr);
    batchSetAttribute(_this.optiel, props);

    const saveel = _this.el;
    _this.el = _this.optiel;
    _this.optiel = el;

    _this.optiel_dirty = undefined;
    _this.optiel_type = 'canvas';

    if (saveel && saveel.parentNode) { // todo 不能立刻替换，会白屏
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
}

export function unOptiNode(_this: NodeType) {
    if (!_this.optiel) return;

    const saveel = _this.el;
    _this.el = _this.optiel;
    _this.optiel = undefined;

    if (saveel && saveel.parentNode && _this.el) {
        saveel.parentNode.replaceChild(_this.el, saveel);
    }
}

export function optiRender(_this: NodeType, version: number) {
    if (version !== _this.m_save_version || !_this.el) {
        if (_this.optiel) {
            // todo
            // todo 检查下自己是否还在优化层级？
            const saveel = _this.el;
            _this.el = _this.optiel;
            _this.optiel = saveel;
            elpatch(_this, _this.m_save_render); // 这里才转化为html或者svg节点
            _this.optiel = _this.el;
            _this.el = saveel;
            _this.optiel_dirty = true;
        } else {
            elpatch(_this, _this.m_save_render); // 这里才转化为html或者svg节点
        }
        _this.m_save_version = version;
        _this.m_save_render.reset(_this.eltag, _this.elattr, _this.elchilds);
        _this.m_save_render.el = _this.el;
    }
}