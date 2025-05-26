/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { onMounted, onUnmounted, ref } from 'vue';
import { ClientXY, Selection } from "@/context/selection";
import { Matrix, Shape, ShapeView } from '@kcdesign/data';
import { WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { Tool } from '@/context/tool';
interface Point {
    x: number
    y: number
}
interface Props {
    context: Context,
    controllerFrame: Point[],
}
const props = defineProps<Props>();

const shapeSize = ref({ w: 0, h: 0 });
const origin: ClientXY = { x: 0, y: 0 };
const trans = ref({ x: 0, y: 0 });
const rotate = ref(0);
const isSizeBox = ref(false);
const getShapePositionSize = () => {
    if (!props.context.tool.isLabel) {
        return;
    }
    const shapes = props.context.selection.selectedShapes;
    const matrix = props.context.workspace.matrix;
    trans.value.x = 0;
    trans.value.y = 0;
    if (shapes.length === 1) {
        const b = shapes[0].frame;
        let framePoint = [{ x: 0, y: 0 }, { x: b.width, y: 0 }, { x: b.width, y: b.height }, { x: 0, y: b.height }];
        const m = shapes[0].matrix2Root();
        shapeSize.value.w = framePoint[2].x;
        shapeSize.value.h = framePoint[2].y;
        m.multiAtLeft(matrix);
        framePoint = framePoint.map(p => m.computeCoord(p.x, p.y));
        let anchor = modify_anchor(shapes[0], m.toMatrix());
        origin.x = anchor.x;
        origin.y = anchor.y + 6;
        trans.value.x = 0;
        trans.value.y = 0;
        rotate.value = modify_rotate(shapes[0]);

    } else if (shapes.length > 1) {
        const points: { x: number, y: number }[] = [];
        for (let index = 0; index < shapes.length; index++) {
            const s = shapes[index];
            const m = s.matrix2Root();
            m.multiAtLeft(matrix);
            const f = s.frame;
            const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
            points.push(...ps);
        }
        const b = XYsBounding(points);
        const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
        const lt = matrix.inverseCoord(b.left, b.top);
        const rb = matrix.inverseCoord(b.right, b.bottom);
        shapeSize.value.w = Math.abs(rb.x - lt.x);
        shapeSize.value.h = Math.abs(rb.y - lt.y);
        origin.x = framePoint[0].x;
        origin.y = framePoint[0].y;
        trans.value.x = ((b.right - b.left) / 2);
        trans.value.y = (b.bottom - b.top) + 5;

    }
}
function pre_modify_anchor(shape: ShapeView) {
    let rotate = shape.rotation || 0;
    // if (shape.isFlippedHorizontal) rotate = rotate + 270;
    // if (shape.isFlippedVertical) {
    //     rotate = shape.isFlippedHorizontal ? rotate -= 90 : rotate += 90;
    // }
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    return rotate;
}

function modify_rotate(shape: ShapeView) {
    let rotate = shape.rotation || 0;
    // if (shape.isFlippedHorizontal) rotate = 180 - rotate;
    // if (shape.isFlippedVertical) rotate = 360 - rotate;
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    if (rotate >= 0 && rotate < 45) {
    } else if (rotate >= 45 && rotate < 135) {
        rotate -= 90;
    } else if (rotate >= 135 && rotate < 225) {
        rotate -= 180;
    } else if (rotate >= 225 && rotate < 315) {
        rotate += 90;
    } else if (rotate > 315 && rotate <= 360) {
    }
    return rotate;
}

function modify_anchor(shape: ShapeView, m2r: Matrix) {
    const rotate = pre_modify_anchor(shape);
    const frame = shape.frame;
    let anchor = { x: 0, y: 0 };
    if (rotate >= 0 && rotate < 45) {
        anchor = m2r.computeCoord2(frame.width / 2, frame.height);
        // if (shape.isFlippedHorizontal && !shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width, frame.height / 2);
        // } else if (!shape.isFlippedHorizontal && shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width, frame.height / 2);
        // }
    } else if (rotate >= 45 && rotate < 135) {
        anchor = m2r.computeCoord2(frame.width, frame.height / 2);
        // if (shape.isFlippedHorizontal && !shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width / 2, 0);
        // } else if (!shape.isFlippedHorizontal && shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width / 2, 0);
        // }
    } else if (rotate >= 135 && rotate < 225) {
        anchor = m2r.computeCoord2(frame.width / 2, 0);
        // if (shape.isFlippedHorizontal && !shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(0, frame.height / 2);
        // } else if (!shape.isFlippedHorizontal && shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(0, frame.height / 2);
        // }
    } else if (rotate >= 225 && rotate < 315) {
        anchor = m2r.computeCoord2(0, frame.height / 2);
        // if (shape.isFlippedHorizontal && !shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width / 2, frame.height);
        // } else if (!shape.isFlippedHorizontal && shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width / 2, frame.height);
        // }
    } else if (rotate >= 315 && rotate <= 360) {
        anchor = m2r.computeCoord2(frame.width / 2, frame.height);
        // if (shape.isFlippedHorizontal && !shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width, frame.height / 2);
        // } else if (!shape.isFlippedHorizontal && shape.isFlippedVertical) {
        //     anchor = m2r.computeCoord2(frame.width, frame.height / 2);
        // }
    }
    return anchor;
}

function selectionWatcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        watchShapes();
        getShapePositionSize();
        size_box_show();
    } else if (t === Selection.CHANGE_PAGE) {
        size_box_show();
    }
}
const workspaceUpdate = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getShapePositionSize();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        getShapePositionSize();
    } else if (t === WorkSpace.TRANSLATING) {
        size_box_show();
    }
}
const tool_watcher = (t: number) => {
    if (t === Tool.LABEL_CHANGE) {
        size_box_show();
        getShapePositionSize();
    }
}
const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const shapes = props.context.selection.selectedShapes;
    if (shapes) {
        shapes.forEach((v) => {
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
const watcher = () => {
    getShapePositionSize();
}

const size_box_show = () => {
    const isLable = props.context.tool.isLabel;
    const shapes = props.context.selection.selectedShapes;
    const isTrans = props.context.workspace.isTranslating;
    if (isLable && shapes.length > 0 && !isTrans) {
        isSizeBox.value = true;
    } else {
        isSizeBox.value = false;
    }
}

const filterDecimals = (a: number) => {
    let alpha = Math.round(a * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}

onMounted(() => {
    watchShapes();
    getShapePositionSize();
    size_box_show();
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspaceUpdate);
    props.context.tool.watch(tool_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.tool.unwatch(tool_watcher);
})
</script>

<template>
    <div v-if="isSizeBox" class="container-size" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div :style="{ transform: `translate(${trans.x}px, ${trans.y}px) rotate(${rotate}deg)` }">{{
            filterDecimals(shapeSize.w) }} × {{
        filterDecimals(shapeSize.h) }}</div>
    </div>
</template>

<style scoped lang="scss">
.container-size {
    position: absolute;
    font-size: var(--font-default-fontsize);
    transform: translateX(-50%);
    text-wrap: nowrap;

    >div {
        height: 25px;
        background-color: var(--active-color);
        border-radius: 4px;
        color: #fff;
        display: flex;
        align-items: center;
        padding: 0 10px;
        transform-origin: top center;
    }
}
</style>