<script setup lang="ts">
import { Context } from '@/context';
import { Preview, ScaleType } from '@/context/preview';
import { Matrix, PageView, Shape, XYsBounding } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { getFrameList } from '@/utils/preview';
import PageCard from "./PreviewPageCard.vue";
import MenuVue from './PreviewMenu.vue';
import { debounce } from 'lodash';
import { is_mac } from '@/utils/common';
import { ViewUpdater } from "@/components/Preview/viewUpdater";

const props = defineProps<{
    context: Context
    page: PageView
    showTop: boolean
}>();
type PCard = InstanceType<typeof PageCard>
const width = ref<number>(0);
const height = ref<number>(0);
const container = ref<HTMLElement | SVGElement>();
const preview = ref<HTMLDivElement>();
const cur_shape = ref<Shape>();
const matrix = new Matrix();
const listLength = ref(0);
const viewbox = ref<string>('0 0 0 0');
const curPage = ref(0);
const pageCard = ref<PCard>();
const spacePressed = ref<boolean>(false);

function page_watcher() {
    const shape = props.context.preview.selectedShape;
    const page = props.context.preview.selectedPage;

    cur_shape.value = shape;

    if (!shape || !page) return;

    viewUpdater.atPage(page.data);
    viewUpdater.atTarget(shape);

    const frameList = getFrameList(page);
    listLength.value = frameList.length;

    const index = frameList.findIndex(item => item.id === shape.id);
    curPage.value = index + 1;

    const frame = shape.boundingBox();
    width.value = frame.width;
    height.value = frame.height;
    viewbox.value = `0 0 ${frame.width} ${frame.height}`;

    initMatrix();
}

const togglePage = (p: number) => {
    const shape = props.context.preview.selectedShape;
    const page = props.context.preview.selectedPage;

    if (!shape || !page) return;

    cur_shape.value = shape;

    const frameList = getFrameList(page);
    let index = frameList.findIndex(item => item.id === shape.id);
    if (index === -1) return;
    index += p;
    if (index < 0 || index > (frameList.length - 1)) return;
    props.context.preview.selectShape(frameList[index]);
}


const previewWatcher = (t: number, s?: boolean) => {
    if (t === Preview.CHANGE_PAGE) {
        page_watcher();
        viewUpdater.atTarget(props.context.preview.selectedShape);
    } else if (t === Preview.CHANGE_SHAPE) {
        page_watcher();
        viewUpdater.atTarget(props.context.preview.selectedShape);
    } else if (t === Preview.MENU_CHANGE) {
        const type = props.context.preview.scaleType;
        if (type === ScaleType.Actual) {
            page_scale(1);
        } else if (type === ScaleType.FillScreen) {
            fillScreen();
        } else if (type === ScaleType.FitScreen) {
            fitScreen();
        } else if (type === ScaleType.FitWidth) {
            fitWidth();
        }
    } else if (t === Preview.NAVI_VISIBLE) {
        if (props.context.preview.naviState) {
            matrix.trans(-250, 0);
        } else {
            matrix.trans(250, 0);
        }
        if (pageCard.value && pageCard.value.pageSvg) {
            // todo
            // pageCard.value.pageSvg.style['transform'] = matrix.toString();
            // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
            viewUpdater.modifyTransform();
        }
    } else if (t === Preview.BEFORE_PAGE) {
        togglePage(-1);
    } else if (t === Preview.NEXT_PAGE) {
        togglePage(1);
    } else if (t === Preview.SCALE_CHANGE) {
        if (s) {
            page_scale(props.context.preview.scale + 0.1);
        } else {
            page_scale(props.context.preview.scale - 0.1);
        }
    }
}
const initMatrix = () => {
    const type = props.context.preview.scaleType;
    if (type === ScaleType.FillScreen) {
        fillScreen();
    } else if (type === ScaleType.FitScreen) {
        fitScreen();
    } else if (type === ScaleType.FitWidth) {
        fitWidth();
    } else {
        if (type === ScaleType.Actual) {
            props.context.preview.setScale(1);
        }
        center_view()
        center_scale()
        nextTick(() => {
            if (pageCard.value && pageCard.value.pageSvg) {
                // todo
                // pageCard.value.pageSvg.style['transform'] = matrix.toString();
                // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
                viewUpdater.modifyTransform();
            }
        })
    }
}

function center_view() {
    const m = new Matrix();
    matrix.reset(m);
    const shape = props.context.preview.selectedShape;
    if (!preview.value || !shape) return;
    const root = preview.value.getBoundingClientRect();
    const page = props.context.preview.selectedPage;
    if (!page) return;
    const pageFramev = page.frame;
    const shape_m = shape.matrix2Root();
    shape_m.trans(-pageFramev.x, -pageFramev.y);

    const frame = shape.frame
    const points = [[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => shape_m.computeCoord(p[0], p[1]));

    const box = XYsBounding(points)

    const shapeCenter = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };

    const contentViewCenter = { x: root.width / 2, y: root.height / 2 };
    const transX = contentViewCenter.x - shapeCenter.x;
    const transY = contentViewCenter.y - shapeCenter.y;

    if (!transX && !transY) {
        return;
    }
    matrix.trans(transX, transY);
}

const center_scale = () => {
    if (!preview.value) return;
    const root = preview.value.getBoundingClientRect();
    const offset = { x: root.width / 2, y: root.height / 2 };
    matrix.trans(-offset.x, -offset.y);
    matrix.scale(props.context.preview.scale);
    matrix.trans(offset.x, offset.y);
    props.context.preview.setScale(matrix.toArray()[0]);
}

function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    e.preventDefault();
    const shape = props.context.preview.selectedShape;
    if (!shape) return;
    const { ctrlKey, metaKey } = e;
    if (ctrlKey || metaKey) { // 缩放
        root_scale(e);
    } else {
        wheelTrans(e);
    }
}

const MAX_STEP = 120;
const wheelTrans = (e: WheelEvent) => {
    if (!preview.value) return;
    const root = preview.value.getBoundingClientRect();
    let stepx = Math.abs(e.deltaX) > MAX_STEP ? (MAX_STEP * (e.deltaX / Math.abs(e.deltaX))) : e.deltaX;
    let stepy = Math.abs(e.deltaY) > MAX_STEP ? (MAX_STEP * (e.deltaY / Math.abs(e.deltaY))) : e.deltaY;
    if (e.shiftKey && !is_mac() && e.deltaX < 1) {
        stepx = stepy;
        stepy = 0;
    }
    const bound = canDragging()!;
    if (bound.left < 0) {
        if (bound.left > stepx) stepx = bound.left;
    }
    if (bound.left >= 0 && stepx < 0) stepx = 0;
    if (bound.top < 0) {
        if (bound.top > stepy) stepy = bound.top;
    }
    if (bound.top >= 0 && stepy < 0) stepy = 0;
    if (bound.right > root.width) {
        if ((bound.right - root.width) < stepx) stepx = bound.right - root.width;
    }
    if (bound.right <= root.width && stepx > 0) stepx = 0;
    if (bound.bottom > root.height) {
        if ((bound.bottom - root.height) < stepy) stepy = bound.bottom - root.height;
    }
    if (bound.bottom <= root.height && stepy > 0) stepy = 0;

    matrix.trans(-stepx, -stepy);
    if (pageCard.value && pageCard.value.pageSvg) {
        // todo
        // pageCard.value.pageSvg.style['transform'] = matrix.toString();
        // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
        viewUpdater.modifyTransform();
    }
}

const MAX = 25600;
const MIN = 2;
const root_scale = (e: WheelEvent) => {
    let scale_delta = 1.3;
    if (Math.abs(e.deltaY) < 16 && Math.abs(e.deltaX) < 16) {
        scale_delta = 1.12;
    }
    const scale = Number((props.context.preview.scale * 100).toFixed(0));
    let scale_delta_ = 1 / scale_delta;
    if (scale <= MIN) {
        scale_delta_ = 1
    } else if (scale >= MAX) {
        scale_delta = MAX / scale;
    }
    const shape = props.context.preview.selectedShape;
    if (!preview.value || !shape) return;
    const bound = canDragging()!;
    const root = preview.value.getBoundingClientRect();
    const w = bound.right - bound.left;
    const h = bound.bottom - bound.top;
    if (w > root.width && h > root.height) {
        const offsetX = e.x - root.x;
        const offsetY = e.y - root.y;
        matrix.trans(-offsetX, -offsetY);
        matrix.scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
        matrix.trans(offsetX, offsetY);
    } else {
        center_view();
        const offset = { x: root.width / 2, y: root.height / 2 };
        matrix.trans(-offset.x, -offset.y);
        matrix.scale(Math.sign(e.deltaY) <= 0 ? Math.min(scale_delta * props.context.preview.scale, 256) : Math.max(scale_delta_ * props.context.preview.scale, 0.02));
        matrix.trans(offset.x, offset.y);
    }
    updateMatrix();
    props.context.preview.setScaleMenu(undefined);
}

function page_scale(scale: number) {
    props.context.preview.setScale(scale);
    initMatrix();
}

const fillScreen = () => {
    const shape = props.context.preview.selectedShape;
    if (!preview.value || !shape) return;
    center_view();
    const root = preview.value.getBoundingClientRect();
    const shape_m = shape.matrix2Root();
    const frame = shape.frame;
    const points = [[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => shape_m.computeCoord(p[0], p[1]));
    const box = XYsBounding(points)
    const width = box.right - box.left;
    const height = box.bottom - box.top;

    const w_scale = root.width / width;
    const h_scale = root.height / height;

    props.context.preview.setScale(Math.max(w_scale, h_scale));
    const offset = { x: root.width / 2, y: root.height / 2 };
    matrix.trans(-offset.x, -offset.y);
    matrix.scale(Math.max(w_scale, h_scale));
    matrix.trans(offset.x, offset.y);
    const s_w = (width * Math.max(w_scale, h_scale)) / 2;
    const s_h = (height * Math.max(w_scale, h_scale)) / 2;
    matrix.trans(s_w - offset.x, s_h - offset.y);

    if (pageCard.value && pageCard.value.pageSvg) {
        // todo
        // pageCard.value.pageSvg.style['transform'] = matrix.toString();
        // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
        viewUpdater.modifyTransform();
    }
}

function fitScreen() {
    const shape = props.context.preview.selectedShape;
    if (!preview.value || !shape) return;
    center_view();
    const root = preview.value.getBoundingClientRect();
    const shape_m = shape.matrix2Root();
    const frame = shape.frame;
    const points = [[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => shape_m.computeCoord(p[0], p[1]));
    const box = XYsBounding(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const w_max = root.width;
    const h_max = root.height;
    const ratio_w = width / w_max * 1.06; // 两边留点空白
    const ratio_h = height / h_max * 1.12; // 留点位置给容器标题
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        matrix.trans(-root.width / 2, -root.height / 2);
        const max = 256;
        if (matrix.m00 / ratio > 0.02 && matrix.m00 / ratio < max) {
            matrix.scale(1 / ratio);
        } else {
            if (matrix.m00 / ratio <= 0.02) {
                matrix.scale(0.02 / matrix.m00);
            } else if (matrix.m00 / ratio >= max) {
                matrix.scale(max / matrix.m00);
            }
        }
        matrix.trans(root.width / 2, root.height / 2);
    }
    updateMatrix();
}

function fitWidth() {
    const shape = props.context.preview.selectedShape;
    if (!preview.value || !shape) return;

    const root = preview.value.getBoundingClientRect();
    const shape_m = shape.matrix2Root();
    const frame = shape.frame;
    const points = [[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => shape_m.computeCoord(p[0], p[1]));
    const box = XYsBounding(points);
    const width = box.right - box.left;
    if (root.width > (width + 30)) {
        props.context.preview.setScale(1);
        center_view()
        center_scale()
        if (pageCard.value && pageCard.value.pageSvg) {
            // todo
            // pageCard.value.pageSvg.style['transform'] = matrix.toString();
            // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
            viewUpdater.modifyTransform();
        }
        return;
    }
    center_view();
    const w_max = root.width;
    const ratio = width / w_max * 1.12; // 两边留点空白
    if (ratio !== 1) {
        matrix.trans(-root.width / 2, -root.height / 2);
        const max = 256;
        if (matrix.m00 / ratio > 0.02 && matrix.m00 / ratio < max) {
            matrix.scale(1 / ratio);
        } else {
            if (matrix.m00 / ratio <= 0.02) {
                matrix.scale(0.02 / matrix.m00);
            } else if (matrix.m00 / ratio >= max) {
                matrix.scale(max / matrix.m00);
            }
        }
        matrix.trans(root.width / 2, root.height / 2);
    }
    updateMatrix();
}

const updateMatrix = () => {
    props.context.preview.setScale(matrix.toArray()[0]);
    if (pageCard.value && pageCard.value.pageSvg) {
        // todo
        // pageCard.value.pageSvg.style['transform'] = matrix.toString();
        // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
        viewUpdater.modifyTransform();
    }
}

const _initMatrix = debounce(initMatrix, 50);

const observer = new ResizeObserver(_initMatrix);

watch(() => props.showTop, (v) => {
    if (v) {
        matrix.trans(0, -46);
    } else {
        matrix.trans(0, 46);
    }
    if (pageCard.value && pageCard.value.pageSvg) {
        // todo
        // pageCard.value.pageSvg.style['transform'] = matrix.toString();
        // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
        viewUpdater.modifyTransform();
    }
})

const isMenu = ref(false);
const top = ref(0);
const left = ref(0);
let downXY = { x: 0, y: 0 };
let isDragging = false;
const onMouseDown = (e: MouseEvent) => {
    const shape = props.context.preview.selectedShape;
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
    const bound = canDragging()!;
    if (bound.left < 0) {
        if (-bound.left < dx) dx = -bound.left;
    }
    if (bound.left >= 0 && dx > 0) dx = 0;
    if (bound.top < 0) {
        if (-bound.top < dy) dy = -bound.top;
    }
    if (bound.top >= 0 && dy > 0) dy = 0;
    if (bound.right > root.width) {
        if ((root.width - bound.right) > dx) dx = root.width - bound.right;
    }
    if (bound.right <= root.width && dx < 0) dx = 0;
    if (bound.bottom > root.height) {
        if ((root.height - bound.bottom) > dy) dy = root.height - bound.bottom;
    }
    if (bound.bottom <= root.height && dy < 0) dy = 0;
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
    if (pageCard.value && pageCard.value.pageSvg) {
        // todo
        // pageCard.value.pageSvg.style['transform'] = matrix.toString();
        // pageCard.value.pageSvg.style['transform'] = new Matrix().toString();
        viewUpdater.modifyTransform();
    }
}

const canDragging = () => {
    const shape = props.context.preview.selectedShape;
    if (!shape) return;
    const frame = shape.boundingBox();
    const xy = matrix.computeCoord(frame.x, frame.y);
    const wh = matrix.computeCoord(frame.x + frame.width, frame.y + frame.height);
    return { top: xy.y, left: xy.x, right: wh.x, bottom: wh.y }
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
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

const isSpacePressed = () => {
    const shape = props.context.preview.selectedShape;
    if (!preview.value || !shape) return;
    const root = preview.value.getBoundingClientRect();
    const frame = shape.frame;
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
        preview.value.style.cursor = 'grab'
    }
}

function onKeyUp(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || !preview.value) return;
    if (spacePressed.value && e.code === 'Space') {
        spacePressed.value = false;
        preview.value.style.cursor = 'default'
    }
}

const closeMenu = () => {
    isMenu.value = false;
}

const onMouseEnter = () => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}
const onMouseLeave = () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
}

// ====divide====
const viewUpdater = new ViewUpdater(props.context);

onMounted(() => {
    props.context.preview.watch(previewWatcher);

    page_watcher();

    // 等cur_shape触发pageCard的挂载
    nextTick(() => {
        // 然后初始化视图渲染管理器
        viewUpdater.mount(preview.value!, props.context.preview.selectedPage!.data, props.context.preview.selectedShape, pageCard.value);
    })

    if (preview.value) {
        observer.observe(preview.value);
    }
})
onUnmounted(() => {
    observer.disconnect();
    props.context.preview.unwatch(previewWatcher);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);

    viewUpdater.atTarget();
    viewUpdater.atPage();
})
</script>

<template>
    <div class="preview_container" ref="preview" @wheel="onMouseWheel" @mousedown="onMouseDown"
         @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <PageCard
            v-if="cur_shape"
            ref="pageCard"
            background-color="transparent"
            :data="(props.page as PageView)"
            :context="context"
            :shapes="[cur_shape]"
        />
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
    </div>
</template>

<style scoped lang="scss">
.preview_container {
    position: relative;
    background-color: black;

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
</style>