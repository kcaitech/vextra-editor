<script setup lang="ts">
import { Context } from '@/context';
import { Preview, ScaleType } from '@/context/preview';
import { ArtboradView, makeShapeTransform1By2, makeShapeTransform2By1, Matrix, OverlayBackgroundInteraction, OverlayBackgroundType, PageView, PrototypeActions, PrototypeNavigationType, PrototypeTransitionType, ScrollDirection, sessionRefIdKey, ShapeType, ShapeView, TransformRaw, XYsBounding } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, reactive, ref, toRaw, watch } from 'vue';
import { finderShape, getFrameList, getScrollShape, scrollAtrboard, selectShapes, viewBox } from '@/utils/preview';
import PageCard from "./PreviewPageCard.vue";
import MenuVue from './PreviewMenu.vue';
import { ViewUpdater } from "@/components/Preview/viewUpdater";
import { Selection } from '@/context/selection';
import ControlsView from './PreviewControls/ControlsView.vue';

import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { DomCtx } from '../Document/Content/vdom/domctx';
import { initComsMap } from '../Document/Content/vdom/comsmap';
import { SymbolDom } from '../Document/Content/vdom/symbol';
import { is_mac } from '@/utils/common';
const { t } = useI18n();
const props = defineProps<{
    context: Context
    page: PageView
    showTop: boolean
}>();
type PCard = InstanceType<typeof PageCard>
const preview = ref<HTMLDivElement>();
let cur_shape: ShapeView[] = reactive([]);
const listLength = ref(0);
const curPage = ref(0);
const pageCard = ref<PCard>();
const viewBoxDialog = ref<HTMLDivElement[]>();
const spacePressed = ref<boolean>(false);
let target_shapes: ShapeView[] = reactive([]);
const isSuperposed = ref(false);
const end_matrix = ref(new Matrix());
const is_swap_shape = ref(false);
const symrefAnimate = ref<SVGSVGElement>();
const renderCard = ref(false);
let event: MouseEvent;

function page_watcher() {
    const shape = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;

    if (!shape || !page) {
        return cur_shape = [];
    }

    if (cur_shape[0].id !== shape.id) {
        cur_shape = toRaw([shape]);
    }

    viewUpdater.atPage(page.data);
    viewUpdater.atTarget(shape);

    const naviList = props.context.preview.naviShapeList;
    const frameList = naviList.length > 0 ? naviList : getFrameList(page);
    listLength.value = frameList.length;

    const index = frameList.findIndex(item => item.id === shape.id);
    curPage.value = index + 1;

    initMatrix();
    viewUpdater.overlayBox(shape);
    if (event) {
        search(event);
    }
}

function changePage() {
    const page = props.context.selection.selectedPage;
    if (!page) return;

    const naviList = props.context.preview.naviShapeList;
    const frameList = naviList.length > 0 ? naviList : getFrameList(page);

    const shape = props.context.selection.selectedShapes[0] || frameList[0];
    if (!shape) {
        return cur_shape = [];
    }
    cur_shape = toRaw([shape]);

    viewUpdater.atPage(page.data);
    viewUpdater.atTarget(shape);

    listLength.value = frameList.length;

    const index = frameList.findIndex(item => item.id === shape.id);
    curPage.value = index + 1;
    nextTick(() => {
        viewUpdater.mount(preview.value!, props.context.selection.selectedPage!.data, props.context.selection.selectedShapes[0], pageCard.value as any);
        initMatrix();
    });
}

const togglePage = (p: number) => {
    const shape = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;

    if (!shape || !page) {
        return cur_shape = [];
    }
    cur_shape = toRaw([shape]);

    const naviList = props.context.preview.naviShapeList;
    const frameList = naviList.length > 0 ? naviList : getFrameList(page);
    let index = frameList.findIndex(item => item.id === shape.id);
    if (index === -1) return;
    index += p;
    if (index < 0 || index > (frameList.length - 1)) return;
    props.context.selection.selectShape(frameList[index]);
    props.context.preview.setFromShapeAction(undefined);
}

const getEndElement = () => {
    let el: SVGSVGElement | undefined;
    if (target_shapes.length > 0) {
        const els = document.querySelectorAll('.dailogCard');
        el = els[els.length - 1] as SVGSVGElement;
    } else {
        el = pageCard.value!.pageSvg as SVGSVGElement
    }
    return el;
}
const previewWatcher = (t: number | string, s?: any) => {
    if (t === Preview.MENU_CHANGE) {
        const type = props.context.preview.scaleType;
        if (type === ScaleType.Actual) {
            viewUpdater.modifyTransform();
        } else if (type === ScaleType.FillScreen) {
            viewUpdater.modifyTransformToFill();
        } else if (type === ScaleType.FitScreen) {
            viewUpdater.modifyTransformToFit();
        } else if (type === ScaleType.FitWidth) {
            viewUpdater.modifyTransformToFillByWidth();
        }
        const shape = props.context.selection.selectedShapes[0];
        viewUpdater.overlayBox(shape);
    } else if (t === Preview.NAVI_VISIBLE) {
        if (props.context.preview.naviState) {
            viewUpdater.v_matrix.trans(-250, 0);
            viewUpdater.setAttri(viewUpdater.v_matrix)
        } else {
            viewUpdater.v_matrix.trans(250, 0);
            viewUpdater.setAttri(viewUpdater.v_matrix)
        }
    } else if (t === Preview.BEFORE_PAGE) {
        togglePage(-1);
    } else if (t === Preview.NEXT_PAGE) {
        togglePage(1);
    } else if (t === Preview.SCALE_CHANGE) {
        if (s) {
            viewUpdater.keyScale(-0.1);
        } else {
            viewUpdater.keyScale(0.1);
        }
    } else if (t === Preview.ARTBOARD_SCROLL) {
        // 容器内滚动
        const el = getEndElement();
        // 滚动动画
        const action = s as PrototypeActions;
        const selected_shape = props.context.selection.selectedShapes[0];
        const shappe = target_shapes.length ? target_shapes[target_shapes.length - 1] : selected_shape;
        viewUpdater.artboardInnerScroll(action, el, shappe);
        if (event) search(event);
    } else if (t === Preview.MATRIX_CHANGE) {
        // 更新浮层位置
        updateDialogMatrix();
        if (event) search(event);
    } else if (t === Preview.INTERACTION_CHANGE) {
        // 执行交互动作
        s ? backTargetShape(s) : getTargetShapes();
    } else if (t === Preview.FLOW_CHANGE) {
        // 流程切换
        const shape = props.context.selection.selectedShapes[0];
        const page = props.context.selection.selectedPage!;
        const naviList = props.context.preview.naviShapeList;
        const frameList = naviList.length > 0 ? naviList : getFrameList(page);
        listLength.value = frameList.length;
        const index = frameList.findIndex(item => item.id === shape.id);
        curPage.value = index + 1;
    } else if (t === Preview.SUPERNATANT_CLOSR) {
        // 关闭浮层动作
        const els = document.querySelectorAll('.dailogCard');
        const action = s as PrototypeActions;
        viewUpdater.dissolveAnimate(action, els as any, 0);
        const end_shape = target_shapes[target_shapes.length - 1] as ShapeView;
        const m = viewUpdater.readyPosition(end_matrix.value as Matrix, end_shape, action.transitionType);
        const el = els[els.length - 1] as SVGSVGElement;
        el.style['transform'] = m.toString();
        const time = action.transitionDuration ?? 0.3;
        const timer = setTimeout(() => {
            getTargetShapes();
        }, time * 1000);
        props.context.preview.addSetTimeout(timer);
    } else if (t === Preview.SYMBOL_REF_SWITCH) {
        const m = new Matrix();
        if (!s && symrefAnimate.value) {
            symrefAnimate.value.style['transition'] = '';
            symrefAnimate.value.style['transform'] = m.toString();
            symrefAnimate.value.style.opacity = '0';
            return;
        }
        const action = s as PrototypeActions;
        const hover_shape = props.context.selection.hoveredShape;
        if (!action.targetNodeID || !hover_shape || !symrefAnimate.value) return;
        const matrix = isSuperposed.value ? (end_matrix.value as Matrix) : viewUpdater.v_matrix;
        const box = viewBox(matrix, hover_shape);
        m.scale(viewUpdater.v_matrix.m00);
        const domCtx = new DomCtx();
        initComsMap(domCtx.comsMap);
        const sym = props.context.data.symbolsMgr.get(action.targetNodeID);
        if (!sym) return;
        const cur_frame = sym.frame;
        const _m = sym.matrix2Parent();
        _m.multiAtLeft(m.clone());
        const points = [
            _m.computeCoord2(0, 0),
            _m.computeCoord2(cur_frame.width, 0),
            _m.computeCoord2(cur_frame.width, cur_frame.height),
            _m.computeCoord2(0, cur_frame.height)
        ];
        const sym_box = XYsBounding(points);
        m.trans(box.left - sym_box.left, box.top - sym_box.top);
        const view = new SymbolDom(domCtx, { data: sym });
        view.layout();
        view.render();
        const bezier = action.easingFunction ? action.easingFunction : [0, 0, 1, 1];
        const time = action.transitionDuration ?? 0.3;
        symrefAnimate.value.style['transition'] = `opacity ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`
        symrefAnimate.value.style['transform'] = m.toString();
        if (view.el) {
            symrefAnimate.value.appendChild(view.el);
            symrefAnimate.value.style.opacity = '1';
        }
    }
}

const selectionWatcher = (v: number | string) => {
    if (v === Selection.CHANGE_PAGE) {
        changePage();
        props.context.preview.setFromShapeAction(undefined);
    } else if (v === Selection.CHANGE_SHAPE) {
        props.context.preview.clearInnerTransform();
        const shapes = props.context.selection.selectedShapes;
        if (!shapes.length) {
            ElMessage.error({ duration: 3000, message: `${t('home.not_preview_frame')}` });
            props.context.selection.selectShape(undefined);
        }
        watch_shapes();
        if (!viewUpdater.pageCard?.pageSvg || !viewUpdater.currentPage) {
            changePage();
            return;
        }
        page_watcher();
    }
}

const initMatrix = () => {
    const type = props.context.preview.scaleType;
    if (type === ScaleType.FillScreen) {
        viewUpdater.modifyTransformToFill();
    } else if (type === ScaleType.FitScreen) {
        viewUpdater.modifyTransformToFit();
    } else if (type === ScaleType.FitWidth) {
        viewUpdater.modifyTransformToFillByWidth();
    } else if (type === ScaleType.Actual) {
        viewUpdater.modifyTransform();
    } else {
        viewUpdater.modifyTransformKeepScale();
    }
    if (is_overlay.value && pageCard.value) {
        is_overlay.value = false;
    }
}
let atrboard: ArtboradView;
function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    e.preventDefault();
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    const { ctrlKey, metaKey } = e;
    if (ctrlKey || metaKey) { // 缩放
        viewUpdater.scale(e);
    } else {
        let hover_shape = search2(e);
        hover_shape = getScrollShape(hover_shape);
        if (!hover_shape) {
            viewUpdater.trans(e);
        } else {
            atrboard = hover_shape as ArtboradView;
            const scale = viewUpdater.v_matrix.m00;
            let stepx = Math.abs(e.deltaX) > 50 ? (50 * (e.deltaX / Math.abs(e.deltaX))) : e.deltaX;
            let stepy = Math.abs(e.deltaY) > 50 ? (50 * (e.deltaY / Math.abs(e.deltaY))) : e.deltaY;
            if (e.shiftKey && !is_mac() && e.deltaX < 1) {
                stepx = stepy;
                stepy = 0;
            }
            let scroll = scrollAtrboard(atrboard, { x: -stepx / scale, y: -stepy / scale });
            let p_x = hover_shape.parent;
            p_x = getScrollShape(p_x);
            while (p_x && p_x.type !== ShapeType.Page && !scroll.x) {
                scroll.x = scrollAtrboard(p_x as ArtboradView, { x: -stepx / scale, y: 0 }).x;
                p_x = p_x.parent;
            }
            let p_y = hover_shape.parent;
            p_y = getScrollShape(p_y);
            while (p_y && p_y.type !== ShapeType.Page && !scroll.y) {
                scroll.y = scrollAtrboard(p_y as ArtboradView, { x: 0, y: -stepy / scale }).y;
                p_y = p_y.parent;
            }
            viewUpdater.trans(e, scroll);
        }
    }
}

const observer = new ResizeObserver(() => {
    initMatrix();
    viewUpdater.overlayBox();
    updateDialogMatrix();
});

watch(() => props.showTop, (v) => {
    if (v) {
        viewUpdater.v_matrix.trans(0, -46);
        viewUpdater.setAttri(viewUpdater.v_matrix);
    } else {
        viewUpdater.v_matrix.trans(0, 46);
        viewUpdater.setAttri(viewUpdater.v_matrix);
    }
})

const isMenu = ref(false);
const top = ref(0);
const left = ref(0);
let downXY = { x: 0, y: 0 };
let isDragging = false;
const onMouseDown = (e: MouseEvent) => {
    if (!((e.target as HTMLElement).tagName === "DIV")) return;
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.stopPropagation();

    isMenu.value = false;
    if (e.button === 2) {
        props.context.preview.notify(Preview.MENU_VISIBLE);
        top.value = e.y;
        left.value = e.x;
        nextTick(() => {
            isMenu.value = true;
        })
    } else if (e.button === 0) {
        isDragging = false;
        downXY.x = e.clientX;
        downXY.y = e.clientY;
        if (preview.value && spacePressed.value) {
            preview.value.style.cursor = 'grabbing';
        }
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
    if (e.buttons == 1 && spacePressed.value) {
        pageViewDragging(e); // 拖拽页面
        if (preview.value) {
            preview.value.style.cursor = 'grabbing';
        }
    } else if (e.button === 0) {
        let hover_shape = search2(e);
        hover_shape = getScrollShape(hover_shape);
        if (!hover_shape) {
            pageViewDragging(e); // 拖拽页面
        } else {
            let dx = e.clientX - downXY.x;
            let dy = e.clientY - downXY.y;
            const diff = Math.hypot(dx, dy);
            if (diff > 4) {
                atrboard = hover_shape as ArtboradView;
                const scale = viewUpdater.v_matrix.m00;
                let scroll = scrollAtrboard(atrboard, { x: e.movementX / scale, y: e.movementY / scale });
                let p_x = hover_shape.parent;
                p_x = getScrollShape(p_x);
                while (p_x && p_x.type !== ShapeType.Page && !scroll.x) {
                    scroll.x = scrollAtrboard(p_x as ArtboradView, { x: e.movementX / scale, y: 0 }).x;
                    p_x = p_x.parent;
                }
                let p_y = hover_shape.parent;
                p_y = getScrollShape(p_y);
                while (p_y && p_y.type !== ShapeType.Page && !scroll.y) {
                    scroll.y = scrollAtrboard(p_y as ArtboradView, { x: 0, y: e.movementY / scale }).y;
                    p_y = p_y.parent;
                }
                pageViewDragging(e, scroll);
            }
        }
    }
}

const pageViewDragging = (e: MouseEvent, scroll?: { x: boolean, y: boolean }) => {
    if (!preview.value) return;
    const root = preview.value.getBoundingClientRect();
    let dx = e.clientX - downXY.x;
    let dy = e.clientY - downXY.y;
    const bound = viewUpdater.getBoundingOnView()!;

    const left = bound.left;
    const top = bound.top;
    const right = bound.right;
    const bottom = bound.bottom;
    if (left < 0) {
        if (-left < dx) dx = -left;
    }
    if (left >= 0 && dx > 0) dx = 0;
    if (top < 0) {
        if (-top < dy) dy = -top;
    }
    if (top >= 0 && dy > 0) dy = 0;

    if (right > root.width) {
        if ((root.width - right) > dx) dx = root.width - right;
    }
    if (right <= root.width && dx < 0) dx = 0;
    if (bottom > root.height) {
        if ((root.height - bottom) > dy) dy = root.height - bottom;
    }
    if (bottom <= root.height && dy < 0) dy = 0;

    if (scroll) {
        if (scroll.x) dx = 0;
        if (scroll.y) dy = 0;
    }

    const matrix = viewUpdater.v_matrix;

    if (isDragging) {
        matrix.trans(dx, dy);
        downXY.x = e.clientX;
        downXY.y = e.clientY;
    } else {
        const diff = Math.hypot(dx, dy);
        if (diff > 4) {
            isDragging = true;
            matrix.trans(dx, dy);
            downXY.x = e.clientX;
            downXY.y = e.clientY;
        }
    }

    viewUpdater.setAttri(matrix);
}

const getCurLayerShape = (id?: string) => {
    const page = props.context.selection.selectedPage;
    const shapes = getFrameList(page!);
    return shapes.find(item => item.id === id);
}

function onMouseUp(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    if (e.button === 0 && !isDragging) {
        const dx = e.clientX - downXY.x;
        const dy = e.clientY - downXY.y;
        const diff = Math.hypot(dx, dy);
        const isHot = localStorage.getItem('proto_hot_zone') ?? 'true';
        if (diff < 4 && isHot === 'true') {
            const select_shape = props.context.selection.selectedShapes[0];
            const matrix = isSuperposed.value ? (end_matrix.value as Matrix) : viewUpdater.v_matrix;
            const shape = isSuperposed.value ? target_shapes.at(-1) : select_shape;
            viewUpdater.getHotZone(e, matrix, shape as ShapeView);
        }
    }
    if (spacePressed.value) {
        isDragging = false;
        if (preview.value) {
            preview.value.style.cursor = 'grab';
        }
    } else if (isSuperposed.value) {
        const h_shape = search(e);
        if (!h_shape) {
            const shape = target_shapes[target_shapes.length - 1] as ShapeView;
            const end_action = props.context.preview.endAction;
            const swap_end_action = props.context.preview.swapEndAction;
            if (end_action.navigationType === PrototypeNavigationType.SWAP) {
                const s = getCurLayerShape(swap_end_action.targetNodeID);
                if (s && s.overlayBackgroundInteraction === OverlayBackgroundInteraction.CLOSEONCLICKOUTSIDE) {
                    props.context.preview.deleteEndAction();
                }
            } else {
                if (shape.overlayBackgroundInteraction === OverlayBackgroundInteraction.CLOSEONCLICKOUTSIDE) {
                    props.context.preview.deleteEndAction();
                }
            }
        }
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

const isSpacePressed = () => {
    const shape = props.context.selection.selectedShapes[0];
    if (!preview.value || !shape) return;
    const root = preview.value.getBoundingClientRect();
    const frame = shape.frame;
    const matrix = viewUpdater.v_matrix;
    const points = [[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => matrix.computeCoord(p[0], p[1]));
    const box = XYsBounding(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    return width > root.width || height > root.height;
}

function onKeyDown(e: KeyboardEvent) { // 键盘监听
    if (e.target instanceof HTMLInputElement) return;
    if (e.repeat || !preview.value) return;
    if (e.code === 'Space') {
        if (spacePressed.value || !isSpacePressed()) return;
        spacePressed.value = true;
        props.context.workspace.pageDragging(true);
        preview.value.style.cursor = 'grab'
    }
}

function onKeyUp(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || !preview.value) return;
    if (spacePressed.value && e.code === 'Space') {
        spacePressed.value = false;
        props.context.workspace.pageDragging(false);
        preview.value.style.cursor = 'default'
    }
}

const onMouseMove_CV = (e: MouseEvent) => {
    if (e.buttons === 0 && !spacePressed.value) {
        event = e;
        search(e); // 图形检索(hover)
        const h_shape = props.context.selection.hoveredShape;
        if (preview.value && !spacePressed.value) {
            if (h_shape && h_shape.prototypeInterAction?.length) {
                preview.value.style.cursor = 'pointer'
            } else {
                preview.value.style.cursor = 'default'
            }
        }
    }
}

function search(e: MouseEvent) {
    const shapes = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    if (!preview.value || !shapes || !page) return;
    const scout = props.context.selection.scout;
    const { x, y } = preview.value.getBoundingClientRect();
    const xy = { x: e.clientX - x, y: e.clientY - y };
    let hover_shape: ShapeView | undefined;
    if (isSuperposed.value) {
        if (target_shapes.length) {
            const shape = target_shapes[target_shapes.length - 1] as ShapeView;
            const m = end_matrix.value as Matrix;
            if (m) {
                hover_shape = finderShape(m, scout, [shape], xy);
            }
        }
    } else {
        hover_shape = finderShape(viewUpdater.v_matrix, scout, [shapes], xy);
    }
    const actions = hover_shape?.prototypeInterAction;
    if ((hover_shape && !actions) || (hover_shape && actions!.length === 0)) {
        let p = hover_shape.parent;
        if (p && p.type === ShapeType.Page) {
            return selectShapes(props.context, undefined);
        }
        while (p && p.type !== ShapeType.Page) {
            if (p.prototypeInterAction && p.prototypeInterAction.length) {
                selectShapes(props.context, p);
                break;
            } else {
                p = p.parent;
            }
        }
    } else {
        selectShapes(props.context, hover_shape);
    }
    return hover_shape;
}
function search2(e: MouseEvent) {
    const shapes = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    if (!preview.value || !shapes || !page) return;
    const scout = props.context.selection.scout;
    const { x, y } = preview.value.getBoundingClientRect();
    const xy = { x: e.clientX - x, y: e.clientY - y };
    let hover_shape: ShapeView | undefined;
    if (isSuperposed.value) {
        if (target_shapes.length) {
            const shape = target_shapes[target_shapes.length - 1] as ShapeView;
            const m = end_matrix.value as Matrix;
            if (m) {
                hover_shape = finderShape(m, scout, [shape], xy);
            }
        }
    } else {
        hover_shape = finderShape(viewUpdater.v_matrix, scout, [shapes], xy);
    }
    return hover_shape;
}

const closeMenu = () => {
    isMenu.value = false;
}
const getTargetShapes = () => {
    target_shapes = [];
    renderCard.value = false;
    const page = props.context.selection.selectedPage;
    const shapes = getFrameList(page!);
    const actions = props.context.preview.interactionAction;
    const selectShape = props.context.selection.selectedShapes[0];
    isSuperposed.value = false;
    is_swap_shape.value = false;
    props.context.preview.setSupernatantIsOpen(false);
    if (actions.size === 0) return;
    const render_shapes: ShapeView[] = [];
    actions.forEach(action => {
        const shape = shapes.find(item => item.id === action.targetNodeID);
        if (shape) {
            render_shapes.push(shape);
        }
    })
    target_shapes = toRaw(render_shapes);
    renderCard.value = true;
    const box = viewBox(viewUpdater.v_matrix, selectShape);
    watch_shapes();
    nextTick(() => {
        const protoActions = Array.from(actions.values());
        const els = document.querySelectorAll('.dailogCard');
        for (let i = 0; i < protoActions.length; i++) {
            const action = protoActions[i];
            const shape = shapes.find(item => item.id === action.targetNodeID);
            if (shape) {
                // 移出动画
                if (action.navigationType === PrototypeNavigationType.OVERLAY && viewBoxDialog.value) {
                    isSuperposed.value = true;
                    props.context.preview.setSupernatantIsOpen(true);
                    if (shape.overlayBackgroundAppearance) {
                        if (shape.overlayBackgroundAppearance.backgroundType === OverlayBackgroundType.SOLIDCOLOR) {
                            const color = shape.overlayBackgroundAppearance.backgroundColor;
                            if (viewBoxDialog.value[i]) {
                                viewBoxDialog.value[i].style.backgroundColor = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`
                            }
                        }
                    }
                } else if (action.navigationType === PrototypeNavigationType.SWAP && viewBoxDialog.value) {
                    isSuperposed.value = true;
                    is_swap_shape.value = true;
                    props.context.preview.setSupernatantIsOpen(true);
                    const before_action = props.context.preview.swapEndAction;
                    if (!before_action) continue;
                    const s = shapes.find(item => item.id === before_action.targetNodeID);
                    if (!s) continue;
                    if (s.overlayBackgroundAppearance) {
                        if (s.overlayBackgroundAppearance.backgroundType === OverlayBackgroundType.SOLIDCOLOR) {
                            const color = s.overlayBackgroundAppearance.backgroundColor;
                            if (viewBoxDialog.value[i]) {
                                viewBoxDialog.value[i].style.backgroundColor = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`
                            }
                        }
                    }
                }
                const m = viewUpdater.updateViewBox(props.context, shape, action.navigationType, box);
                const el = els[i] as SVGSVGElement;
                if (m) {
                    if (i === els.length - 1) {
                        viewUpdater.slideAndshiftOutAnimate(action);
                        viewUpdater.dissolveAnimate(action, els as any, 0);
                        viewUpdater.shiftInAnimate(action, els as any);
                        viewUpdater.pushAndslideInAnimate(action, els as any);
                        const ready_m = viewUpdater.readyPosition(m, shape, action.transitionType);
                        el.style['transform'] = ready_m.toString();
                        end_matrix.value = m;
                        setTimeout(() => {
                            el.style['transform'] = m.toString();
                            viewUpdater.pageSvgSlideAnimate(action);
                            viewUpdater.pageSvgPushAnimate(action);
                            viewUpdater.dissolveAnimate(action, els as any, 1);
                            if (event) search(event);
                        })
                    } else {
                        el.style['transform'] = m.toString();
                    }
                }
            }
        }
    })
}
// 返回上一级动画
const backTargetShape = (s?: string) => {
    target_shapes = [];
    renderCard.value = false;
    const page = props.context.selection.selectedPage;
    const shapes = getFrameList(page!);
    const actions = props.context.preview.interactionAction;
    const selectShape = props.context.selection.selectedShapes[0];
    isSuperposed.value = false;
    is_swap_shape.value = false;
    props.context.preview.setSupernatantIsOpen(false);
    const protoActions = Array.from(actions.values());
    if (actions.size === 0) return;
    const render_shapes: ShapeView[] = [];
    protoActions.forEach((action, index) => {
        let shape = shapes.find(item => item.id === action.targetNodeID);
        if ((protoActions.length - 1) === index) {
            shape = shapes.find(item => item.id === s);
        }
        if (shape) {
            render_shapes.push(shape);
        }
    })
    target_shapes = toRaw(render_shapes);
    renderCard.value = true;
    const box = viewBox(viewUpdater.v_matrix, selectShape);
    watch_shapes();
    nextTick(() => {
        const els = document.querySelectorAll('.dailogCard');
        for (let i = 0; i < protoActions.length; i++) {
            const action = protoActions[i];
            const shape = target_shapes[i] as ShapeView;
            if (shape) {
                // 移出动画
                const m = viewUpdater.updateViewBox(props.context, shape, action.navigationType, box);
                const el = els[i] as SVGSVGElement;
                if (m) {
                    if (i === els.length - 1) {
                        viewUpdater.backShiftOutAnimate(action, els as any);
                        viewUpdater.backSlideInAnimate(action, els as any);
                        viewUpdater.backSlideOutAnimate(action, els as any);
                        const ready_m = viewUpdater.backReadyPosition(m, shape, action.transitionType);
                        el.style['transform'] = ready_m.toString();
                        end_matrix.value = m;
                        viewUpdater.backShiftInAnimate(action);
                        viewUpdater.backDissolveAnimate(action, els as any);
                        viewUpdater.backPushInAnimate(action, els as any);
                        setTimeout(() => {
                            el.style['transform'] = m.toString();
                            viewUpdater.backPushAnimate(action);
                            if (event) search(event);
                        })
                    } else {
                        el.style['transform'] = m.toString();
                    }
                }
            }
        }
    })
}

const onMouseEnter = () => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}
const onMouseLeave = () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
}

const viewUpdater = new ViewUpdater(props.context);
const is_overlay = ref(true);

function startLoop() {
    const dom = props.context.getPageDom(props.page);
    if (dom && pageCard.value?.pageSvg) {
        dom.ctx.loop(window.requestAnimationFrame);
    }
}

const updateDialogMatrix = () => {
    const page = props.context.selection.selectedPage;
    const selectShape = props.context.selection.selectedShapes[0];
    const els = document.querySelectorAll('.dailogCard');
    const box = viewBox(viewUpdater.v_matrix, selectShape);
    const shapes = getFrameList(page!);
    const protoActions = Array.from(props.context.preview.interactionAction.values());
    for (let i = 0; i < els.length; i++) {
        const action = protoActions[i];
        if (!action) continue;
        const shape = shapes.find(item => item.id === action.targetNodeID);
        if (!shape) continue;
        const el = els[i] as SVGSVGElement;
        const m = viewUpdater.updateViewBox(props.context, shape, action.navigationType, box);
        if (m) {
            el.style['transform'] = m.toString();
            if (i === els.length - 1) {
                end_matrix.value = m;
            }
        }
    }
}

const shapeChange = (...args: any[]) => {
    if (args.includes('layout')) {
        page_watcher();
    }
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(shapeChange);
        watchedShapes.delete(k);
    })

    const selectedShapes = [...props.context.selection.selectedShapes, ...(target_shapes as ShapeView[])];
    selectedShapes.forEach((v) => {
        v.watch(shapeChange);
        watchedShapes.set(v.id, v)
    });
}

onMounted(() => {
    props.context.preview.watch(previewWatcher);
    props.context.selection.watch(selectionWatcher);
    watch_shapes();
    // 等cur_shape触发pageCard的挂载
    page_watcher();
    nextTick(() => {
        watch_shapes();
        // 然后初始化视图渲染管理器
        viewUpdater.mount(preview.value!, props.context.selection.selectedPage!.data, props.context.selection.selectedShapes[0], pageCard.value as any);
    })

    if (preview.value) {
        observer.observe(preview.value);
    }
})
onUnmounted(() => {
    observer.disconnect();
    props.context.selection.scout?.remove();
    props.context.preview.unwatch(previewWatcher);
    props.context.selection.unwatch(selectionWatcher);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    sessionStorage.removeItem(sessionRefIdKey);

    viewUpdater.atTarget();
    viewUpdater.atPage();
    watchedShapes.forEach(v => {
        v.unwatch(shapeChange);
    });

    const dom = props.context.getPageDom(props.page);
    if (dom) {
        dom.ctx.stopLoop();
        dom.ctx.updateFocusShape(undefined);
        dom.dom.unbind();
    }
})
</script>

<template>
    <div class="preview_container" ref="preview" @wheel="onMouseWheel" @mousedown="onMouseDown"
        @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @mousemove="onMouseMove_CV">
        <PageCard v-if="cur_shape.length" class="pageCard" ref="pageCard" background-color="transparent"
            :context="context" :data="cur_shape[0]" :shapes="cur_shape" @start-loop="startLoop" :selected="true" />
        <!-- 浮层和动画卡片 -->
        <div v-if="renderCard" ref="viewBoxDialog" id="proto_overflow" v-for="item in target_shapes">
            <PageCard :key="item.id" class="dailogCard" ref="dailogCard" background-color="transparent" :data="item"
                :context="context" :shapes="target_shapes" />
        </div>
        <!-- 实例切换动画 -->
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ref="symrefAnimate"
            xmlns:xhtml="http://www.w3.org/1999/xhtml" class="symref_animate" preserveAspectRatio="xMinYMin meet"
            viewBox="0 0 100 100" width="100" height="100">
        </svg>
        <div class="toggle" v-if="listLength">
            <div class="last" @click.stop="togglePage(-1)" @mouseup.stop :class="{ disable: curPage === 1 }">
                <svg-icon icon-class="left-arrow"></svg-icon>
            </div>
            <div class="page">{{ curPage }} / {{ listLength }}</div>
            <div class="next" @click.stop="togglePage(1)" @mouseup.stop :class="{ disable: listLength === curPage }">
                <svg-icon icon-class="right-arrow"></svg-icon>
            </div>
        </div>
        <MenuVue :context="context" :top="top" :left="left" v-if="isMenu" @close="closeMenu"></MenuVue>
        <ControlsView :context="context" :matrix="isSuperposed ? (end_matrix as Matrix) : viewUpdater.v_matrix">
        </ControlsView>
        <div class="overlay" v-if="is_overlay"></div>
        <div v-if="cur_shape" class="preview_overlay"></div>
    </div>
</template>

<style scoped lang="scss">
.preview_container {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: black;

    #proto_overflow {
        overflow: hidden;
        transform-origin: top left;
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
    }

    .symref_animate {
        transform-origin: top left;
        position: absolute;
        overflow: visible;
        left: 0;
        top: 0;
        opacity: 0;
        pointer-events: none;
        z-index: 19;
    }

    .toggle {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        height: 24px;
        box-sizing: border-box;
        padding: 9px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.9);
        color: hsla(0, 0%, 100%, 0.9);
        z-index: 100;

        .last {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        .page {
            line-height: 16px;
            font-size: 11px;
            margin: 0 8px;
            opacity: 0.7;
        }

        .next {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        svg {
            width: 14px;
            height: 14px;
        }
    }
}

.disable {
    opacity: 0.5;
    cursor: not-allowed !important;
}

.overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    right: 0;
    bottom: 0;
}

.preview_overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    right: 0;
    bottom: 0;
    background-color: black;
    pointer-events: none;
    z-index: 20;
}
</style>