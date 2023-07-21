<script setup lang="ts">
import { onMounted, reactive, ref, computed, onUnmounted } from "vue";
import { Context } from "@/context";
import { Perm } from "@/context/workspace";

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
    // wanderer：被拖拽的项目；host：目的地处的项目； isOverHalf：落地在目的地是否上下过半，影响插入位置在目的地的上下位置。
    (e: "after-drag", wandererId: string, hostId: string, isOverHalf: boolean): void;
}>();

const contents = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();

let containerPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const scroll = reactive({ x: 0, y: 0 }); // 被滚走的内容长度，eg：'y: -100' -> '已经往上滚动100px'
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
        layoutResult.push({ x: 0, y, id: data.id, data });
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
        layoutResult.push({ x, y: 0, id: data.id, data });
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
            result.push({ x: 0, y, id: data.id, data });
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
            result.push({ x, y: 0, id: data.id, data });
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
            layoutResult.push({ x: 0, y, id: data.id, data });
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
            layoutResult.push({ x, y: 0, id: data.id, data });
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
    }
    else {
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
                }
                else {
                    const transx = -layoutIndex * props.itemWidth;
                    clampScroll(transx, scroll.y);
                }
                needRelayout = true;
            }
            else if (ds > ls && de < le || de >= le) {
                layoutResult.length = ds - ls;
                clampScroll(scroll.x, scroll.y);
                needLayoutDown = true;
            }
            else {
                layoutResult.length = 0;
                needRelayout = true;
                layoutIndex = index;

                if (props.orientation == Orientation.V) {
                    clampScroll(scroll.x, scroll.y + del * props.itemHeight)
                }
                else {
                    clampScroll(scroll.x + del * props.itemWidth, scroll.y)
                }
            }
        }
        else if (de < ls) {
            // 需要调整每个item的位置，这里简单直接重排 todo,增加offset,减少不必要的更新
            layoutResult.length = 0;
            needRelayout = true;
            layoutIndex = index;

            if (props.orientation == Orientation.V) {
                clampScroll(scroll.x, scroll.y + del * props.itemHeight)
            }
            else {
                clampScroll(scroll.x + del * props.itemWidth, scroll.y)
            }
        }
        else {
            // 删除当前排版后面，不需要处理
        }
    }
    if (insert > 0 && layoutResult.length > 0) {
        const ls = layoutIndex;
        const le = layoutIndex + layoutResult.length; // 开
        const is = index;
        const ie = index + insert; // 开
        if (is <= ls) {
            // 在前面插入，调整scroll
            layoutResult.length = 0;
            needRelayout = true;
            if (props.orientation == Orientation.V) {
                clampScroll(scroll.x, scroll.y - insert * props.itemHeight)
            }
            else {
                clampScroll(scroll.x - insert * props.itemWidth, scroll.y)
            }
        }
        else if (is > ls && is < le) {
            layoutResult.length = is - ls;
            needLayoutDown = true;
            clampScroll(scroll.x, scroll.y);
        }
        else {
            // 不需要处理
        }
    }
    else if (insert > 0) {
        needRelayout = true;
    }

    if (modify > 0) {
        needRelayout = true;
        clampScroll(scroll.x, scroll.y);
    }

    if (needRelayout || needLayoutDown && needLayoutUp) {
        relayout[props.orientation](); // todo
    }
    else if (needLayoutDown) {
        layoutDown[props.orientation]();
    }
    else if (needLayoutUp) {
        layoutUp[props.orientation]();
    }
})

// 用绝对坐标定位
function clampScroll(transx: number, transy: number) {
    if (transx >= 0) {
        transx = 0;
    }
    else if (-transx + visibleWidth > measureWidth.value) {
        if (measureWidth.value <= visibleWidth) {
            transx = 0;
        } else {
            transx = -(measureWidth.value - visibleWidth)
        }
    }
    if (transy >= 0) {
        transy = 0;
    }
    else if (-transy + visibleHeight > measureHeight.value) {
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
    }
    else {
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
const scrollBar = reactive({ length: 0, mount: false, x: 0, y: 0 }); // 滚动条滑块对象 eg: 'y: 100' -> '滚动条滑块距离起始位置的距离为100px'
const scrollTrack = ref<HTMLDivElement>();
const bar = ref<HTMLDivElement>();
const mouseOffsetOfBar: { x: number, y: number } = { x: 0, y: 0 }; // 鼠标相对滚动条滑块的位置
const scrolling = ref<boolean>(false)

function onScrollTrackClick(e: MouseEvent) {
    if (e.target !== scrollTrack.value) return;
    const { offsetX, offsetY } = e;
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
    const { x: scrollBarX, y: scrollBarY } = scrollBar;
    const { clientX: mouseX, clientY: mouseY } = e;
    mouseOffsetOfBar.x = mouseX - scrollBarX;
    mouseOffsetOfBar.y = mouseY - scrollBarY;
    document.addEventListener('mouseup', onScrollBarMouseUp);
    document.addEventListener('mousemove', mouseMoveAfterScrollBarMouseDown)
}

function mouseMoveAfterScrollBarMouseDown(e: MouseEvent) {
    scrolling.value = true;

    const { clientX: mouseX, clientY: mouseY } = e;
    const { x: scrollBarX, y: scrollBarY } = scrollBar;
    const { x: mouseOffsetOfBarX, y: mouseOffsetOfBarY } = mouseOffsetOfBar;

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
const currentHoverTarget = ref<HTMLDivElement | EventTarget | null>();
const mousedown = ref<boolean>(false);
const fromIndex = ref<number>(0);
const toIndex = ref<number>(0);
const wandererId = ref<string>('');
let offsetOverhalf: boolean = false; // 过半，在hover节点下面插入被拖动节点，反则上面
const draging = ref<boolean>(false);
const mouseBegin: { x: number, y: number } = { x: 0, y: 0 };
const destination = ref<{ x: number, y: number, length: number }>({ x: 0, y: 0, length: 20 });
const destinationMount = ref<boolean>(false);
const substitute = ref<{ x: number, y: number, context: string }>({ x: 0, y: 0, context: '' });
const substituteName = ref<string>('')
const listTop = ref<number>(0)
const listBottom = ref<number>(0)
const scrollHeight = ref<number>(0)
const destinationVisible = computed(() => {
    return draging.value && destinationMount.value && (fromIndex.value !== toIndex.value)
})
const substituteVisible = computed(() => {
    return draging.value
})
function mouseDownOnItem(index: number, e: MouseEvent) {
    if(props.context?.workspace.documentPerm !== Perm.isEdit) return
    if (e.button !== 0) return; // 图层拖动只支持左键
    if (!props.allowDrag) return;
    // record fromIndex && pre to take off
    fromIndex.value = index;
    wandererId.value = layoutResult[fromIndex.value].id;
    toIndex.value = index;
    mousedown.value = true;
    mouseBegin.x = e.clientX;
    mouseBegin.y = e.clientY;
    substitute.value.context = layoutResult[fromIndex.value].data.name
    substituteName.value = layoutResult[fromIndex.value].data.shape?.name

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
}
let timer: any = null
function mouseMove(event: MouseEvent) {
    event.stopPropagation();
    const { clientX, clientY } = event;
    if (timer) clearInterval(timer)
    if (Math.hypot(clientX - mouseBegin.x, clientY - mouseBegin.y) < 6 && !draging.value) return;
    draging.value = true;
    if ((currentHoverTarget.value as HTMLDivElement)?.getBoundingClientRect) {
        let { x, y } = (currentHoverTarget.value as HTMLDivElement)?.getBoundingClientRect();
        const offsetX: number = clientX - x;
        const offsetY: number = clientY - y; //相对于鼠标在列表移动的距离
        const offset = props.orientation === Orientation.H ? offsetX : offsetY; //0-30px
        const itemRange = props.orientation === Orientation.H ? props.itemWidth : props.itemHeight; //30px
        if ((offset >= 0) && (offset <= itemRange / 2)) {
            offsetOverhalf = false;
        } else if ((offset > itemRange / 2) && (offset <= itemRange)) {
            offsetOverhalf = true;
        }
        if (props.shapeHeight && props.draging === 'shapeList') {
            listTop.value = document.documentElement.offsetHeight - props.shapeHeight
            scrollHeight.value = Math.abs(scroll.y) + props.shapeHeight - container.value!.offsetTop
            listBottom.value = document.documentElement.offsetHeight - clientY
        } else if (props.pageHeight && props.draging === 'pageList') {
            const top = container.value?.getBoundingClientRect()
            listTop.value = top?.top! - 75
            listBottom.value = clientY - (props.pageHeight + top?.top! - 15)
            scrollHeight.value = Math.abs(scroll.y) + props.pageHeight
        }
        if (scroll.y < 0 && clientY - listTop.value < 90 && clientY - listTop.value > 60) {
            timer = setInterval(() => {
                scroll.y = scroll.y + 1
                substitute.value.y = (clientY - containerPosition.value.y + 14) - (scroll.y % 30 === 0 ? scroll.y : scroll.y - scroll.y % 30);
                clampScroll(0, scroll.y)
                layoutUp[props.orientation]();
                if (scroll.y === 0) clearInterval(timer)
            }, 10)
        } else if (scroll.y <= 0 && listBottom.value < 30 && listBottom.value > 0 && props.source.length() * props.itemHeight > scrollHeight.value) {
            timer = setInterval(() => {
                scroll.y = scroll.y - 1
                substitute.value.y = (clientY - containerPosition.value.y + 14) - (scroll.y % 30 === 0 ? scroll.y : scroll.y - scroll.y % 30);
                clampScroll(0, scroll.y)
                layoutUp[props.orientation]();
                if (scroll.y === 0) clearInterval(timer)
            }, 10)
        }
        const text = (currentHoverTarget.value as Element).closest('.contain')?.children
        const shapew = text && text[3].clientWidth
        if (shapew && props.draging === 'shapeList') {
            destination.value.length = shapew
        } else if (props.draging === 'pageList') {
            const text = (currentHoverTarget.value as Element).closest('.pageItem')?.children
            const pagew = text && text[1].clientWidth
            destination.value.length = pagew!
        }
        destination.value.y = offsetOverhalf ? ((toIndex.value + 1) * props.itemHeight - 1) - (scroll.y % 30 === 0 ? scroll.y : scroll.y - scroll.y % 30) : (toIndex.value * props.itemHeight - 1) - (scroll.y % 30 === 0 ? scroll.y : scroll.y - scroll.y % 30);
    }
    // 填充替身内容 && 计算替身位置
    substitute.value.y = (clientY - containerPosition.value.y + 14) - (scroll.y % 30 === 0 ? scroll.y : scroll.y - scroll.y % 30);
    substitute.value.x = clientX - containerPosition.value.x;
}

function itemOnHover(e: MouseEvent, index: number) {
    // update currenthovertarget、toIndex
    if (!props.allowDrag || !mousedown.value) return;
    destinationMount.value = true
    currentHoverTarget.value = e.target;
    toIndex.value = index
}

function descend(from: number, to: number) {
    if (from === to) return;
    const target = layoutResult[from];
    return target;
}
function mouseUp() {
    clearInterval(timer)
    if (!props.allowDrag) return;
    // close events && check descend port && descend
    mousedown.value = false;
    destinationMount.value = false;
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
    if (draging.value) {
        const dragTarget = descend(fromIndex.value, toIndex.value);
        if (dragTarget) {
            // emit('update-after-drag', { from: fromIndex.value, to: toIndex.value, dragTarget });
            const hostId: string = layoutResult[toIndex.value].id;
            emit('after-drag', wandererId.value, hostId, offsetOverhalf);
        }
        draging.value = false;
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
    <div class="container" @wheel.prevent="onMouseWheel" @mouseenter="mouseenter" @mouseleave="mouseleave" ref="container">
        <!-- items container -->
        <div :class="orientation" :style="{
            transform: 'translate(' + scroll.x + 'px ,' + scroll.y + 'px)',
            width: orientation === 'horizontal' ? measureWidth + 'px' : 'auto',
            height: orientation === 'vertical' ? measureHeight + 'px' : 'auto'
        }" ref="contents">
            <component class="listitem" :is="props.itemView" v-for="(c, i) in layoutResult" :key="c.id" :data="c.data"
                v-bind="$attrs" @mousedown.stop="(e: MouseEvent) => mouseDownOnItem(i, e)"
                @mouseover.stop="(e: MouseEvent) => itemOnHover(e, i)" :style="{ left: c.x + 'px', top: c.y + 'px' }" />
            <div class="port" v-if="destinationVisible" :style="{
                top: destination.y + 'px',
                width: destination.length + 'px',
            }"></div>
            <div class="substitute" v-if="substituteVisible" :style="{
                top: `${substitute.y}px`,
                left: `${substitute.x}px`
            }">{{ substitute.context || substituteName }}</div>
        </div>
        <!-- scroll -->
        <div ref="scrollTrack" class="scroll-track" @click="onScrollTrackClick" :style="{
            opacity: scrollBar.mount && (listMouseOver || scrolling) ? 1 : 0,
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
.container {
    overflow: hidden;
    position: relative;
    outline: none;

    >.horizontal,
    .vertical {
        >.listitem {
            position: absolute;
            flex: 1;
        }

        >.port {
            position: absolute;
            right: 0;
            background-color: rgba($color: #8B7355, $alpha: 0.15);
            height: 2px;
        }

        >.port::before {
            content: "";
            width: 10px;
            height: 10px;
            border: 2px solid rgba($color: #8B7355, $alpha: 0.15);
            border-radius: 50%;
            position: absolute;
            left: -12px;
            top: -6px;
        }

        >.substitute {
            position: absolute;
            height: 32px;
            min-width: 40px;
            color: rgba($color: #000000, $alpha: 0.25);
            font-size: 10px;
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

    .vertical+.scroll-track {
        width: 6px;
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        overflow: hidden;

        >.scroll-bar {
            width: 100%;
            position: relative;
            background-color: #dddddd;
            border-radius: 6px;
        }

        >.scroll-bar:hover {
            background-color: #bbbbbb;
        }
    }
}
</style>