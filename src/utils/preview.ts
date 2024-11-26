import { Context } from '@/context';
import { ElMessage } from 'element-plus';
import {
    ArtboradView,
    Matrix,
    PageView,
    PrototypeEvents,
    PrototypeNavigationType,
    ScrollBehavior,
    ScrollDirection,
    Shape,
    ShapeType,
    ShapeView,
    TransformRaw
} from "@kcdesign/data";
import { Preview, ScaleType } from "@/context/preview";
import { PageXY } from "@/context/selection";
import { Scout } from './scout';
import { XYsBounding } from './common';
import { EventIndex } from "@/components/Display/PreviewControls/actions";

export function open_preview(doc_id: string, context: Context, t: Function, artboardId?: string) {
    const page = context.selection.selectedPage;
    if (!page) return;
    if (!page.artboardList.length) {
        ElMessage.error({ duration: 3000, message: `${t('home.not_preview_frame')}` })
        return;
    }
    const artboard = page.artboardList[0];
    const frame_id = artboardId ? artboardId : artboard.id;
    const href = `${window.location.href.split('?')[0]}?id=${doc_id}&page_id=${page.id.slice(0, 8)}&frame_id=${frame_id.slice(0, 8)}`;
    const url = href.replace(/document/, 'prototype');
    const p_window = context.preview.previewWindow;

    if (p_window && !p_window.closed) {
        p_window.location.href = url;
        p_window.focus();
    } else {
        const newWindow = window.open(url);
        if (newWindow) context.preview.setPreviewWindow(newWindow);
    }
    return true;
}

export function getFrameList(page: PageView) {
    if (!page.childs.length) page.m_ctx.layoutAll();
    return page.childs.filter(item => item.type === ShapeType.Artboard || item.type === ShapeType.Symbol || item.type === ShapeType.SymbolRef);
}


const keydownHandler: { [key: string]: (event: KeyboardEvent, context: Context) => any } = {};

function keydown(event: KeyboardEvent, context: Context) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) { // 不处理输入框内的键盘事件
        return;
    }
    const f = keydownHandler[event.code];
    f && f(event, context);
}

function keyup(event: KeyboardEvent, context: Context) {
}

export function keyboard(context: Context) {
    const down = (event: KeyboardEvent) => keydown(event, context);
    const up = (event: KeyboardEvent) => keyup(event, context);

    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);

    const remove_keyboard_units = () => {
        document.removeEventListener('keydown', down);
        document.removeEventListener('keyup', up);
    }

    return remove_keyboard_units;
}

keydownHandler['ArrowLeft'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    context.preview.notify(Preview.BEFORE_PAGE);
}

keydownHandler['ArrowRight'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    context.preview.notify(Preview.NEXT_PAGE);
}
keydownHandler['Digit0'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        context.preview.setScaleMenu(ScaleType.Actual);
        return;
    }
}

keydownHandler['Numpad0'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        context.preview.setScaleMenu(ScaleType.Actual);
        return;
    }
}


keydownHandler['Backslash'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        context.preview.notify(Preview.NAVI_CHANGE);
        return;
    }
    if (is_ctrl) {
        event.preventDefault();
        context.preview.showUiVisible(!context.preview.uiState);
    }
}

keydownHandler['Equal'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    context.preview.notify(Preview.SCALE_CHANGE, false);
}

keydownHandler['Minus'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    context.preview.notify(Preview.SCALE_CHANGE, true);
}

keydownHandler['KeyZ'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.altKey || event.shiftKey) return;
    event.preventDefault();
    const cur_scale_type = context.preview.scaleType;
    const scaleType = getNextScaleType(cur_scale_type || ScaleType.Actual);
    context.preview.setScaleMenu(scaleType);
}

function getNextScaleType(current: ScaleType): ScaleType {
    const types = [ScaleType.Actual, ScaleType.FitScreen, ScaleType.FillScreen, ScaleType.FitWidth];
    const index = types.findIndex(item => item === current) + 1;
    if (index === -1) return ScaleType.Actual;
    return types[index % types.length];
}


export const setWindowTitle = (context: Context, page: PageView) => {
    const _name = context?.data.name || '';
    const pages = context.data.pagesList
    const page_name = pages.find(item => item.id === page.id)?.name || '';
    window.document.title = _name.length > 8 ? `▶ ${_name.slice(0, 8)}... - ${page_name.slice(0, 8)}` : `▶ ${_name} - ${page_name.slice(0, 8)}`;
    // kcdesk?.fileSetName(_name);
}

export const selectedShape = (ctx: Context, page: PageView, t: Function) => {
    const list = getFrameList(page);
    if (!list.length) {
        ElMessage.error({ duration: 3000, message: `${t('home.not_preview_frame')}` })
        ctx.selection.selectShape(undefined);
        return;
    }
    ctx.selection.selectShape(list[0]);
}

export function finderShape(matrix: Matrix, scout: Scout, scope: ShapeView[], hot: PageXY, isAction = false): ShapeView | undefined {
    let result: ShapeView | undefined = undefined;
    for (let i = scope.length - 1; i > -1; i--) {
        const item = scope[i];

        if (!item.isVisible) {
            continue;
        }
        if (!(isAction && (!item.prototypeInterActions || !item.prototypeInterActions.length))) {
            const path = item.getPath().clone();
            const m = getPreviewMatrix(item);
            m.multiAtLeft(matrix.clone());
            path.transform(m);
            if (!scout.isPointInShapeForPreview(item, hot, path.toString(), matrix)) {
                continue;
            }
        }

        if (item.type === ShapeType.Table) {
            return item;
        }

        const children = item.type === ShapeType.SymbolRef ? (item.naviChilds || []) : (item.childs || []);
        if (!children.length) {
            return item;
        } else {
            result = finderShape(matrix, scout, children, hot);
            const background =
                item.type === ShapeType.Artboard
                || item.type == ShapeType.Symbol
                || item.type === ShapeType.SymbolUnion
                || item.type === ShapeType.SymbolRef;

            if (!result && background) {
                return item;
            }
        }

        if (result) {
            return result;
        }
    }
}

export function getScrollShape(shape: ShapeView | undefined) {
    let s: ShapeView | undefined;
    if (!shape) return;
    if (shape.scrollDirection && shape.scrollDirection !== ScrollDirection.NONE) {
        return s = shape;
    }
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (p.scrollDirection && p.scrollDirection !== ScrollDirection.NONE) {
            s = p;
            break;
        } else {
            p = p.parent;
        }
    }
    return s;
}

/**
 * @description 获取Shape到Preview视口下一级的坐标系
 */
export function getPreviewMatrix(shape: ShapeView) {
    const m = shape.matrix2Parent();
    let p = shape.parent;
    let s = shape;
    while (p && p.type !== ShapeType.Page) {
        const offset = (p as ArtboradView).innerTransform;
        const fixed_offset = (p as ArtboradView).fixedTransform;
        if (offset) {
            m.multiAtLeft(offset.toMatrix());
            if (s.scrollBehavior === ScrollBehavior.FIXEDWHENCHILDOFSCROLLINGFRAME) {
                m.trans(-offset.translateX, -offset.translateY);
            } else if (s.scrollBehavior === ScrollBehavior.STICKYSCROLLS) {
                if (s._p_frame.y + offset.translateY < 0) {
                    m.trans(0, -(s._p_frame.y + offset.translateY));
                    if (fixed_offset && fixed_offset.translateY < 0) {
                        m.trans(0, -fixed_offset.translateY);
                    }
                } else if (fixed_offset && fixed_offset.translateY < -(s._p_frame.y + offset.translateY)) {
                    const viewTrans = (s._p_frame.y + offset.translateY) + fixed_offset.translateY
                    m.trans(0, -viewTrans);
                }
            }
        }
        m.multiAtLeft(p.matrix2Parent());
        s = p;
        p = p.parent;
    }
    return m;
}

export function selectShapes(context: Context, shapes: ShapeView | undefined) {
    const hoveredShape = shapes;
    const selection = context.selection;
    if (hoveredShape) {
        context.preview.saveLastHoverShape(hoveredShape);
        selection.hoverShape(hoveredShape);
    } else {
        selection.unHoverShape();
    }
}

export function eventPriority(shape: ShapeView): EventIndex {
    const protoActions = shape.prototypeInterActions;
    let eventTypeIndex: EventIndex = {
        click: -1,
        dblclick: -1,
        mousedown: -1,
        mouseup: -1,
        mouseenter: -1,
        hover: -1
    }
    if (!protoActions) return eventTypeIndex;
    for (let i = 0; i < protoActions.length; i++) {
        const protoAction = protoActions[i];
        const type = protoAction.event.interactionType;
        if (type === PrototypeEvents.ONCLICK) {
            eventTypeIndex.click = i;
        }
        if (type === PrototypeEvents.DBCLICK) {
            eventTypeIndex.dblclick = i;
        }
        if (type === PrototypeEvents.MOUSEDOWN) {
            eventTypeIndex.mousedown = i;
        }
        if (type === PrototypeEvents.MOUSEUP) {
            eventTypeIndex.mouseup = i;
        }
        if (type === PrototypeEvents.MOUSEENTER) {
            eventTypeIndex.mouseenter = i;
        }
        if (type === PrototypeEvents.HOVER) {
            eventTypeIndex.hover = i;
        }
    }
    return eventTypeIndex;
}

export const viewBox = (m: Matrix, shape: ShapeView) => {
    const cur_frame = shape.frame;
    const matrix = getPreviewMatrix(shape);
    matrix.multiAtLeft(m.clone());
    const points = [
        matrix.computeCoord2(0, 0),
        matrix.computeCoord2(cur_frame.width, 0),
        matrix.computeCoord2(cur_frame.width, cur_frame.height),
        matrix.computeCoord2(0, cur_frame.height)
    ];
    return XYsBounding(points);
}

export const getFlowPathShapes = (context: Context, flows: Map<string, string[]>) => {
    const page = context.selection.selectedPage;
    flows.clear();
    if (!page) return flows;
    const list = getFrameList(page);
    getFlows(page, list, flows);
    return flows;
}

const getFlows = (page: PageView, shapes: ShapeView[], flows: Map<string, string[]>) => {
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape && shape.prototypeStartPoint) {
            const target_ids: Set<string> = new Set([shape.id]);
            flowShapes(page, shape, target_ids);
            flows.set(shape.id, Array.from(target_ids.values()));
        }
    }
}

const flowShapes = (page: PageView, startShape: ShapeView, target_ids: Set<string>) => {
    if (startShape.prototypeInterActions) {
        const target_id: Set<string> = new Set();
        for (let index = 0; index < startShape.prototypeInterActions.length; index++) {
            const action = startShape.prototypeInterActions[index].actions;
            if (!action) continue;
            const t = action.navigationType === PrototypeNavigationType.NAVIGATE || action.navigationType === PrototypeNavigationType.OVERLAY;
            if (action.targetNodeID && t && !target_ids.has(action.targetNodeID)) {
                target_ids.add(action.targetNodeID);
                target_id.add(action.targetNodeID);
            }
        }
        target_id.forEach(item => {
            const target_s = page.getShape(item);
            if (target_s) {
                flowShapes(page, target_s, target_ids);
            }
        })
    }
    if (startShape.type === ShapeType.Table) {
        return;
    }

    const children = startShape.childs || [];
    if (!children.length) {
        return;
    } else {
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            flowShapes(page, item, target_ids);
        }
    }
}

export const getFlowInfo = (context: Context, flows: Map<string, string[]>) => {
    const page = context.selection.selectedPage!;
    let options: string[] = ['all'];
    let descs: string[] = [];
    const keys = Array.from(flows.keys());
    for (let i = 0; i < keys.length; i++) {
        const id = keys[i];
        const shape = page.getShape(id);
        if (shape && shape.prototypeStartPoint) {
            options.push(shape.prototypeStartPoint.name);
            descs.push(shape.prototypeStartPoint.desc);
        }
    }
    return {
        options,
        descs
    }
}

export const getFlowShapes = (context: Context, id: string, flows: Map<string, string[]>) => {
    const page = context.selection.selectedPage!;
    const ids = flows.get(id);
    let flowShape: ShapeView[] = [];
    if (ids) {
        ids.forEach(item => {
            const shape = page.getShape(item);
            if (shape) {
                flowShape.push(shape);
            }
        })
    }
    return flowShape;
}

export const getAtrboardInnerOffset = (atrboard: ArtboradView) => {
    const size = atrboard.size;
    let offsetT = 0;
    let offsetL = 0;
    let offsetR = size.width;
    let offsetB = size.height;
    for (let i = 0; i < atrboard.childs.length; i++) {
        const child = atrboard.childs[i];
        const frame = child._p_frame;
        const right = frame.x + frame.width;
        const bottom = frame.y + frame.height;
        if (frame.x < offsetL) offsetL = frame.x;
        if (frame.y < offsetT) offsetT = frame.y;
        if (right > offsetR) offsetR = right;
        if (bottom > offsetB) offsetB = bottom;
    }
    return { top: -offsetT, right: size.width - offsetR, bottom: size.height - offsetB, left: -offsetL }
}

export const scrollAtrboard = (context: Context, atrboard: ArtboradView, trans: { x: number, y: number }) => {
    const offset = getAtrboardInnerOffset(atrboard);
    const transform = atrboard.innerTransform || new TransformRaw();
    const tx = transform.translateX;
    const ty = transform.translateY;
    let is_scrollx = false;
    let is_scrolly = false;

    if (atrboard.scrollDirection === ScrollDirection.VERTICAL) {
        // 垂直滚动
        if (trans.y > 0 && offset.top > ty) {
            const transy = trans.y + ty > offset.top ? offset.top - ty : trans.y;
            atrboard.innerScrollOffset(0, transy);
            is_scrolly = true;
        } else if (trans.y < 0 && offset.bottom < ty) {
            const transy = ty + trans.y < offset.bottom ? offset.bottom - ty : trans.y;
            atrboard.innerScrollOffset(0, transy);
            is_scrolly = true;
        }
    } else if (atrboard.scrollDirection === ScrollDirection.HORIZONTAL) {
        // 水平滚动
        if (trans.x > 0 && offset.left > tx) {
            const transx = trans.x + tx > offset.left ? offset.left - tx : trans.x;
            atrboard.innerScrollOffset(transx, 0);
            is_scrollx = true;
        } else if (trans.x < 0 && offset.right < tx) {
            const transx = tx + trans.x < offset.right ? offset.right - tx : trans.x;
            atrboard.innerScrollOffset(transx, 0);
            is_scrollx = true;
        }
    } else if (atrboard.scrollDirection === ScrollDirection.BOTH) {
        if (trans.y > 0 && offset.top > ty) {
            const transy = trans.y + ty > offset.top ? offset.top - ty : trans.y;
            atrboard.innerScrollOffset(0, transy);
            is_scrolly = true;
        } else if (trans.y < 0 && offset.bottom < ty) {
            const transy = ty + trans.y < offset.bottom ? offset.bottom - ty : trans.y;
            atrboard.innerScrollOffset(0, transy);
            is_scrolly = true;
        }
        if (trans.x > 0 && offset.left > tx) {
            const transx = trans.x + tx > offset.left ? offset.left - tx : trans.x;
            atrboard.innerScrollOffset(transx, 0);
            is_scrollx = true;
        } else if (trans.x < 0 && offset.right < tx) {
            const transx = tx + trans.x < offset.right ? offset.right - tx : trans.x;
            atrboard.innerScrollOffset(transx, 0);
            is_scrollx = true;
        }
    }
    context.preview.setInnerTransform(atrboard.id, atrboard.innerTransform)
    return { x: is_scrollx, y: is_scrolly };
}