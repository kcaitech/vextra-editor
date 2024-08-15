import { EL, stringh, ShapeView } from "@kcdesign/data";
import { batchSetAttribute, createElement, elpatch } from "./patch";


export type NodeType = ShapeView & EL & {
    el?: HTMLElement | SVGElement,
    optiel?: HTMLElement | SVGElement,
    hasOptiNode: boolean,
    m_save_version: number,
    m_save_render: EL & { el?: HTMLElement | SVGElement },
}
export const OPTI_NODE_COUNT = 1;
export const MAX_OPTI_LEVEL = 3;
const _2IMAGE_NODE_COUNT = 1; // 小于这个的不转成image了
const _2CANVAS_NODE_COUNT = 3000; // 太大了需要用canvas

export function optiNode(_this: NodeType, visible: boolean, focused: boolean, level: number) {
    if (_this.optiel) return;
    if (!_this.eltag) return;
    if (!_this.isVisible) return unOptiNode(_this);

    if (visible && focused) {
        return unOptiNode(_this);
    }
    if (visible) {
        return opti2image(_this);
    }

    _this.optiel = createElement(_this.eltag);

    const saveel = _this.el;
    _this.el = _this.optiel;
    _this.optiel = saveel;

    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
}

function opti2image(_this: NodeType) {
    if (!_this.isVisible) return unOptiNode(_this);
    if (_this.nodeCount < _2IMAGE_NODE_COUNT) return unOptiNode(_this);
    if (_this.nodeCount < _2CANVAS_NODE_COUNT) return _opti2canvas(_this);
    _opti2canvas(_this);
}

function _opti2image(_this: NodeType) {
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
    const svg = stringh('svg', svgprops, _this.el?.innerHTML.replaceAll("#", "%23"));
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
    _this.optiel = saveel;

    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
}

function _opti2canvas(_this: NodeType) {
    const frame = _this.visibleFrame;
    const svgprops: any = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        preserveAspectRatio: "xMinYMin meet",
        overflow: "hidden",
        viewbox: `${frame.x} ${frame.y} ${frame.width + 50} ${frame.height+ 50}`,
        width: frame.width + 50,
        height: frame.height + 50
    }
    const svg = stringh('svg', svgprops, _this.el?.innerHTML.replaceAll("#", "%23"));
    const href = "data:image/svg+xml," + svg;
    const imageel = createElement('image') as SVGImageElement;
    const imageprops: any = {};
    imageprops.href = href;
    imageprops.x = frame.x;
    imageprops.y = frame.y;
    imageprops.width = frame.width + 50;
    imageprops.height = frame.height + 50;
    batchSetAttribute(imageel, imageprops);

    const canvas = createElement('canvas') as HTMLCanvasElement;
    batchSetAttribute(canvas, { width: frame.width + 50, height: frame.height + 50 }); // todo 要获取当前缩放值，计算真实的显示大小
    const canvasCtx = canvas.getContext('2d')!;
    imageel.onload = () => {
        canvasCtx.drawImage(imageel, 0, 0);
    }

    _this.optiel = createElement('foreignObject');
    const props: any = {};
    props.x = frame.x;
    props.y = frame.y;
    props.width = frame.width;
    props.height = frame.height;
    Object.assign(props, _this.elattr);

    batchSetAttribute(_this.optiel, props);
    _this.optiel.appendChild(canvas);

    const saveel = _this.el;
    _this.el = _this.optiel;
    _this.optiel = saveel;

    if (saveel && saveel.parentNode) { // todo 不能立刻替换，会白屏
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
}

function unOptiNode(_this: NodeType) {
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
            // todo 检查下自己是否还在优化层级？
            const saveel = _this.el;
            _this.el = _this.optiel;
            _this.optiel = saveel;
            elpatch(_this, _this.m_save_render); // 这里才转化为html或者svg节点
            _this.optiel = _this.el;
            _this.el = saveel;
        } else {
            elpatch(_this, _this.m_save_render); // 这里才转化为html或者svg节点
        }
        _this.m_save_version = version;
        _this.m_save_render.reset(_this.eltag, _this.elattr, _this.elchilds);
        _this.m_save_render.el = _this.el;
    }
}