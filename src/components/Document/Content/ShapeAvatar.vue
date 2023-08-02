<script lang="ts" setup>
import { watchEffect, onMounted, onUnmounted, reactive, ref, nextTick } from "vue";
import { Context } from "@/context";
import { Matrix, Page, Shape, ShapeType } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection"

const props = defineProps<{
    context: Context
    data: Page,
    matrix: number[]
}>()
interface Avatar {
    x: number
    y: number
    rotate: number
    shape: Shape
    img: string
    width: number
}

const matrix = new Matrix(props.matrix);
const origin: ClientXY = { x: 0, y: 0 };
const avatars:Avatar[] = reactive([])

const setOrigin = () => {
    matrix.reset(props.context.workspace.matrix)
    matrix.preTrans(props.data.frame.x, props.data.frame.y)
    origin.x = matrix.m02
    origin.y = matrix.m12
}

const setPosition = () => {
    const shapes: Shape[] = props.context.selection.selectedPage!.childs
    const len = shapes.length
    if(len) {
        avatars.length = 0
        for (let i = 0; i < len; i++) {
            const shape = shapes[i]
            if (shape.parent?.type === ShapeType.Page && shape.isVisible) {
                const m = shape.matrix2Root()
                const frame = shape.frame;
                const f2p = shape.frame2Root();
                const matrix = props.context.workspace.matrix
                let anchor = {x: frame.width, y: 0}
                let rotate = shape.rotation || 0;
                rotate = rotate < 0 ? rotate + 360 : rotate;
                if (rotate < 135 && rotate >= 45) {
                    anchor = m.computeCoord({ x: 0, y: 0 });
                    rotate -= 90;
                } else if (rotate < 225 && rotate >= 135) {
                    anchor = m.computeCoord({ x: 0, y: 0 + frame.height });
                    rotate -= 180;
                } else if (rotate < 315 && rotate >= 225) {
                    anchor = m.computeCoord({ x: 0 + frame.width, y: 0 + frame.height });
                    rotate += 90;
                } else if (rotate < 360 && rotate > 315) {
                    anchor = m.computeCoord({ x: frame.width, y: 0 });
                } else if (rotate < 45 && rotate >= 0) {
                    anchor = m.computeCoord({ x: frame.width, y: 0 });
                }
                anchor = matrix.computeCoord({ x: anchor.x, y: anchor.y });
                anchor.y -= origin.y;
                anchor.x -= origin.x;
                const width = f2p.width;
                anchor.y -= 24
                let u = 4
                anchor.x = anchor.x -(u * 20)
                avatars.push({x: anchor.x, y: anchor.y, img: '', shape: shape, rotate, width})
            }
        }
    }else {
        avatars.length = 0
    }
}

const workspaceUpdate = (t: number) => {
    if(t === WorkSpace.MATRIX_TRANSFORMATION) {
        setOrigin()
        setPosition()
    }
}
const updater = () => {
    setOrigin()
    setPosition()
    watchShapes()
}

const watcher = () => {
    updater()
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

onMounted(() => {
    props.context.workspace.watch(workspaceUpdate)
    props.context.selection.watch(updater)
    props.data.watch(watcher)
})

onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate)
    props.context.selection.unwatch(updater)
    props.data.watch(watcher)
})
watchEffect(() => updater())

</script>

<template>
    <div class="container" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div class="avatar_content" v-for="(a, index) in avatars" :key="index"
         :style="{top: `${a.y}px`, left: `${a.x}px`, transform: `rotate(${a.rotate}deg)`}">
            <div class="avatars">1</div>
            <div class="avatars">1</div>
            <div class="avatars">1</div>
            <div class="avatars bgc">4</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    position: absolute;
    overflow: visible;
    .avatar_content {
        display: flex;
        position: absolute;
        font-size: var(--font-default-fontsize);
        height: 21px;
        z-index: 1;
        transform-origin: bottom right;
        .avatars {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: var(--active-color-beta);
            box-sizing: border-box;
        }
        .bgc {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #000;
            background-color: #fff;
            box-sizing: border-box;
        }
    }
}
</style>