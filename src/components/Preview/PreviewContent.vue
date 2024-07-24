<script setup lang="ts">
import { Context } from '@/context';
import { Preview, ScaleType } from '@/context/preview';
import { Matrix, OverlayBackgroundInteraction, OverlayBackgroundType, OverlayPositions, PageView, PrototypeNavigationType, ShapeType, ShapeView, XYsBounding } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { finderShape, getFrameList, getPreviewMatrix, selectShapes, viewBox } from '@/utils/preview';
import PageCard from "./PreviewPageCard.vue";
import MenuVue from './PreviewMenu.vue';
import { ViewUpdater } from "@/components/Preview/viewUpdater";
import { Selection } from '@/context/selection';
import ControlsView from './PreviewControls/ControlsView.vue';

import { ElMessage, translate } from 'element-plus';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
    context: Context
    page: PageView
    showTop: boolean
}>();
type PCard = InstanceType<typeof PageCard>
const preview = ref<HTMLDivElement>();
const cur_shape = ref<ShapeView>();
const listLength = ref(0);
const curPage = ref(0);
const pageCard = ref<PCard>();
const viewBoxDialog = ref<HTMLDivElement[]>();
const spacePressed = ref<boolean>(false);
const target_shapes = ref<ShapeView[]>([]);
const isSuperposed = ref(false);
const end_matrix = ref(new Matrix());
const is_swap_shape = ref(false);

function page_watcher() {
    const shape = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    cur_shape.value = shape;

    if (!shape || !page) return;

    viewUpdater.atPage(page.data);
    viewUpdater.atTarget(shape);

    const frameList = getFrameList(page);
    listLength.value = frameList.length;

    const index = frameList.findIndex(item => item.id === shape.id);
    curPage.value = index + 1;

    initMatrix();
}

function changePage() {
    const page = props.context.selection.selectedPage;
    if (!page) return;

    const frameList = getFrameList(page);

    const shape = props.context.selection.selectedShapes[0] || frameList[0];
    if (!shape) {
        return;
    }

    cur_shape.value = shape;

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

    if (!shape || !page) return;

    cur_shape.value = shape;

    const frameList = getFrameList(page);
    let index = frameList.findIndex(item => item.id === shape.id);
    if (index === -1) return;
    index += p;
    if (index < 0 || index > (frameList.length - 1)) return;
    props.context.selection.selectShape(frameList[index]);
    props.context.preview.setFromShapeAction(undefined);
}

const previewWatcher = (t: number | string, s?: boolean) => {
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
        viewUpdater.artboardInTrans();
    } else if (t === Preview.MATRIX_CHANGE) {
        const page = props.context.selection.selectedPage;
        const els = document.querySelectorAll('.dailogCard');
        const box = viewBox(props.context, viewUpdater.v_matrix);
        const shapes = getFrameList(page!);
        const protoActions = Array.from(props.context.preview.interactionAction.values());
        for (let i = 0; i < els.length; i++) {
            const action = protoActions[i];
            const shape = shapes.find(item => item.id === action.targetNodeID);
            if (!shape) continue;
            const el = els[i] as SVGSVGElement;
            const m = updateViewBox(shape, action.navigationType, box);
            if (m) {
                el.style['transform'] = m.toString();
                if (i === els.length - 1) {
                    end_matrix.value = m;
                }
            }
        }
    } else if (t === Preview.INTERACTION_CHANGE) {
        getTargetShapes();
    }
}

const selectionWatcher = (v: number | string) => {
    if (v === Selection.CHANGE_PAGE) {
        changePage();
        props.context.preview.setFromShapeAction(undefined);
    } else if (v === Selection.CHANGE_SHAPE) {
        if (!props.context.selection.selectedShapes.length) {
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

function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    e.preventDefault();
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    const { ctrlKey, metaKey } = e;
    if (ctrlKey || metaKey) { // 缩放
        viewUpdater.scale(e);
    } else {
        viewUpdater.trans(e);
    }
}

const observer = new ResizeObserver(initMatrix);

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
    }
}

const pageViewDragging = (e: MouseEvent) => {
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
    if (preview.value) {
        preview.value.style.cursor = 'grabbing';
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
    if (spacePressed.value) {
        isDragging = false;
        if (preview.value) {
            preview.value.style.cursor = 'grab';
        }
    } else if (isSuperposed.value) {
        const h_shape = search(e);
        if (!h_shape) {
            const shape = target_shapes.value[target_shapes.value.length - 1] as ShapeView;
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
        search(e); // 图形检索(hover)
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
        if (target_shapes.value.length) {
            const shape = target_shapes.value[target_shapes.value.length - 1] as ShapeView;
            const m = end_matrix.value as Matrix;
            if (m) {
                hover_shape = finderShape(m, scout, [shape], xy);
            }
        }
    } else {
        hover_shape = finderShape(viewUpdater.v_matrix, scout, [shapes], xy);
    }
    if (hover_shape && !hover_shape.prototypeInterAction) {
        let p = hover_shape.parent;
        if (p && p.type === ShapeType.Page) {
            return selectShapes(props.context, undefined);
        }
        while (p && p.type !== ShapeType.Page) {
            if (p.prototypeInterAction) {
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

const closeMenu = () => {
    isMenu.value = false;
}

const updateViewBox = (shape: ShapeView, type: PrototypeNavigationType | undefined, box: { top: number, bottom: number, left: number, right: number }) => {
    const cur_shape = props.context.selection.selectedShapes[0];
    if (!cur_shape) return;
    const cur_frame = cur_shape.frame;
    const m = new Matrix()
    m.reset(viewUpdater.v_matrix);
    if (type === PrototypeNavigationType.OVERLAY || type === PrototypeNavigationType.SWAP) {
        let s: ShapeView | undefined = shape;
        const frame = shape.frame;
        if (type === PrototypeNavigationType.SWAP) {
            const before_action = props.context.preview.swapEndAction;
            if (!before_action) return;
            s = getCurLayerShape(before_action.targetNodeID);
        }
        if (!s) return;
        const scale = viewUpdater.v_matrix.m00;
        m.trans((cur_frame.x - frame.x) * scale, (cur_frame.y - frame.y) * scale);
        if (s.overlayPositionType === OverlayPositions.CENTER) {
            const c_x = (frame.width * scale) / 2;
            const c_y = (frame.height * scale) / 2;
            const v_center = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 }
            m.trans(v_center.x - (box.left + c_x), v_center.y - (box.top + c_y));
        } else if (s.overlayPositionType === OverlayPositions.TOPCENTER) {
            const c_x = (frame.width * scale) / 2;
            const v_centerx = (box.left + box.right) / 2
            m.trans(v_centerx - (box.left + c_x), 0);
        } else if (s.overlayPositionType === OverlayPositions.TOPRIGHT) {
            const right = (frame.width * scale) + box.left;
            m.trans(box.right - right, 0);
        } else if (s.overlayPositionType === OverlayPositions.CENTERLEFT) {
            const c_y = (frame.height * scale) / 2;
            const v_centery = (box.top + box.bottom) / 2
            m.trans(0, v_centery - (box.top + c_y));
        } else if (s.overlayPositionType === OverlayPositions.CENTERRIGHT) {
            const c_y = (frame.height * scale) / 2;
            const v_centery = (box.top + box.bottom) / 2
            const right = (frame.width * scale) + box.left;
            m.trans(box.right - right, v_centery - (box.top + c_y));
        } else if (s.overlayPositionType === OverlayPositions.BOTTOMCENTER) {
            const c_x = (frame.width * scale) / 2;
            const v_centerx = (box.left + box.right) / 2
            const bottom = (frame.height * scale) + box.top;
            m.trans(v_centerx - (box.left + c_x), box.bottom - bottom);
        } else if (s.overlayPositionType === OverlayPositions.BOTTOMLEFT) {
            const bottom = (frame.height * scale) + box.top;
            m.trans(0, box.bottom - bottom);
        } else if (s.overlayPositionType === OverlayPositions.BOTTOMRIGHT) {
            const right = (frame.width * scale) + box.left;
            const bottom = (frame.height * scale) + box.top;
            m.trans(box.right - right, box.bottom - bottom);
        }
    }
    return m;
}

const getTargetShapes = () => {
    target_shapes.value = [];
    const page = props.context.selection.selectedPage;
    const shapes = getFrameList(page!);
    const actions = props.context.preview.interactionAction;
    isSuperposed.value = false;
    is_swap_shape.value = false;
    props.context.preview.setSupernatantIsOpen(false);
    if (actions.size === 0) return;
    actions.forEach(action => {
        const shape = shapes.find(item => item.id === action.targetNodeID);
        if (shape) {
            target_shapes.value.push(shape);
        }
    })
    const box = viewBox(props.context, viewUpdater.v_matrix);
    nextTick(() => {
        const protoActions = Array.from(actions.values());
        const els = document.querySelectorAll('.dailogCard');
        for (let i = 0; i < protoActions.length; i++) {
            const action = protoActions[i];
            const shape = shapes.find(item => item.id === action.targetNodeID);
            if (shape) {
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
                const m = updateViewBox(shape, action.navigationType, box);
                const el = els[i] as SVGSVGElement;
                if (m) {
                    el.style['transform'] = m.toString();
                    if (i === els.length - 1) {
                        end_matrix.value = m;
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

    const selectedShapes = props.context.selection.selectedShapes;
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
        <PageCard v-if="cur_shape" ref="pageCard" background-color="transparent" :data="(props.page as PageView)"
            :context="context" :shapes="[cur_shape]" @start-loop="startLoop" />
        <div ref="viewBoxDialog" id="proto_overflow" v-for="item in (target_shapes as ShapeView[])">
            <PageCard :key="item.id" class="dailogCard" ref="dailogCard" background-color="transparent"
                :data="(props.page as PageView)" :context="context" :shapes="[item]"/>
        </div>
        <div class="toggle" v-if="listLength">
            <div class="last" @click="togglePage(-1)" :class="{ disable: curPage === 1 }">
                <svg-icon icon-class="left-arrow"></svg-icon>
            </div>
            <div class="page">{{ curPage }} / {{ listLength }}</div>
            <div class="next" @click="togglePage(1)" :class="{ disable: listLength === curPage }">
                <svg-icon icon-class="right-arrow"></svg-icon>
            </div>
        </div>
        <MenuVue :context="context" :top="top" :left="left" v-if="isMenu" @close="closeMenu"></MenuVue>
        <ControlsView :context="context" :matrix="isSuperposed ? (end_matrix as Matrix) : viewUpdater.v_matrix">
        </ControlsView>
        <div class="overlay" v-if="is_overlay"></div>
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
</style>