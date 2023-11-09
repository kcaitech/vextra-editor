<script setup lang="ts">
import {onMounted, reactive, ref, computed, onUnmounted} from "vue";
import {Context} from "@/context";
import {Perm} from "@/context/workspace";
import {
    check_orientation_during_movement, DragDetail,
    get_destination_by_drag_event,
    get_drag_detail,
    get_part_of_target1
} from "@/utils/listview";

export interface IDataIter<T extends { id: string }> {
    hasNext(): boolean;

    next(): T;
}

export interface IDataSource<T extends { id: string }> {
    length(): number;

    iterAt(index: number): IDataIter<T>;

    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void;
}

enum Orientation {
    H = "horizontal",
    V = "vertical"
}

const props = defineProps<{
    context?: Context,
    source: IDataSource<any>,
    itemView: any,
    itemWidth: number,
    itemHeight: number,
    firstIndex: number,
    orientation: "horizontal" | "vertical",
    location?: string,
    allowDrag?: boolean,
    shapeHeight?: number,
    pageHeight?: number,
    draging: "shapeList" | "pageList"
}>();

const emit = defineEmits<{
    (e: "drag-start", fromId: string): void;
    (e: "drag-over", overId: string): void;
    (e: "after-drag", wandererId: string, hostId: string, isOverHalf: boolean): void;
    (e: "after-drag-2", detail: {
        descend: string,
        layer: number,
        type: 'aside' | 'insert',
        position: 'upper' | 'inner' | 'lower'
    }): void;
}>();

const contents = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

let containerPosition = ref<{ x: number, y: number }>({x: 0, y: 0});
const scroll = reactive({x: 0, y: 0}); // 被滚走的内容长度，eg：'y: -100' -> '已经往上滚动100px'
let layoutIndex = 0; // 当前Dom渲染列表中第一个Dom在整个list对应的Dom列表中的index
const layoutResult = reactive(new Array<{ x: number, y: number, id: string, data: any }>()); // list
let visibleWidth = 0;
let visibleHeight = 0;
const measureWidth = ref(0); // width of listView
const measureHeight = ref(0); // height of listView
const prepareCount = 10; //  多准备的
const listMouseOver = ref<boolean>(false);

defineExpose({
    container,
    clampScroll,
    scroll
})

const relayout: { [key: string]: Function } = {};
relayout[Orientation.V] = () => {
    layoutResult.length = 0;
    layoutIndex = Math.max(0, Math.floor(-scroll.y / props.itemHeight));
    const iter = props.source.iterAt(layoutIndex);
    let i = layoutIndex;
    while (iter.hasNext()) {
        const data = iter.next();
        const y = i * props.itemHeight;
        i++;
        layoutResult.push({x: 0, y, id: data.id, data});
        if (y + props.itemHeight + scroll.y > visibleHeight) {
            break;
        }
    }
    scrollBar.length = Math.ceil((visibleHeight * visibleHeight) / measureHeight.value);
    scrollBar.mount = scrollBar.length < visibleHeight;
}
relayout[Orientation.H] = () => {
    layoutResult.length = 0;
    layoutIndex = Math.max(0, Math.floor(-scroll.x / props.itemWidth));
    const iter = props.source.iterAt(layoutIndex);
    let i = layoutIndex;
    while (iter.hasNext()) {
        const data = iter.next();
        const x = i * props.itemWidth;
        i++;
        layoutResult.push({x, y: 0, id: data.id, data});
        if (x + props.itemWidth + scroll.x > visibleWidth) {
            break;
        }
    }
    scrollBar.length = Math.ceil((visibleWidth * visibleWidth) / measureHeight.value);
    scrollBar.length && scrollBar.length !== visibleWidth && (scrollBar.mount = true);
}

const layoutUp: { [key: string]: Function } = {};
layoutUp[Orientation.V] = () => {
    if (layoutIndex <= 0) {
        return;
    }
    const si = Math.floor(-scroll.y / props.itemHeight);
    if (si - layoutIndex < prepareCount / 2) {
        // 去尾
        {
            const ei = Math.floor((-scroll.y + visibleHeight) / props.itemHeight);
            if (layoutIndex + layoutResult.length - ei > prepareCount + prepareCount / 2) {
                const del = layoutIndex + layoutResult.length - (ei + prepareCount)
                layoutResult.length = Math.max(0, layoutResult.length - del);
            }
        }

        const startIndex = Math.max(0, si - prepareCount);
        const iter = props.source.iterAt(startIndex);
        let i = startIndex;
        const result: { x: number, y: number, id: string, data: any }[] = [];
        while (iter.hasNext() && i < layoutIndex) {
            const data = iter.next();
            const y = i * props.itemHeight;
            i++;
            result.push({x: 0, y, id: data.id, data});
        }
        layoutIndex = startIndex;
        layoutResult.splice(0, 0, ...result);
    }
}
layoutUp[Orientation.H] = () => {
    if (layoutIndex <= 0) {
        return;
    }
    const si = Math.floor(-scroll.x / props.itemWidth);
    if (si - layoutIndex < prepareCount / 2) {
        // 去尾
        {
            const ei = Math.floor((-scroll.x + visibleWidth) / props.itemWidth);
            if (layoutIndex + layoutResult.length - ei > prepareCount + prepareCount / 2) {
                const del = layoutIndex + layoutResult.length - (ei + prepareCount)
                layoutResult.length = Math.max(0, layoutResult.length - del);
            }
        }

        const startIndex = Math.max(0, si - prepareCount);
        const iter = props.source.iterAt(startIndex);
        let i = startIndex;
        const result: { x: number, y: number, id: string, data: any }[] = [];
        while (iter.hasNext() && i < layoutIndex) {
            const data = iter.next();
            const x = i * props.itemWidth;
            i++;
            result.push({x, y: 0, id: data.id, data});
        }
        layoutIndex = startIndex;
        layoutResult.splice(0, 0, ...result);
    }
}

const layoutDown: { [key: string]: Function } = {};
layoutDown[Orientation.V] = () => {
    if (layoutIndex + layoutResult.length >= props.source.length()) return;
    const si = (-scroll.y + visibleHeight) / props.itemHeight;
    if (layoutIndex + layoutResult.length - si < prepareCount / 2) {
        // 掐头
        {
            const vi = Math.floor(-scroll.y / props.itemHeight);
            if (vi - layoutIndex > prepareCount + prepareCount / 2) {
                const del = vi - prepareCount - layoutIndex;
                layoutResult.splice(0, del);
                layoutIndex += del;
            }
        }

        const endIndex = Math.min(props.source.length(), si + prepareCount);
        const startIndex = layoutIndex + layoutResult.length;
        const iter = props.source.iterAt(startIndex);
        let i = startIndex;
        while (iter.hasNext() && i < endIndex) {
            const data = iter.next();
            const y = i * props.itemHeight;
            i++;
            layoutResult.push({x: 0, y, id: data.id, data});
        }
    }
}
layoutDown[Orientation.H] = () => {
    if (layoutIndex + layoutResult.length >= props.source.length()) {
        return;
    }
    const si = (-scroll.x + visibleWidth) / props.itemWidth;
    if (layoutIndex + layoutResult.length - si < prepareCount / 2) {
        // 掐头
        {
            const vi = Math.floor(-scroll.x / props.itemWidth);
            if (vi - layoutIndex > prepareCount + prepareCount / 2) {
                const del = vi - prepareCount - layoutIndex;
                layoutResult.splice(0, del);
                layoutIndex += del;
            }
        }

        const endIndex = Math.min(props.source.length(), si + prepareCount);
        const startIndex = layoutIndex + layoutResult.length;
        const iter = props.source.iterAt(startIndex);
        let i = startIndex;
        while (iter.hasNext() && i < endIndex) {
            const data = iter.next();
            const x = i * props.itemWidth;
            i++;
            layoutResult.push({x, y: 0, id: data.id, data});
        }
    }
    scrollBar.length = Math.ceil((visibleHeight * visibleHeight) / measureHeight.value);
    scrollBar.length && scrollBar.length !== visibleHeight && (scrollBar.mount = true);
}

// list视口高度/宽度测量
const viewMeasure: { [key: string]: Function } = {};
viewMeasure[Orientation.V] = () => {
    measureHeight.value = props.source.length() * props.itemHeight;
    measureWidth.value = props.itemWidth;
}
viewMeasure[Orientation.H] = () => {
    measureHeight.value = props.itemHeight;
    measureWidth.value = props.source.length() * props.itemWidth;
}

// todo
// 局部更新 ?
// 滚动到可见

// let offset = 0;
props.source.onChange((index: number, del: number, insert: number, modify: number): void => {
    if (props.orientation == Orientation.V) {
        measureHeight.value = props.source.length() * props.itemHeight;
        measureWidth.value = props.itemWidth;
    } else {
        measureHeight.value = props.itemHeight;
        measureWidth.value = props.source.length() * props.itemWidth;
    }
    // console.log("change measure", measureWidth.value, measureHeight.value)

    let needRelayout = false;
    let needLayoutDown = false;
    let needLayoutUp = false;

    if (del > 0 && layoutResult.length > 0) {
        // 是否与现在排版的相交
        const ds = index;
        const de = index + del; // 开
        const ls = layoutIndex;
        const le = layoutIndex + layoutResult.length; // 开
        if (de > ls && ds < le) { // 相交
            if (ds <= ls && de >= le) { // 覆盖
                layoutResult.length = 0;
                layoutIndex = index;
                // 调整scroll
                if (props.orientation == Orientation.V) {
                    const transy = -layoutIndex * props.itemHeight;
                    clampScroll(scroll.x, transy);
                } else {
                    const transx = -layoutIndex * props.itemWidth;
                    clampScroll(transx, scroll.y);
                }
                needRelayout = true;
            } else if (ds > ls && de < le || de >= le) {
                layoutResult.length = ds - ls;
                clampScroll(scroll.x, scroll.y);
                needLayoutDown = true;
            } else {
                layoutResult.length = 0;
                needRelayout = true;
                layoutIndex = index;

                if (props.orientation == Orientation.V) {
                    clampScroll(scroll.x, scroll.y + del * props.itemHeight)
                } else {
                    clampScroll(scroll.x + del * props.itemWidth, scroll.y)
                }
            }
        } else if (de < ls) {
            // 需要调整每个item的位置，这里简单直接重排 todo,增加offset,减少不必要的更新
            layoutResult.length = 0;
            needRelayout = true;
            layoutIndex = index;

            if (props.orientation == Orientation.V) {
                clampScroll(scroll.x, scroll.y + del * props.itemHeight)
            } else {
                clampScroll(scroll.x + del * props.itemWidth, scroll.y)
            }
        } else {
            // 删除当前排版后面，不需要处理
        }
    }
    if (insert > 0 && layoutResult.length > 0) {
        const ls = layoutIndex;
        const le = layoutIndex + layoutResult.length; // 开
        const is = index;
        const ie = index + insert; // 开
        if (!(is > ls)) {
            // 在前面插入，调整scroll
            layoutResult.length = 0;
            needRelayout = true;
            if (props.orientation == Orientation.V) {
                clampScroll(scroll.x, scroll.y - insert * props.itemHeight)
            } else {
                clampScroll(scroll.x - insert * props.itemWidth, scroll.y)
            }
        } else if (is > ls && is < le) {
            layoutResult.length = is - ls;
            needLayoutDown = true;
            clampScroll(scroll.x, scroll.y);
        } else {
            // 不需要处理
        }
    } else if (insert > 0) {
        needRelayout = true;
    }

    if (modify > 0) {
        needRelayout = true;
        clampScroll(scroll.x, scroll.y);
    }

    if (needRelayout || needLayoutDown && needLayoutUp) {
        relayout[props.orientation](); // todo
    } else if (needLayoutDown) {
        layoutDown[props.orientation]();
    } else if (needLayoutUp) {
        layoutUp[props.orientation]();
    }
})

// 用绝对坐标定位
function clampScroll(transx: number, transy: number) {
    if (transx >= 0) {
        transx = 0;
    } else if (-transx + visibleWidth > measureWidth.value) {
        if (measureWidth.value <= visibleWidth) {
            transx = 0;
        } else {
            transx = -(measureWidth.value - visibleWidth)
        }
    }
    if (transy >= 0) {
        transy = 0;
    } else if (-transy + visibleHeight > measureHeight.value) {
        if (measureHeight.value <= visibleHeight) {
            transy = 0;
        } else {
            transy = -(measureHeight.value - visibleHeight)
        }
    }
    scroll.x = transx;
    scroll.y = transy;
    scrollBar.x = Math.abs(Math.ceil((transx * visibleWidth) / measureHeight.value));
    scrollBar.y = Math.abs(Math.ceil((transy * visibleHeight) / measureHeight.value));
}

// list内鼠标事件
function onMouseWheel(e: WheelEvent) {
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    const transx = scroll.x - deltaX;
    const transy = scroll.y - deltaY;

    clampScroll(transx, transy);

    const V = props.orientation === Orientation.V
    const delta = V ? deltaY : deltaX;
    if (delta < 0) {
        layoutUp[props.orientation]();
    } else {
        layoutDown[props.orientation]();
    }
}

function mouseenter() {
    listMouseOver.value = true;
}

function mouseleave() {
    listMouseOver.value = false;
}

// #region 滚动条
const scrollBar = reactive({length: 0, mount: false, x: 0, y: 0}); // 滚动条滑块对象 eg: 'y: 100' -> '滚动条滑块距离起始位置的距离为100px'
const scrollTrack = ref<HTMLDivElement>();
const bar = ref<HTMLDivElement>();
const mouseOffsetOfBar: { x: number, y: number } = {x: 0, y: 0}; // 鼠标相对滚动条滑块的位置
const scrolling = ref<boolean>(false)

function onScrollTrackClick(e: MouseEvent) {
    if (e.target !== scrollTrack.value) return;
    const {offsetX, offsetY} = e;
    const H = props.orientation === Orientation.H;

    const pageSize = H ? visibleWidth : visibleHeight;

    const deltaX = H ? offsetX - scrollBar.x : 0;
    const deltaY = H ? 0 : offsetY - scrollBar.y;

    const delta = H ? deltaX : deltaY

    if (delta > 0) {
        H ? clampScroll(scroll.x - pageSize, 0) : clampScroll(0, scroll.y - pageSize);
        layoutDown[props.orientation]();
    } else {
        H ? clampScroll(scroll.x + pageSize, 0) : clampScroll(0, scroll.y + pageSize);
        layoutUp[props.orientation]();
    }
}

function onScrollBarMouseDown(e: MouseEvent) {
    const {x: scrollBarX, y: scrollBarY} = scrollBar;
    const {clientX: mouseX, clientY: mouseY} = e;
    mouseOffsetOfBar.x = mouseX - scrollBarX;
    mouseOffsetOfBar.y = mouseY - scrollBarY;
    document.addEventListener('mouseup', onScrollBarMouseUp);
    document.addEventListener('mousemove', mouseMoveAfterScrollBarMouseDown)
}

function mouseMoveAfterScrollBarMouseDown(e: MouseEvent) {
    scrolling.value = true;

    const {clientX: mouseX, clientY: mouseY} = e;
    const {x: scrollBarX, y: scrollBarY} = scrollBar;
    const {x: mouseOffsetOfBarX, y: mouseOffsetOfBarY} = mouseOffsetOfBar;

    const deltaX = mouseX - scrollBarX - mouseOffsetOfBarX;
    const deltaY = mouseY - scrollBarY - mouseOffsetOfBarY;

    const moveX = Math.min(Math.max(0, mouseX - mouseOffsetOfBarX), visibleWidth - scrollBar.length);
    const moveY = Math.min(Math.max(0, mouseY - mouseOffsetOfBarY), visibleHeight - scrollBar.length);

    scrollBar.y = props.orientation === Orientation.H ? 0 : moveY;
    scrollBar.x = props.orientation === Orientation.V ? 0 : moveX;

    const transy = Math.abs(Math.ceil((moveY * measureHeight.value) / visibleHeight));
    const transx = Math.abs(Math.ceil((moveX * measureWidth.value) / visibleWidth));

    const delta = props.orientation === Orientation.V ? deltaY : deltaX;

    if (delta > 0) {
        clampScroll(-transx, -transy);
        layoutDown[props.orientation]();
    } else if (delta < 0) {
        clampScroll(-transx, -transy);
        layoutUp[props.orientation]();
    }
}

function onScrollBarMouseUp() {
    scrolling.value = false
    document.removeEventListener('mouseup', onScrollBarMouseUp);
    document.removeEventListener('mousemove', mouseMoveAfterScrollBarMouseDown);
}

// #endregion

// #region 列表子元素换位处理
const currentHoverTarget = ref<Element | null>(null);
const hoverItem = ref<{ x: number, y: number, id: string, data: any }>();
const mousedown = ref<boolean>(false);
const fromIndex = ref<number>(0);
const toIndex = ref<number>(0);
const wandererId = ref<string>('');
const draging = ref<boolean>(false);
const mouseBegin: { x: number, y: number } = {x: 0, y: 0};
const destination = ref<{ x: number, y: number, length: number }>({x: 0, y: 0, length: 20});
const destinationMount = ref<boolean>(false);
const substitute = ref<{ x: number, y: number, context: string }>({x: 0, y: 0, context: ''});
const substituteName = ref<string>('')
const port_a_visible = ref<boolean>(false);
const port_i_visible = ref<boolean>(false);
let drag_result_detail: DragDetail | undefined = undefined;

function mouseDownOnItem(index: number, e: MouseEvent) {
    if (e.button !== 0) return; // 图层拖动只支持左键
    if (props.context?.workspace.documentPerm !== Perm.isEdit) return; // 没有编辑权限
    if (props.context.tool.isLable) return; // 标注模式  todo 统一整合到allowDrag属性上是更好的设计
    if (!props.allowDrag) return; // 不允许拖动
    // record fromIndex && pre to take off
    fromIndex.value = index;
    toIndex.value = index;
    wandererId.value = layoutResult[fromIndex.value].id;
    mousedown.value = true;
    mouseBegin.x = e.clientX;
    mouseBegin.y = e.clientY;
    substitute.value.context = layoutResult[fromIndex.value].data.name
    substituteName.value = layoutResult[fromIndex.value].data.shape?.name

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
}

let scroll_timer: any = null

function mouseMove(event: MouseEvent) {
    event.stopPropagation();
    port_a_visible.value = false;
    port_i_visible.value = false;
    if (!container.value) return;
    if (!(currentHoverTarget.value && hoverItem.value)) return;

    const {clientX, clientY} = event;
    if (!draging.value) {
        const diff = Math.hypot(clientX - mouseBegin.x, clientY - mouseBegin.y);
        if (diff < 6) return;
        draging.value = true;
        emit('drag-start', wandererId.value);
    }

    if (scroll_timer) clearInterval(scroll_timer);

    const orientation = check_orientation_during_movement(container.value, event);
    if (orientation !== 'middle') {
        port_a_visible.value = false;
        port_i_visible.value = false;
        let step = -5;
        if (orientation === "top") {
            step = -step;
        }
        scroll_timer = setInterval(() => {
            let need_clear = false;
            scroll.y += step;
            if (scroll.y > 0) {
                scroll.y = 0;
                need_clear = true;
            }
            if (scroll.y < -(measureHeight.value - visibleHeight)) {
                scroll.y = -(measureHeight.value - visibleHeight);
                need_clear = true;
            }
            clampScroll(0, scroll.y)
            orientation === "top" ? layoutUp[props.orientation]() : layoutDown[props.orientation]();
            if (need_clear) clearInterval(scroll_timer);
        }, 10)
        return;
    }

    // 计算终点位置
    const position = get_part_of_target1(currentHoverTarget.value, event);
    // console.log('position:', position);
    const start_y = toIndex.value * props.itemHeight - 1 - (scroll.y % 30 === 0 ? scroll.y : scroll.y - scroll.y % 30);
    const _destination = get_destination_by_drag_event(position, start_y, props.itemHeight);
    if (_destination.type === "insert") {
        port_i_visible.value = true;
        destination.value.x = 6;
        destination.value.y = start_y;
    } else {
        port_a_visible.value = true;
        destination.value.x = _destination.x;
        destination.value.y = _destination.y;

    }
    drag_result_detail = get_drag_detail(layoutResult[toIndex.value].id, position, _destination);
}

function itemOnHover(e: MouseEvent, index: number) {
    if (!props.allowDrag || !mousedown.value || !(e.target instanceof Element)) return;
    destinationMount.value = true;
    currentHoverTarget.value = e.target.closest('.list-item');
    toIndex.value = index;
    hoverItem.value = layoutResult[index];
}

function descend(from: number, to: number) {
    if (from === to) return;
    return layoutResult[from];
}

function mouseUp() {
    clearInterval(scroll_timer)
    // close events && check descend port && descend
    mousedown.value = false;
    destinationMount.value = false;
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
    if (draging.value) {
        const dragTarget = descend(fromIndex.value, toIndex.value);
        let host_id = '';
        if (dragTarget) {
            host_id = layoutResult[toIndex.value].id;
        }
        emit('after-drag', wandererId.value, host_id, false);
        if (drag_result_detail) {
            emit('after-drag-2', drag_result_detail);
        }
        draging.value = false;
        port_a_visible.value = false;
        port_i_visible.value = false;
        drag_result_detail = undefined;
    }
}

// #endregion

const observer = new ResizeObserver(() => {
    const el = container.value;
    if (el) {
        containerPosition.value.x = el.getBoundingClientRect().x;
        containerPosition.value.y = el.getBoundingClientRect().y;
        visibleHeight = el.clientHeight;
        visibleWidth = el.clientWidth;
        relayout[props.orientation]();
    }
})

// hooks
onMounted(() => {
    container.value && observer.observe(container.value);
    viewMeasure[props.orientation]();
    relayout[props.orientation]();
})
onUnmounted(() => {
    observer.disconnect();
})
</script>

<template>
    <div class="container" @wheel.prevent="onMouseWheel" @mouseenter="mouseenter" @mouseleave="mouseleave"
         ref="container">
        <!-- items container -->
        <div :class="orientation" :style="{
            transform: 'translate(' + scroll.x + 'px ,' + scroll.y + 'px)',
            width: orientation === 'horizontal' ? measureWidth + 'px' : 'auto',
            height: orientation === 'vertical' ? measureHeight + 'px' : 'auto'
        }" ref="contents">
            <component class="list-item" :is="props.itemView" v-for="(c, i) in layoutResult" :key="c.id" :data="c.data"
                       v-bind="$attrs" @mousedown.stop="(e: MouseEvent) => mouseDownOnItem(i, e)"
                       @mouseover.stop="(e: MouseEvent) => itemOnHover(e, i)"
                       :style="{ left: c.x + 'px', top: c.y + 'px' }"/>
            <div class="port" v-if="port_a_visible" :style="{
                            top: destination.y + 'px', left: destination.x + 'px'
                        }"></div>
            <div class="port-2" v-if="port_i_visible" :style="{
                            top: destination.y + 'px'
                        }"></div>
            <!--            <div class="substitute" v-if="substituteVisible" :style="{-->
            <!--                top: `${substitute.y}px`,-->
            <!--                left: `${substitute.x}px`-->
            <!--            }">{{ substitute.context || substituteName }}-->
            <!--            </div>-->
        </div>
        <!-- scroll -->
        <div ref="scrollTrack" class="scroll-track" @click="onScrollTrackClick" :style="{
            opacity: scrollBar.mount && (listMouseOver || scrolling || draging) ? 1 : 0,
        }">
            <div ref="bar" @mousedown.stop="onScrollBarMouseDown" class="scroll-bar" :style="{
                top: scrollBar.y + 'px',
                left: scrollBar.x + 'px',
                height: scrollBar.length + 'px'
            }"></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
// 这个样式表决定定位和计算结果,不可以轻易修改
.container {
    overflow: hidden;
    position: relative;
    outline: none;

    > .horizontal,
    .vertical {
        > .list-item {
            position: absolute;
        }

        > .port {
            position: absolute;
            background-color: var(--active-color);
            height: 2px;
            width: 100%;
        }

        > .port-2 {
            position: absolute;
            border: 2px solid var(--active-color);
            width: calc(100% - 12px);
            height: 30px;
            left: 6px;
            box-sizing: border-box;
            border-radius: 2px;
        }

        > .port::before {
            content: "";
            width: 2px;
            height: 18px;
            position: absolute;
            top: -8px;
            left: 0;
            background-color: var(--active-color);
        }

        > .substitute {
            position: absolute;
            height: 32px;
            min-width: 40px;
            color: rgba($color: #000000, $alpha: 0.25);
            font-size: var(--font-default-fontsize);
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }

    .horizontal {
        display: flex;
        flex-flow: row nowrap;
        width: auto;
        height: 100%;
    }

    .vertical {
        width: 100%;
        height: auto;
    }

    .vertical + .scroll-track {
        width: 6px;
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        overflow: hidden;

        > .scroll-bar {
            width: 100%;
            position: relative;
            background-color: #dddddd;
            border-radius: 6px;
        }

        > .scroll-bar:hover {
            background-color: #bbbbbb;
        }
    }
}
</style>