// import kcdesk from "@/kcdesk";
import { Context } from '@/context';
import { ElMessage } from 'element-plus';
import { Matrix, PageView, Shape, ShapeType, ShapeView } from "@kcdesign/data";
import { Preview, ScaleType } from "@/context/preview";
import { PageXY } from "@/context/selection";
import { Scout } from './scout';
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
    // todo 缩放页面视图
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

export function finderShape(matrix: Matrix, scout: Scout, scope: ShapeView[], hot: PageXY): ShapeView | undefined {
    let result: ShapeView | undefined = undefined;
    for (let i = scope.length - 1; i > -1; i--) {
        const item = scope[i];

        if (!item.isVisible) {
            continue;
        }
        const path = item.getPath().clone();
        const m = getPreviewMatrix(item);
        m.multiAtLeft(matrix.clone());
        path.transform(m);
        if (!scout.isPointInShapeForPreview(item, hot, path.toString(), matrix)) {
            continue;
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

/**
 * @description 获取Shape到Preview视口下一级的坐标系
 */
export function getPreviewMatrix(shape: ShapeView) {
    const m = shape.matrix2Parent();
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        m.multiAtLeft(p.matrix2Parent());
        p = p.parent;
    }
    return m;
}

export function selectShapes(context: Context, shapes: ShapeView | undefined) {
    const hoveredShape = shapes;
    const selection = context.selection;
    if (hoveredShape) {
        selection.hoverShape(hoveredShape);
    } else {
        selection.unHoverShape();
    }
}