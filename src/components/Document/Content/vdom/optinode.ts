import { EL, stringh, ShapeView, Matrix } from "@kcdesign/data";
import { batchSetAttribute, createElement, elpatch } from "./patch";


export enum OptiType {
    'none', 'image'
}

const optiTypes = [OptiType.none, OptiType.image]

interface OptiRecordItem {
    el: HTMLElement | SVGElement,
    dirty?: boolean, // image & canvas
    canvas?: { // canvas
        loaded: boolean,
        imageel: SVGImageElement,
        ready: boolean,
    }
}

interface OptiRecords {
    [key: string]: OptiRecordItem
}

export type NodeType = ShapeView & EL & {
    el?: HTMLElement | SVGElement,
    optis?: {
        origin: HTMLElement | SVGElement,
        records: OptiRecords
    }
    canOptiNode: boolean,
    m_save_version: number,
    m_save_render: EL & { el?: HTMLElement | SVGElement },
}
// export const OPTI_NODE_COUNT = 3000;
// export const MAX_OPTI_LEVEL = 3;
const _2IMAGE_NODE_COUNT = 10; // 小于这个的不转成image了
const _2CANVAS_NODE_COUNT = 300; // 太大了需要用canvas

export function optiNode(_this: NodeType, optiType: 'image' | 'canvas', visible: boolean, focused: boolean, matrix: Matrix, _image?: {
    loaded: boolean,
    imageel: SVGImageElement
}): boolean | {
    loaded: boolean,
    imageel: SVGImageElement
} {
    // if (_this.optiel && (_this.optiel_type === 'none' || !_this.optiel_dirty)) return true;
    if (!_this.el || !_this.eltag) {
        return false;
    }

    if (visible && focused) {
        // todo keep
        // 
        unOptiNode(_this);
        return false;
    }
    const frame = _this.visibleFrame;
    if (frame.width === 0 || frame.height === 0) {
        opti2none(_this);
    }
    else if (visible) {
        return opti2image(_this, optiType, matrix, _image);
    } else {
        opti2none(_this);
    }

    // 这个是不显示
    return true;
}

export function opti2none(_this: NodeType) {
    if (!_this.el) throw new Error();
    if (!_this.optis) {
        _this.optis = { origin: _this.el, records: {} }
    }
    else if (_this.optis.records[OptiType.none]) {
        if (_this.el === _this.optis.records[OptiType.none].el) return;
    }
    else {
        _this.optis.records[OptiType.none] = {
            el: createElement(_this.eltag)
        }
    }
    if (_this.optis && _this.optis.records[OptiType.none]) {
        if (_this.el === _this.optis.records[OptiType.none].el) return;
    }

    const saveel = _this.el;
    _this.el = _this.optis.records[OptiType.none].el;

    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }

    // image dirty时需要删除；省内存
    if (_this.optis.records[OptiType.image] && _this.optis.records[OptiType.image].dirty) {
        delete _this.optis.records[OptiType.image];
    }
}

function opti2image(_this: NodeType, optiType: 'image' | 'canvas', matrix: Matrix, _image?: {
    loaded: boolean,
    imageel: SVGImageElement
}) {
    if (_this.nodeCount < _2IMAGE_NODE_COUNT) {
        unOptiNode(_this);
        return false;
    }
    // canvas还有些问题
    _opti2image(_this);
    return true;
    // else if (_this.nodeCount < _2CANVAS_NODE_COUNT) {
    //     _opti2image(_this);
    //     return true;
    // } else {
    //     return _opti2canvas(_this, matrix, _image);
    // }
}

function _opti2image(_this: NodeType) {

    let el = _this.el; // 当前在dom
    if (_this.optiel) {
        if (_this.optiel_type === 'image' && !_this.optiel_dirty) {
            if (el) el.style.display = 'block';
            return true;
        }
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

function _opti2canvas(_this: NodeType, matrix: Matrix, _image?: {
    loaded: boolean,
    imageel: SVGImageElement
}) {
    let el = _this.el; // 当前在dom
    if (_this.optiel) {
        if (_this.optiel_type === 'canvas' && !_this.optiel_dirty) {
            if (el) el.style.display = 'block';
            return true; // 优化完成
        }
        el = _this.optiel;
    }

    const image = _opti2canvasStep1(_this, el, _image);
    if (image.loaded) {
        _opti2canvasStep2(_this, el, matrix, image);
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

function _opti2canvasStep2(_this: NodeType, el: SVGElement | HTMLElement | undefined, matrix: Matrix, _image: {
    loaded: boolean,
    imageel: SVGImageElement
}) {
    // if (_this.optiel) {
    //     if (_this.optiel_type === 'canvas' && !_this.optiel_dirty) return;
    //     _this.el = _this.optiel;
    //     _this.optiel = undefined;
    // }

    const _matrix = matrix.clone();
    _matrix.multi(_this.transform.toArray());

    const frame = _this.visibleFrame;
    const wh = _matrix.computeRef(frame.width, frame.height);

    const canvas = createElement('canvas') as HTMLCanvasElement;
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(wh.x * scale);
    canvas.height = Math.floor(wh.y * scale);
    const canvasCtx = canvas.getContext('2d')!;
    // canvasCtx.scale(scale, scale);
    canvasCtx.scale(canvas.width / frame.width, canvas.height / frame.height);
    canvasCtx.drawImage(_image.imageel, 0, 0); // foreignObject会丢失
    const href = canvas.toDataURL();
    const props: any = {};
    _this.optiel = createElement('image');
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
    _this.optiel_type = 'canvas';

    if (saveel && saveel.parentNode) { // todo 不能立刻替换，会白屏
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
}

export function unOptiNode(_this: NodeType) {

    // todo image dirty时需要删除

    if (!_this.optiel) {
        if (_this.el) _this.el.style.display = 'block'
        return;
    }

    const saveel = _this.el;
    _this.el = _this.optiel;
    _this.optiel = undefined;
    _this.el.style.display = 'block'
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