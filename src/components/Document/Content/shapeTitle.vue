<script lang="ts" setup>
import { defineProps, watchEffect, onMounted, onUnmounted, ref, nextTick, computed, reactive } from "vue";
import { Context } from "@/context";
import { Matrix, Page, Shape, ShapeType } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection";

const props = defineProps<{
    context: Context
    data: Page,
    matrix: number[]
}>()
interface Title {
    id: string
    content: string
    x: number
    y: number
    width: number
    shape: Shape
    rotate: number
}
const matrix = new Matrix(props.matrix);
const index = ref(-1)
const isInput = ref(false)
const inputWidth = ref(0)
const selectTitle = ref(false)
const esc = ref<boolean>(false)
const titles: Title[] = reactive([]);
const origin: ClientXY = { x: 0, y: 0 };
const watcher = () => {
    updater();
}

function updater() {
    watchShapes();
    setOrigin();
    setPosition();

}
function handleWorkspaceUpdate(t: any) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        setOrigin();
        setPosition();
    }
}
const setPosition = () => { // 核心函数
    const artboards: Shape[] = props.context.selection.selectedPage!.artboardList; // 只要遍历容器就可以了，直接拿这个，这个数组里面有全部容器，如果拿childs，会存在多余的遍历
    const len = artboards.length;
    if (len) {
        titles.length = 0;
        for (let i = 0; i < len; i++) {
            const artboard = artboards[i];
            if (artboard.parent?.type === ShapeType.Page) { // 只给页面的直接子元素上标题
                const m = artboard.matrix2Page(); // 图形到页面的转换矩阵
                const f2p = artboard.frame2Page(); // 
                const frame = artboard.frame;
                const matrix = props.context.workspace.matrix; // 页面坐标系转换矩阵
                let anchor = { x: 0, y: 0 }; // 锚点，其所在坐标系是page坐标系
                let rotate = artboard.rotation || 0;
                rotate = rotate < 0 ? rotate + 360 : rotate; // 这些关于角度的计算把图画出来就会比较清楚
                if (rotate < 135 && rotate >= 45) {
                    anchor = m.computeCoord({ x: 0, y: 0 + frame.height }); // 将 [图形坐标系] 的锚点通过 [图形到页面的转换矩阵] 转换到 [页面坐标系]，下面的也是
                    rotate -= 90;
                } else if (rotate < 225 && rotate >= 135) {
                    anchor = m.computeCoord({ x: 0 + frame.width, y: 0 + frame.height });
                    rotate -= 180;
                } else if (rotate < 315 && rotate >= 225) {
                    anchor = m.computeCoord({ x: 0 + frame.width, y: 0 });
                    rotate += 90;
                } else if (rotate < 360 && rotate > 315) {
                    anchor = m.computeCoord({ x: 0, y: 0 });
                } else if (rotate < 45 && rotate >= 0) {
                    anchor = m.computeCoord({ x: 0, y: 0 });
                }
                anchor = matrix.computeCoord({ x: anchor.x, y: anchor.y }); //将锚点从 [页面坐标系] 转换到 [窗口坐标系]
                anchor.y -= origin.y;
                anchor.x -= origin.x;
                anchor.y -= 14; // 顶上去14像素
                const width = f2p.width;
                titles.push({ id: artboard.id, content: artboard.name, x: anchor.x, y: anchor.y, width, shape: artboard, rotate });
            }
        }
    }
}
function setOrigin() { // 这个动作是让container与页面坐标系重合
    matrix.reset(props.context.workspace.workspace.matrix);
    matrix.preTrans(props.data.frame.x, props.data.frame.y);
    origin.x = matrix.m02;
    origin.y = matrix.m12;
}

const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedPage?.childs;
    if (selection) {
        selection.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}
const onRename = (e: Event, shape: Shape, i: number) => {
    index.value = i
    isInput.value = true
    nextTick(() => {
        const select = document.querySelector(`[data-index="${i}"]`);
        const dataSpan = document.querySelector(`[data-span="${i}"]`);
        if (select) {
            const curInput = (select as HTMLInputElement)
            curInput.value = shape.name;
            if (dataSpan) {
                dataSpan.innerHTML = shape.name
                inputWidth.value = (dataSpan as HTMLSpanElement).offsetWidth + 2
            }
            curInput.focus();
            curInput.select();
            curInput.addEventListener('blur', stopInput);
            curInput.addEventListener('keydown', keySaveInput);
        }
    })
}
const onChangeName = (e: Event, i: number) => {
    const value = (e.target as HTMLInputElement).value
    const dataSpan = document.querySelector(`[data-span="${i}"]`);
    if (dataSpan) {
        dataSpan.innerHTML = value
        inputWidth.value = (dataSpan as HTMLSpanElement).offsetWidth + 2
    }
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
}
const reName = (e: Event, shape: Shape) => {
    const value = (e.target as HTMLInputElement).value
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
    const editor = computed(() => {
        return props.context.editor4Shape(shape);
    });
    editor.value.setName(value)
    props.context.selection.rename();
}
const stopInput = () => {
    esc.value = false
    isInput.value = false
    index.value = -1
}

const keySaveInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        esc.value = false
        isInput.value = false
        index.value = -1
    } else if (e.code === 'Escape') {
        esc.value = true
        isInput.value = false
        index.value = -1
    }
}
// hover不上原因是参数shape的内存地址不对，想不到比较好的方案就先放着，包括选中和拖动也是。先把重命名做好～
function hover(shape: Shape) {
    // props.context.selection.hoverShape(shape);
}
function leave() {
    props.context.selection.unHoverShape();
}
onMounted(() => {
    props.context.workspace.watch(handleWorkspaceUpdate)
    props.context.selection.watch(updater);
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(handleWorkspaceUpdate);
    props.data.unwatch(watcher);
    props.context.selection.unwatch(updater);
})
watchEffect(() => updater());
</script>
<template>
    <!-- container -->
    <div class="container" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <!-- 这一块，建议参考Listview组件，类比一下，按照这个形式(ShapeTitle -> ShapeList、title -> Shapetitle)，这样就可以按照shapelist 的重命名方式来重命名title -->
        <div v-for="(t, index) in titles" class="title-container" :key="index" @mouseenter="() => hover(t.shape)"
            @mouseleave="leave"
            :style="{ top: `${t.y}px`, left: `${t.x}px`, 'max-width': `${50}px`, transform: `rotate(${t.rotate}deg)` }">
            {{ t.content }}
        </div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    position: absolute;
    overflow: visible;

    .title-container {
        display: flex;
        align-items: flex-end;
        min-width: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: absolute;
        font-size: var(--font-default-fontsize);
        height: 14px;
        transform-origin: bottom left;
        color: grey;
    }

    .title-container:hover {
        color: var(--active-color);
    }
}
</style>