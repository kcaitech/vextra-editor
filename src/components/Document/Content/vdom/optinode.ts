import { EL, stringh, ShapeView, Matrix } from "@kcdesign/data";
import { batchSetAttribute, createElement, elpatch } from "./patch";


export enum OptiType {
    'none', 'image', 'canvas'
}

const optiTypes = [OptiType.none, OptiType.image, OptiType.canvas]

interface OptiRecordItem {
    el: HTMLElement | SVGElement,
    dirty?: boolean, // image & canvas
    optimizing?: { // canvas
        loaded: boolean,
        imageel: SVGImageElement,
        step2?: boolean,
        scale?: number,
    }
    scale?: number
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
    set optiel_dirty(dirty: boolean);
    canOptiNode: boolean,
    m_save_version: number,
    m_save_render: EL & { el?: HTMLElement | SVGElement },
}
// export const OPTI_NODE_COUNT = 3000;
// export const MAX_OPTI_LEVEL = 3;
const _2IMAGE_NODE_COUNT = 10; // 小于这个的不转成image了
const _2CANVAS_NODE_COUNT = 500; // 太大了需要用canvas

export enum OptiStatus {
    none, done, optimizing,
}

export function optiNode(_this: NodeType, optiType: 'image' | 'canvas', visible: boolean, focused: boolean, matrix: Matrix): OptiStatus {
    // if (_this.optiel && (_this.optiel_type === 'none' || !_this.optiel_dirty)) return true;
    if (!_this.el || !_this.eltag) {
        return OptiStatus.none;
    }

    if (visible && focused) {
        // todo keep
        // 
        unOptiNode(_this);
        return OptiStatus.none;
    }
    const frame = _this.visibleFrame;
    if (frame.width === 0 || frame.height === 0) {
        opti2none(_this);
    }
    else if (visible) {
        return opti2image(_this, optiType, matrix);
    } else {
        opti2none(_this);
    }

    // 这个是不显示
    return OptiStatus.done;
}

export function opti2none(_this: NodeType) {
    if (!_this.el) throw new Error();
    if (!_this.optis) {
        _this.optis = { origin: _this.el, records: {} }
        _this.optis.records[OptiType.none] = {
            el: createElement(_this.eltag)
        }
    }
    else if (_this.optis.records[OptiType.none]) {
        if (_this.el === _this.optis.records[OptiType.none].el) return;
    }
    else {
        _this.optis.records[OptiType.none] = {
            el: createElement(_this.eltag)
        }
    }

    const saveel = _this.el;
    _this.el = _this.optis.records[OptiType.none].el;

    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }

    // image dirty时需要删除；省内存
    opti_remove_ditry(_this);
}

function opti2image(_this: NodeType, optiType: 'image' | 'canvas', matrix: Matrix): OptiStatus {
    if (_this.nodeCount < _2IMAGE_NODE_COUNT) {
        unOptiNode(_this);
        return OptiStatus.none;
    }
    // canvas还有些问题
    // _opti2image(_this);
    // return OptiStatus.done;
    else if (_this.nodeCount < _2CANVAS_NODE_COUNT || optiType === 'image') {
        _opti2image(_this);
        return OptiStatus.done;
    } else {
        return _opti2canvas(_this, matrix);
    }
}

function _opti2image(_this: NodeType) {
    if (!_this.el) throw new Error();
    if (!_this.optis) {
        _this.optis = { origin: _this.el, records: {} }
        // _this.optis.records[OptiType.image] = {
        //     el: createElement("image")
        // }
    }
    else if (_this.optis.records[OptiType.image]) {
        if (!_this.optis.records[OptiType.image].dirty) {
            if (_this.el === _this.optis.records[OptiType.image].el) return;
            const saveel = _this.el;
            _this.el = _this.optis.records[OptiType.image].el;
            if (saveel && saveel.parentNode) {
                saveel.parentNode.replaceChild(_this.el!, saveel);
            }
            return;
        }
    }
    // else {
    //     _this.optis.records[OptiType.image] = {
    //         el: createElement(_this.eltag)
    //     }
    // }

    // 打包成svg
    const { x, y, width, height } = _this.visibleFrame;

    const svgprops: any = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        preserveAspectRatio: "xMinYMin meet",
        overflow: "visible", // 阴影可能在外面，或者说visibleFrame现在计算的还不对
        viewBox: `${x} ${y} ${width} ${height}`,
        width: width,
        height: height
    }

    const svg = stringh('svg', svgprops, _this.optis.origin.innerHTML.replaceAll("#", "%23"));
    const href = "data:image/svg+xml," + svg;
    // _this.optis.records[OptiType.image].el = createElement('image');
    _this.optis.records[OptiType.image] = {
        el: createElement("image")
    }
    const props: any = {};
    Object.assign(props, _this.elattr);
    props.href = href;
    props.x = x;
    props.y = y;
    props.width = width;
    props.height = height;
    batchSetAttribute(_this.optis.records[OptiType.image].el, props);

    const saveel = _this.el;
    _this.el = _this.optis.records[OptiType.image].el;

    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
    // _this.optis.records[OptiType.image].dirty = false;

    return true;
}

function _opti2canvas(_this: NodeType, matrix: Matrix): OptiStatus {
    if (!_this.el) throw new Error();
    if (!_this.optis) {
        _this.optis = { origin: _this.el, records: {} }
        // _this.optis.records[OptiType.canvas] = {
        //     el: createElement("image")
        // }
    }
    else if (_this.optis.records[OptiType.canvas]) {
        if (!_this.optis.records[OptiType.canvas].optimizing && !_this.optis.records[OptiType.canvas].dirty) {
            // 如果缩放值差别太大，需要重绘
            const scale = matrix.m00;
            const elscale = _this.optis.records[OptiType.canvas].scale || 1;
            if (Math.abs(scale - elscale) < 0.1) { // 可以往小的缩，另外太大了也不行；缩放时不更新，缩小完再调整
                if (_this.el === _this.optis.records[OptiType.canvas].el) return OptiStatus.done;
                const saveel = _this.el;
                _this.el = _this.optis.records[OptiType.canvas].el;
                if (saveel && saveel.parentNode) {
                    saveel.parentNode.replaceChild(_this.el!, saveel);
                }
                return OptiStatus.done;
            }
        }
    }

    const canvas = _this.optis.records[OptiType.canvas];
    if (canvas && !canvas.dirty && canvas.optimizing?.loaded) {
        const image = _opti2canvasStep2(_this, _this.optis.origin, matrix, canvas.optimizing); // 空白是还没加载好？
        _opti2canvasStep3(_this, image);
        return OptiStatus.done;
        // if (canvas.optimizing.step2) {
        //     _opti2canvasStep3(_this, canvas.optimizing);
        //     console.log('step3')
        //     return OptiStatus.done;
        // }
        // const image = _opti2canvasStep2(_this, _this.optis.origin, matrix, canvas.optimizing); // 空白是还没加载好？
        // _this.optis.records[OptiType.canvas] = {
        //     el: image.imageel,
        //     optimizing: image,
        // }
        // console.log('step2')
        // return OptiStatus.optimizing;
    }

    if (canvas && !canvas.dirty && canvas.optimizing && !canvas.optimizing.loaded) { // 还没load?
        // console.log('not loaded')
        return OptiStatus.optimizing;
    }

    // console.log('step1')
    const image = _opti2canvasStep1(_this, _this.optis.origin);
    _this.optis.records[OptiType.canvas] = {
        el: image.imageel,
        optimizing: image,
    }
    return OptiStatus.optimizing;
}

function _opti2canvasStep1(_this: NodeType, el: SVGElement | HTMLElement): {
    loaded: boolean,
    imageel: SVGImageElement,
    step2: boolean
} {
    const { x, y, width, height } = _this.visibleFrame;

    const svgprops: any = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        preserveAspectRatio: "xMinYMin meet",
        overflow: "visible", // 阴影可能在外面，或者说visibleFrame现在计算的还不对
        viewBox: `${x} ${y} ${width} ${height}`,
        width: width,
        height: height
    }

    const svg = stringh('svg', svgprops, el.innerHTML.replaceAll("#", "%23"));
    const href = "data:image/svg+xml," + svg;
    const imageel = createElement('image') as SVGImageElement;
    const props: any = {};
    Object.assign(props, _this.elattr);
    props.href = href;
    props.x = x;
    props.y = y;
    props.width = width;
    props.height = height;
    batchSetAttribute(imageel, props);
    const ret = {
        loaded: false,
        imageel,
        step2: false,
    }
    imageel.onload = () => {
        ret.loaded = true;
    }
    return ret;
}

function _opti2canvasStep3(_this: NodeType, _image: {
    loaded: boolean,
    imageel: SVGImageElement,
    scale?: number
}) {
    if (!_this.optis) throw new Error();
    _this.optis.records[OptiType.canvas] = {
        el: _image.imageel,
        scale: _image.scale || 1
    }

    const saveel = _this.el;
    _this.el = _image.imageel;

    if (saveel && saveel.parentNode) {
        saveel.parentNode.replaceChild(_this.el!, saveel);
    }
}


function _opti2canvasStep2(_this: NodeType, el: SVGElement | HTMLElement | undefined, matrix: Matrix, _image: {
    loaded: boolean,
    imageel: SVGImageElement
}): {
    loaded: boolean,
    imageel: SVGImageElement,
    step2: boolean,
    scale: number
} {
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

    // if (!_this.optis) throw new Error();
    const optiel = createElement("image") as SVGImageElement;
    // _this.optis.records[OptiType.canvas] = {
    //     el: optiel,
    //     scale: matrix.m00
    // }

    // _this.optiel = createElement('image');
    props.href = href;

    props.x = frame.x;
    props.y = frame.y;
    props.width = frame.width;
    props.height = frame.height;
    Object.assign(props, _this.elattr);
    batchSetAttribute(optiel, props);

    // const saveel = _this.el;
    // _this.el = optiel;

    // if (saveel && saveel.parentNode) {
    //     saveel.parentNode.replaceChild(_this.el!, saveel);
    // }

    const ret = {
        loaded: false,
        imageel: optiel,
        step2: true,
        scale: matrix.m00
    }
    optiel.onload = () => {
        ret.loaded = true;
    }
    return ret;
}

export function unOptiNode(_this: NodeType) {

    // todo image dirty时需要删除

    if (!_this.optis) {
        return;
    }

    const saveel = _this.el;
    if (saveel === _this.optis.origin) {
        return;
    }

    _this.el = _this.optis.origin;
    if (saveel && saveel.parentNode && _this.el) {
        saveel.parentNode.replaceChild(_this.el, saveel);
    }

    // image dirty时需要删除；省内存
    opti_remove_ditry(_this);
}

export function optiRender(_this: NodeType, version: number) {
    if (version !== _this.m_save_version || !_this.el) {
        let saveel;
        if (_this.optis) {
            if (!_this.el) throw new Error()
            saveel = _this.el;
            _this.el = _this.optis.origin;
        }
        elpatch(_this, _this.m_save_render); // 这里才转化为html或者svg节点
        if (saveel) _this.el = saveel;
        _this.optiel_dirty = true;
        _this.m_save_version = version;
        _this.m_save_render.reset(_this.eltag, _this.elattr, _this.elchilds);
        _this.m_save_render.el = _this.el;
    }
}

export function optiSetDirty(_this: NodeType) {
    if (_this.optis?.records[OptiType.image]) _this.optis.records[OptiType.image].dirty = true;
    if (_this.optis?.records[OptiType.canvas]) _this.optis.records[OptiType.canvas].dirty = true;
}

function opti_remove_ditry(_this: NodeType) {
    if (!_this.optis) return;
    // image dirty时需要删除；省内存
    if (_this.optis.records[OptiType.image] && _this.optis.records[OptiType.image].dirty) {
        delete _this.optis.records[OptiType.image];
    }
    // image dirty时需要删除；省内存
    if (_this.optis.records[OptiType.canvas] && _this.optis.records[OptiType.canvas].dirty) {
        delete _this.optis.records[OptiType.canvas];
    }
}