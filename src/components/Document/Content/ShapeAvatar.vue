<script lang="ts" setup>
import { watchEffect, onMounted, onUnmounted, reactive, ref, nextTick } from "vue";
import { Context } from "@/context";
import { Matrix, Page, Shape, ShapeType } from "@kcdesign/data";
import { Selection, UserSelection } from '@/context/selection'
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
    avatar: string | undefined
    userSelectInfo: UserSelection
}

const matrix = new Matrix(props.matrix);
const origin: ClientXY = { x: 0, y: 0 };
const avatars = ref<Avatar[]>([])
const userSelectionInfo = ref<UserSelection[]>(props.context.selection.getUserSelection)
const groupedShapes = ref()
const setOrigin = () => {
    matrix.reset(props.context.workspace.matrix)
    matrix.preTrans(props.data.frame.x, props.data.frame.y)
    origin.x = matrix.m02
    origin.y = matrix.m12
}

const setPosition = () => {
    // const userSelectShape = props.context.selection.getUserSelection
    const startTime = performance.now();
    avatars.value.length = 0
    groupedShapes.value = []
    for (let i = 0; i < userSelectionInfo.value.length; i++) {
        const userSelectInfo = userSelectionInfo.value[i]
        const shapes = userSelectInfo.selectShapes
        const len = userSelectInfo.selectShapes.length
        if(len) {
            for (let i = 0; i < len; i++) {
                const shape = (shapes[i] as Shape)
                if (shape.parent?.type === ShapeType.Page && shape.isVisible) {
                    const m = shape.matrix2Root()
                    const frame = shape.frame;
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
                    anchor.y -= 24
                    const avatar = userSelectInfo.avatar
                    avatars.value.push({x: anchor.x, y: anchor.y, avatar, shape: shape, rotate, userSelectInfo})
                }
            }
        }else {
            avatars.value.length = 0
        }
    }
    avatars.value.forEach((item, i) => {
        if (!groupedShapes.value[item.shape.id]) {
            groupedShapes.value[item.shape.id] = [];
        }
        groupedShapes.value[item.shape.id].push(item);
    });
    const endTime = performance.now();
}

const workspaceUpdate = (t: number) => {
    if(t === WorkSpace.MATRIX_TRANSFORMATION) {
        setOrigin()
        setPosition()
    }
}
const updater = (t?: number) => {
    setOrigin()
    setPosition()
    watchShapes()
    if(t === Selection.CHANGE_USER_STATE) {
        userSelectionInfo.value = props.context.selection.getUserSelection
    }
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
         :style="{top: `${a.y}px`, left: `${a.x - (Math.min(groupedShapes[a.shape.id].length, 4) * 20)}px`, transform: `rotate(${a.rotate}deg)`}">
            <template v-for="(u, i) in groupedShapes[a.shape.id]" :key="i">
                <div class="avatars" v-if="i < 3"><img :src="u.avatar" alt=""></div>
            </template>
            <div class="avatars bgc" v-if="groupedShapes[a.shape.id].length > 3">{{ groupedShapes[a.shape.id].length }}</div>
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
            >img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
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