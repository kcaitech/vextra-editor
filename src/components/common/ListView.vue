<script setup lang="ts">
import { onMounted, defineProps, reactive, ComponentInternalInstance, getCurrentInstance, ref } from "vue";

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
    source: IDataSource<any>,
    itemView: any,
    itemWidth: number,
    itemHeight: number,
    firstIndex: number,
    orientation: "horizontal" | "vertical"
}>();

const scroll = reactive({ x: 0, y: 0 });
let layoutIndex = 0;
const layoutResult = reactive(new Array<{ x: number, y: number, id: string, data: any }>());
let visibleWidth = 0;
let visibleHeight = 0;
const measureWidth = ref(0);
const measureHeight = ref(0);

const relayout: { [key: string]: Function } = {};
relayout[Orientation.V] = () => {
    console.log("re - v")
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
}
relayout[Orientation.H] = () => {
    console.log("re - h")
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

const prepareCount = 10; //  多准备的

const layoutUp: { [key: string]: Function } = {};
layoutUp[Orientation.V] = () => {
    console.log("up - v")
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
    console.log("up - h")
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
    console.log("down - v")
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
}
layoutDown[Orientation.H] = () => {
    console.log("down - h")
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

onMounted(() => {
    observer.observe(proxy?.$el);
    if (props.orientation == Orientation.V) {
        measureHeight.value = props.source.length() * props.itemHeight;
        measureWidth.value = props.itemWidth;
    }
    else {
        measureHeight.value = props.itemHeight;
        measureWidth.value = props.source.length() * props.itemWidth;
    }
    console.log("mount measure", measureWidth.value, measureHeight.value)
    relayout[props.orientation]();
})

// todo
// 滚动
// 滚动条
// 局部更新
// 滚动到可见
// 点击
// hover
// 单选、多选

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
    console.log("change measure", measureWidth.value, measureHeight.value)

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
            // 需要调整每个item的位置，这里简单直接重排
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
}

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

// function onItemClick(data: any) {
//     props.source.onClick(data, false, false);
// }

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const observer = new ResizeObserver((entries, ob) => {
    const el = proxy?.$refs.container as HTMLElement;
    if (el) {
        visibleHeight = el.clientHeight;
        visibleWidth = el.clientWidth;
        console.log("visible", visibleWidth, visibleHeight)
        layoutDown[props.orientation]();
    }
})

</script>

<template>
    <div class="container" @wheel.prevent="onMouseWheel" ref="container">
        <div :class="props.orientation"
            :style="{ transform: 'translate(' + scroll.x + 'px ,' + scroll.y + 'px)', width: measureWidth + 'px', height: measureHeight + 'px' }"
            ref="contents">
            <component class="listitem" :is="props.itemView" v-for="c in layoutResult" :key="c.id" :data="c.data"
                v-bind="$attrs" :style="{left: c.x + 'px', top: c.y + 'px'}" />
        </div>
    </div>
</template>

<style scoped>
div .container {
    overflow: hidden;
}

div .horizontal {
    display: flex;
    flex-flow: row nowrap;
    width: auto;
    height: 100%;
}

div .vertical {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    height: auto;
}

.listitem {
    position: absolute;
}
</style>