<script setup lang="ts">
import { onMounted, defineProps, defineExpose, reactive, ref, watch, computed } from "vue";
import { Context } from "@/context";

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
    allowDrag?: boolean
}>();

const contents = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
const scrollTrack = ref<HTMLDivElement>();
const bar = ref<HTMLDivElement>();

const scroll = reactive({ x: 0, y: 0 }); // position of list[0]
const scrollBar = reactive({ length: 0, mount: false, listMouseOver: false, x: 0, y: 0 }); // 滚动条滑块对象
let layoutIndex = 0; // 当前Dom渲染列表中第一个Dom在整个list对应的Dom列表中的index
const layoutResult = reactive(new Array<{ x: number, y: number, id: string, data: any }>()); // list
let visibleWidth = 0;
let visibleHeight = 0;
const measureWidth = ref(0); // width of listView
const measureHeight = ref(0); // height of listView
const prepareCount = 10; //  多准备的

defineExpose({
    container
})

const relayout: { [key: string]: Function } = {};
relayout[Orientation.V] = () => {    
    // console.log("re - v")
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
    // console.log("re - h")
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
}

const layoutUp: { [key: string]: Function } = {};
layoutUp[Orientation.V] = () => {
    // console.log("up - v")
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
    // console.log("up - h")
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
    if (layoutIndex + layoutResult.length >= props.source.length()) {
        return;
    }
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
    scrollBar.length = Math.ceil((visibleHeight * visibleHeight) / measureHeight.value);
    scrollBar.length && scrollBar.length !== visibleHeight && (scrollBar.mount = true);
}
layoutDown[Orientation.H] = () => {
    // console.log("down - h")
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
    scrollBar.y = Math.ceil((transy * visibleHeight) / measureHeight.value);
}

// 鼠标事件
function onMouseWheel(e: WheelEvent) {   
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    const transx = scroll.x - deltaX;
    const transy = scroll.y - deltaY;

    clampScroll(transx, transy);

    const delta = props.orientation == Orientation.V ? deltaY : deltaX;    
    if (delta < 0) {
        layoutUp[props.orientation]();
    }
    else {
        layoutDown[props.orientation]();
    }
}
function mouseenter(e: MouseEvent) {
    scrollBar.listMouseOver = true;
    container.value?.focus();
}
function mouseleave(e: MouseEvent) {
    scrollBar.listMouseOver = false;
}
function onScrollTrackClick(e: MouseEvent) {
    const pageHeight = visibleHeight;
    if (e.target !== scrollTrack.value) return;
    const targetOffsetY = e.offsetY;
    const down = targetOffsetY >= -scrollBar.y;
    if (down) {
        clampScroll(0, scroll.y - pageHeight);
        layoutDown[props.orientation]();
    } else {
        clampScroll(0, scroll.y + pageHeight);
        layoutUp[props.orientation]();
    }
}
function onScrollBarClick(e: MouseEvent) {}

// #region 列表子元素换位处理
let currentHoverTarget = ref<HTMLDivElement | EventTarget | null>();
let mousedown = ref<boolean>(false);
let fromIndex = ref<number>(0);
let toIndex = ref<number>(0);
let offsetOverhalf: boolean = false; // 过半，在hover节点下面插入被拖动节点，反则上面
let draging = ref<boolean>(false);
let destination = ref<{ x: number, y: number, length: number }>({ x: 0, y: 0, length: 20 });
let destinationMount = ref<boolean>(false);

const destinationVisible = computed(() => {
    return draging.value && destinationMount.value && ( fromIndex.value !== toIndex.value )
})
function mouseDownOnItem(index: number) {
    if (!props.allowDrag) return;
    // record fromIndex && pre to take off
    fromIndex.value = index;
    toIndex.value = index;
    mousedown.value = true;
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
}
function mouseMove(Event: MouseEvent) {
    draging.value = true
    if ((currentHoverTarget.value as any)?.getBoundingClientRect) {
        const { x, top, width, left } = (currentHoverTarget.value as any)?.getBoundingClientRect();
        destination.value.length = width;
        const { clientX, clientY } = Event;
        const offset: number = clientY - top;
        if (offset >= 0 && offset <= 15) {
            offsetOverhalf = false
        } else if (offset > 15 && offset <= 30) {
            offsetOverhalf = true
        }
    }
    destination.value.y = offsetOverhalf ? (toIndex.value + 1) * props.itemHeight - 2 :  toIndex.value * props.itemHeight - 2;
}

function itemOnHover(e: MouseEvent, index: number) {
    // update currenthovertarget toIndex
    if (!props.allowDrag || !mousedown.value) return;
    destinationMount.value = true
    currentHoverTarget.value = e.target;
    toIndex.value = index
}

function descend(from: number, to: number) {
    if (from < to) {
        layoutResult.splice(to, 0, layoutResult[from]);
        layoutResult.splice(from, 1);
        resort(layoutResult, props.orientation)
    } else if (from > to) {
        let temp = layoutResult[from];
        layoutResult.splice(from, 1);
        layoutResult.splice(to, 0, temp);
        resort(layoutResult, props.orientation)
    }
    function resort(arr: { x: number, y: number, id: string, data: any }[], orientation: "horizontal" | "vertical") {
        if (orientation === Orientation.V) {
            arr.forEach((item, index) => {
                item.y = index * props.itemHeight
            })
        } else if (orientation === Orientation.H) {
            arr.forEach((item, index) => {
                item.x = index * props.itemWidth
            })
        }
    }
}
function mouseUp() {
    if (!props.allowDrag) return;
    // close events && check descend port && descend
    mousedown.value = false;
    destinationMount.value = false;
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
    if (draging.value) {
        toIndex.value = offsetOverhalf ? toIndex.value + 1 : toIndex.value
        descend(fromIndex.value, toIndex.value);
        draging.value = false
    }
}
// #endregion

const observer = new ResizeObserver(() => {
    const el = container.value;
    if (el) {
        visibleHeight = el.clientHeight;
        visibleWidth = el.clientWidth;
        layoutDown[props.orientation]();
    }
})

// hooks
onMounted(() => {
    container.value && observer.observe(container.value);
    viewMeasure[props.orientation]();
    relayout[props.orientation]();
})
</script>

<template>
    <div
        class="container"
        @wheel.prevent="onMouseWheel"
        @mouseenter="mouseenter"
        @mouseleave="mouseleave"
        ref="container"
        tabindex="-1"
    >
        <!-- items container -->
        <div
            :class="orientation"
            :style="{
                transform: 'translate(' + scroll.x + 'px ,' + scroll.y + 'px)',
                width: orientation === 'horizontal' ? measureWidth + 'px' : 'auto',
                height: orientation === 'vertical' ? measureHeight + 'px' : 'auto'
            }"
            ref="contents"
        >
            <component
                class="listitem"
                :is="props.itemView"
                v-for="(c, i) in layoutResult"
                :key="c.id"
                :data="c.data"
                v-bind="$attrs"
                @mousedown.stop="() => mouseDownOnItem(i)"
                @mouseover="(e: MouseEvent) => itemOnHover(e, i)"
                :style="{left: c.x + 'px', top: c.y + 'px'}"
            />
            <div class="port" v-if="destinationVisible" :style="{ top: destination.y + 'px' }"></div>
        </div>
        <!-- scroll -->
        <div
            ref="scrollTrack"
            class="scroll-track"
            @click="onScrollTrackClick"
            :style="{ opacity: scrollBar.mount && scrollBar.listMouseOver ? 1 : 0}"
        >
            <div
                ref="bar"
                @mousedown="onScrollBarClick"
                class="scroll-bar"
                :style="{
                    top: -scrollBar.y + 'px',
                    height: scrollBar.length + 'px'
                }"
            ></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    overflow: hidden;
    position: relative;
    outline: none;
    > .horizontal, .vertical {
        > .listitem {
            position: absolute;
            flex: 1;
        }
        > .port {
            position: absolute;
            background-color: aqua;
            width: 100%;
            height: 4px;
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
        transition: 0.35s;
        > .scroll-bar {
            width: 100%;
            position: relative;
            background-color: #dddddd;
            border-radius: 8px;
            transition: 0.35s;
        }
        > .scroll-bar:hover {
            background-color: #bbbbbb;
        }
    }
    .vertical + .scroll-track:hover {
        width: 16px;
        cursor: pointer;
        > .scroll-bar {
            min-height: 28px;
        }
    }
}

</style>