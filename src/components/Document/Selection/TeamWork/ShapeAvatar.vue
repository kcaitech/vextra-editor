<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Matrix, Shape, ShapeType, ShapeView } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection"
import { XYsBounding } from "@/utils/common";
// import { DocSelectionData } from "@/communication/modules/doc_selection_op";
import { TeamWork } from "@/context/teamwork";
import { Selection } from '@/context/selection';
import { throttle } from 'lodash';
const props = defineProps<{
    context: Context
    matrix: Matrix
}>()
interface Avatar {
    x: number
    y: number
    rotate: number
    shape: ShapeView
    avatar: string | undefined
    // userSelectInfo: DocSelectionData
}
interface MultipShape {
    x: number
    y: number
    shapes: ShapeView[]
    avatar: string | undefined
    // userSelectInfo: DocSelectionData
    shapesIds: string
}

const matrix = new Matrix();
const origin: ClientXY = { x: 0, y: 0 };
const avatars = ref<Avatar[]>([]);
const multipShape = ref<MultipShape[]>([]);
const shapes = ref<ShapeView[]>([]);
// const userSelectionInfo = ref<DocSelectionData[]>(props.context.teamwork.getUserSelection);
const groupedShapes = ref();
const multipShapeGroup = ref<any>({});
const setOrigin = () => {
    matrix.reset(props.matrix);
    origin.x = matrix.m02;
    origin.y = matrix.m12;
}
const setPosition = () => {
    // avatars.value.length = 0;
    // multipShape.value.length = 0;
    // groupedShapes.value = [];
    // multipShapeGroup.value = [];
    // const page = props.context.selection.selectedPage;
    // if (!page) return;
    // for (let i = 0; i < userSelectionInfo.value.length; i++) {
    //     const userSelectInfo = userSelectionInfo.value[i];
    //     const selection: ShapeView[] = props.context.selection.selectedShapes;
    //     if (page.id !== userSelectInfo.select_page_id) continue;
    //     const shapes: ShapeView[] = [];
    //     const len = userSelectInfo.select_shape_id_list.length;
    //     for (let i = 0; i < len; i++) {
    //         const shape = page.shapes.get(userSelectInfo.select_shape_id_list[i]);
    //         if (shape) shapes.push(shape);
    //     }
    //     if (shapes.length === 1) {
    //         if (selection.length > 0 && selection[0].id === shapes[0].id && props.context.workspace.isTranslating) continue
    //         const s = selection.find(v => v.id === shapes[0].id);
    //         if (s && props.context.workspace.isTranslating) continue;
    //         const shape = (shapes[0] as ShapeView)
    //         const m = shape.matrix2Root()
    //         const frame = shape.frame;
    //         const matrix = props.context.workspace.matrix
    //         let anchor = { x: frame.width, y: 0 }
    //         let rotate = shape.rotation || 0;
    //         rotate = rotate < 0 ? rotate + 360 : rotate;
    //         if (rotate < 135 && rotate >= 45) {
    //             anchor = m.computeCoord({ x: 0, y: 0 });
    //             rotate -= 90;
    //         } else if (rotate < 225 && rotate >= 135) {
    //             anchor = m.computeCoord({ x: 0, y: 0 + frame.height });
    //             rotate -= 180;
    //         } else if (rotate < 315 && rotate >= 225) {
    //             anchor = m.computeCoord({ x: 0 + frame.width, y: 0 + frame.height });
    //             rotate += 90;
    //         } else if (rotate < 360 && rotate > 315) {
    //             anchor = m.computeCoord({ x: frame.width, y: 0 });
    //         } else if (rotate < 45 && rotate >= 0) {
    //             anchor = m.computeCoord({ x: frame.width, y: 0 });
    //         }
    //         anchor = matrix.computeCoord({ x: anchor.x, y: anchor.y });
    //         anchor.y -= origin.y;
    //         anchor.x -= origin.x;
    //         anchor.y -= 24
    //         const avatar = userSelectInfo.avatar
    //         avatars.value.push({ x: anchor.x, y: anchor.y, avatar, shape: shape, rotate, userSelectInfo })
    //     } else if (shapes.length > 1) {
    //         if (arraysOfObjectsWithIdAreEqual(shapes, selection) && props.context.workspace.isTranslating) continue;
    //         const points: { x: number, y: number }[] = [];
    //         for (let index = 0; index < shapes.length; index++) {
    //             const s = shapes[index];
    //             const m = s.matrix2Root()
    //             m.multiAtLeft(matrix)
    //             const f = s.frame
    //             const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
    //             points.push(...ps);
    //         }
    //         const b = XYsBounding(points);
    //         const avatar = userSelectInfo.avatar
    //         let anchor = { x: b.right, y: b.top }
    //         anchor.y -= 24
    //         const shapesIds = shapes.map(shape => shape.id).sort().join(',');
    //         multipShape.value.push({ x: anchor.x, y: anchor.y, avatar, shapes: shapes, userSelectInfo, shapesIds })
    //     }
    // }
    // avatars.value.forEach((item, i) => {
    //     if (!groupedShapes.value[item.shape.id]) {
    //         groupedShapes.value[item.shape.id] = [];
    //     }
    //     groupedShapes.value[item.shape.id].push(item);
    // });

    // multipShape.value.forEach(item => {
    //     const shapesIds = item.shapes.map(shape => shape.id).sort().join(',');
    //     if (!multipShapeGroup.value[shapesIds]) {
    //         multipShapeGroup.value[shapesIds] = [];
    //     }
    //     multipShapeGroup.value[shapesIds].push(item);
    // });
}
function arraysOfObjectsWithIdAreEqual(arr1: any, arr2: any) {
    const idsSet1 = new Set(arr1.map((obj: any) => obj.id));
    const idsSet2 = new Set(arr2.map((obj: any) => obj.id));

    for (const id of idsSet1) {
        if (!idsSet2.has(id)) {
            return false;
        }
    }
    return true;
}

const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        setOrigin();
        setPosition();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        setOrigin();
        setPosition();
    }
}
const updater = (t?: number) => {
    // if (t === TeamWork.CHANGE_USER_STATE) {        
    //     userSelectionInfo.value = props.context.teamwork.getUserSelection;
    //     const page = props.context.selection.selectedPage;
    //     props.context.teamwork.getUserSelection.forEach(item  => {
    //         for (let i = 0; i < item.select_shape_id_list.length; i++) {
    //             const shape = page!.shapes.get(item.select_shape_id_list[i]);
    //             if (shape) shapes.value.push(shape);
    //         }
    //     })
    //     shapes.value = Array.from(new Set(shapes.value));
    //     setOrigin();
    //     setPosition();
    //     watchShapes();
    // }
}

const selectionWatcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        setOrigin();
        setPosition();
    }
}
const set_position = throttle(() => {
    setOrigin();
    setPosition();
}, 20)
const watcher = () => {
    set_position()
}
const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    if (shapes.value) {
        shapes.value.forEach((v) => {
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
    watchShapes();
    setOrigin();
    setPosition();
    props.context.workspace.watch(workspaceUpdate);
    props.context.teamwork.watch(updater);
    props.context.selection.watch(selectionWatcher);
})

onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.teamwork.watch(updater);
    props.context.selection.unwatch(selectionWatcher);
})
</script>

<template>
    <div class="container" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div class="avatar_content" v-for="(a, index) in avatars" :key="index"
            :style="{ top: `${a.y}px`, left: `${a.x - (Math.min(groupedShapes[a.shape.id].length, 4) * 20)}px`, transform: `rotate(${a.rotate}deg)` }">
            <template v-for="(u, i) in groupedShapes[a.shape.id]" :key="i">
                <div class="avatars" v-if="i < 3"><img :src="u.avatar" alt=""></div>
            </template>
            <div class="avatars bgc" v-if="groupedShapes[a.shape.id].length > 3">{{ groupedShapes[a.shape.id].length }}
            </div>
        </div>
    </div>
    <div class="container" v-if="multipShape">
        <div class="avatar_content" v-for="(m, index) in multipShape" :key="index"
            :style="{ top: `${m.y}px`, left: `${m.x - (Math.min(multipShapeGroup[m.shapesIds].length, 4) * 20)}px` }">
            <template v-for="(u, i) in multipShapeGroup[m.shapesIds]" :key="i">
                <div class="avatars" v-if="i < 3"><img :src="u.avatar" alt=""></div>
            </template>
            <div class="avatars bgc" v-if="multipShapeGroup[m.shapesIds].length > 3">{{ multipShapeGroup[m.shapesIds].length
            }}</div>
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
            background-color: var(--active-color);
            box-sizing: border-box;

            >img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                pointer-events: none;
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