/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import {
    FillsAsyncApi,
    ColVector3D,
    ShapeView, Fill, SymbolRefView, Repo,
    Transform
} from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { DragKit } from "@/components/common/draggable";
import { CursorType } from "@/utils/cursor";

type Api = Repo.Api;

interface Props {
    context: Context;
}

enum Direction { Ver, Hor, Angle }

const props = defineProps<Props>();
const maskPath = ref<string>('');
const transformLT = ref<string>();
const transformT = ref<string>();
const transformRT = ref<string>();
const transformR = ref<string>();
const transformRB = ref<string>();
const transformB = ref<string>();
const transformLB = ref<string>();
const transformL = ref<string>();
const visible = ref<boolean>(true);

const rightSidePath = ref<string>();
const bottomSidePath = ref<string>();

let transformBase: Transform = new Transform();

let direction: Direction = Direction.Angle;
let editor: FillsAsyncApi | undefined = undefined;
const dragKit = new DragKit({
    move: (event: MouseEvent) => {
        const ctx = props.context;

        const locate = ctx.color.locate;
        if (!locate) return;
        const shape = ctx.selection.selectedShapes[0];
        if (!shape) return;

        const page = ctx.selection.selectedPage!;
        if (!editor) editor = new FillsAsyncApi(ctx.repo, ctx.data, page);
        const rootXY = ctx.workspace.getRootXY(event);
        const matrix2root = ctx.selection.selectedShapes[0].matrix2Root().inverse;
        const xy = matrix2root.computeCoord3(rootXY);
        const fill = shape.getFills()[locate.index];
        let originWidth = fill.originalImageWidth ?? 100;
        let originHeight = fill.originalImageHeight ?? 100;
        const rotation = fill.rotation ?? 0;
        if (rotation % 180) {
            originWidth = originWidth ^ originHeight;
            originHeight = originWidth ^ originHeight;
            originWidth = originWidth ^ originHeight;
        }
        let scale: number;
        if (direction === Direction.Ver) {
            scale = xy.y / originHeight;
        } else if (direction === Direction.Hor) {
            scale = xy.x / originWidth;
        } else {
            scale = Math.max(xy.y / originHeight, xy.x / originWidth);
        }
        scale = Math.max(0.02, scale);

        const views: ShapeView[] = [];
        const fills: Fill[] = [];
        for (const view of ctx.selection.flat) {
            if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
            else fills.push(view.getFills()[locate.index]);
        }
        const modifyVariable = (api: Api) => {
            for (const view of views) {
                const variable = editor!.getFillsVariable(api, page, view);
                api.setFillImageScale(variable.value[locate.index], scale);
            }
        }
        const modifyLocal = (api: Api) => {
            for (const fill of fills) api.setFillImageScale(fill, scale);
        }
        editor!.modifyTileScale2([modifyVariable, modifyLocal]);
    },
    commit: () => {
        editor?.commit();
        editor = undefined;
        if (need_reset_cursor_after_transform) props.context.cursor.reset();
    }
});

function start(event: MouseEvent, d: Direction) {
    direction = d;
    dragKit.start(event);
}

let need_reset_cursor_after_transform = true;

function setCursor(type: Direction, active = false) {
    let deg = transformBase.decomposeRotate() * 180 / Math.PI;
    if (type === Direction.Ver) {
        deg += 90;
    } else if (type === Direction.Angle) {
        deg += 45;
    }
    const cursor = props.context.cursor;
    active ? cursor.setTypeForce(CursorType.Scale, deg) : cursor.setType(CursorType.Scale, deg);
}

function enter(type: Direction) {
    setCursor(type);
    need_reset_cursor_after_transform = false;
}

function leave() {
    need_reset_cursor_after_transform = true;
    if (!editor) props.context.cursor.reset();
}

function update() {
    const locate = props.context.color.locate;
    if (!locate) return;
    const frame = props.context.color.imageOriginFrame;
    if (!frame) return;

    const shape = props.context.selection.selectedShapes[0];
    const fill = shape.getFills()[locate.index];
    const rotation = fill.rotation ?? 0;
    const scale = fill.scale;
    let width = frame.width * (scale ?? 0.5);
    let height = frame.height * (scale ?? 0.5);

    if (rotation % 180) {
        width = width ^ height;
        height = width ^ height;
        width = width ^ height;
    }

    const transform = new Transform()
        .addTransform((shape.matrix2Root()))
        .addTransform((props.context.workspace.matrix));

    const lt = new Transform()
        .setTranslate(ColVector3D.FromXY(0, 0))
        .addTransform(transform)
        lt.clearScaleSize();
    const top = new Transform()
        .setTranslate(ColVector3D.FromXY(width / 2, 0))
        .addTransform(transform)
        top.clearScaleSize();
    const rt = new Transform()
        .setTranslate(ColVector3D.FromXY(width, 0))
        .addTransform(transform)
        rt.clearScaleSize();
    const right = new Transform()
        .setTranslate(ColVector3D.FromXY(width, height / 2))
        .addTransform(transform)
        right.clearScaleSize();
    const rb = new Transform()
        .setTranslate(ColVector3D.FromXY(width, height))
        .addTransform(transform)
        rb.clearScaleSize();
    const bottom = new Transform()
        .setTranslate(ColVector3D.FromXY(width / 2, height))
        .addTransform(transform)
        bottom.clearScaleSize();
    const lb = new Transform()
        .setTranslate(ColVector3D.FromXY(0, height))
        .addTransform(transform)
        lb.clearScaleSize();
    const left = new Transform()
        .setTranslate(ColVector3D.FromXY(0, height / 2))
        .addTransform(transform)
        left.clearScaleSize();

    const ltDot = lt.transform(ColVector3D.FromXY(0, 0));
    const rtDot = rt.transform(ColVector3D.FromXY(0, 0));
    const rbDot = rb.transform(ColVector3D.FromXY(0, 0));
    const lbDot = lb.transform(ColVector3D.FromXY(0, 0));

    rightSidePath.value = `M${rtDot.x} ${rtDot.y} L${rbDot.x} ${rbDot.y}`;
    bottomSidePath.value = `M${lbDot.x} ${lbDot.y} L${rbDot.x} ${rbDot.y}`;

    maskPath.value = `M${ltDot.x}, ${ltDot.y} L${rtDot.x}, ${rtDot.y} L${rbDot.x}, ${rbDot.y} L${lbDot.x}, ${lbDot.y}`;
    visible.value = Math.min(Math.abs(ltDot.x - rtDot.x), Math.abs(ltDot.y - rbDot.y)) > 24;

    transformBase = lt;
    transformLT.value = (lt).toString();
    transformT.value = (top).toString();
    transformRT.value = (rt).toString();
    transformR.value = (right).toString();
    transformRB.value = (rb).toString();
    transformB.value = (bottom).toString();
    transformLB.value = (lb).toString();
    transformL.value = (left).toString();
}

function workspaceWatcher(t: any) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) update();
}

let stop: any = undefined;

onMounted(() => {
    props.context.workspace.watch(workspaceWatcher);
    stop = props.context.selection.selectedShapes[0]?.watch(update);
    update();
});
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    stop?.();
});
</script>

<template>
    <svg overflow="visible" width="100" height="100" viewBox="0 0 100 100" style="position: absolute;">
        <path class="mask" :d="maskPath"/>
        <g v-if="visible">
            <path :transform="transformLT" d="M0 0 h12 v4 h-8 v8 h-4 z"/>
            <path :transform="transformT" d="M-6 0 h12 v4 h-12 z"/>
            <path :transform="transformRT" d="M-12 0 h12 v12 h-4 v-8 h-8 z"/>
            <path class="assist" :d="rightSidePath" @mousedown="(e) => start(e, Direction.Hor)" stroke-width="10"
                  @mouseenter="() => enter(Direction.Hor)" @mouseleave="leave"/>
            <path :transform="transformR" d="M0 -6 v12 h-4 v-12 z"
                  @mousedown="(e) => start(e, Direction.Hor)" @mouseenter="() => enter(Direction.Hor)"
                  @mouseleave="leave"/>
            <path class="assist" :d="bottomSidePath" @mousedown="(e) => start(e, Direction.Ver)" stroke-width="10"
                  @mouseenter="() => enter(Direction.Ver)" @mouseleave="leave"/>
            <path :transform="transformRB" d="M0 0 h-12 v-4 h8 v-8 h4"/>
            <path class="assist" :transform="transformRB" d="M-10 -10 h20 v20 h-20"
                  @mousedown="(e) => start(e, Direction.Angle)" @mouseenter="() => enter(Direction.Angle)"
                  @mouseleave="leave"/>
            <path :transform="transformB" d="M6 0 h-12 v-4 h12 z"
                  @mousedown="(e) => start(e, Direction.Ver)" @mouseenter="() => enter(Direction.Ver)"
                  @mouseleave="leave"/>
            <path :transform="transformLB" d="M0 0 h12 v-4 h-8 v-8 h-4 z"/>
            <path :transform="transformL" d="M0 -6 h4 v12 h-4 z"/>
        </g>
    </svg>
</template>

<style scoped lang="scss">
.mask {
    fill: rgba(0, 0, 0, 0.35) !important;
}

path {
    fill: var(--active-color);
}

.assist {
    fill: transparent;
    stroke: transparent;
}
</style>