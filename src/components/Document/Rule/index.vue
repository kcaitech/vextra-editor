<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";
import { Matrix, PageView } from '@kcdesign/data';
import { Block, Tool } from "@/context/tool";
import { Selection } from "@/context/selection";
import { ReferLineHandler, ReferUnit } from "@/components/Document/Rule/refer";
import { ReferUnderContainerHandler } from "@/components/Document/Rule/referUnderContainerHandler";
import { Scale, ScaleRenderer } from "@/components/Document/Rule/scaleRenderer";

const props = defineProps<{
    context: Context;
    page: PageView;
}>();

const ruleVisible = ref<boolean>(true);

/**
 * @description 建立与绘制刻度坐标系
 */
const scalesHor = ref<Scale[]>([]);
const scalesVer = ref<Scale[]>([]);
const blocksHor = ref<Block[]>([]);
const blocksVer = ref<Block[]>([]);
const scaleRenderer = new ScaleRenderer(props.context, props.page, scalesHor.value, scalesVer.value, blocksHor.value, blocksVer.value);

/**
 * @description 绘制容器内参考线
 */
const lineUnits = ref<ReferUnit[]>([]);
const referUnderContainerHandler = new ReferUnderContainerHandler(lineUnits.value as ReferUnit[], props.page);

const rootLines = ref<ReferUnit>();

const pageWatcher = (...args: any) => {
    if (args.length === 1 && args[0] === 'childs') {
        referUnderContainerHandler.updateUnderRootContainerMap();
    }
    if (args.includes('horReferLines') || args.includes('verReferLines')) {
        renderRefLine();
    }
}

const linesHor = ref<ReferLineView[]>([]);
const linesVer = ref<ReferLineView[]>([]);

/**
 * @description 更新参考线
 * 调用场景：Root空间发生变化、指定容器发生变化
 * todo 监听指定容器和Page
 */
function renderRefLine() {
    linesHor.value.length = 0;
    linesVer.value.length = 0;

    const page = props.page;
    const ctx = props.context;

    const horLines = page.horReferLines || []; // 页面内的参考线数据
    const verLines = page.verReferLines || [];

    const mapX = new Map<string, number[]>();
    const mapY = new Map<string, number[]>();
    const pageX: number[] = [];
    const pageY: number[] = [];

    for (let i = 0; i < horLines.length; i++) {
        const r = horLines[i];
        if (!r.referId) {
            pageX.push(r.offset);
        } else {
            let __mx = mapX.get(r.referId);
            if (!__mx) {
                __mx = [];
                mapX.set(r.referId, __mx);
            }
            __mx.push(r.offset);
        }
    }

    for (let i = 0; i < verLines.length; i++) {
        const r = verLines[i];
        if (!r.referId) {
            pageY.push(r.offset);
        } else {
            let __my = mapY.get(r.referId);
            if (!__my) {
                __my = [];
                mapY.set(r.referId, __my);
            }
            __my.push(r.offset);
        }
    }
    const root = ctx.workspace.root;
    mapX.forEach((offsets, key) => {
        const target = page.getShape(key);
        if (!target || !target.isNoTransform() || target.parent?.id !== page.id) {
            return;
        }
        const m = target.matrix2Root();
        m.multiAtLeft(props.context.workspace.matrix);

        for (let i = 0; i < offsets.length; i++) {
            const offset = offsets[i];
            const p1 = m.computeCoord2(0, offset);
            const p2 = m.computeCoord2(target.frame.width, offset);

            const dashPath = [
                `M0 ${p1.y} L${p1.x} ${p1.y}`,
                `M${p2.x} ${p2.y} L${root.width} ${p2.y}`
            ];
            const path = [`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`];
            linesHor.value.push({dashPath, path, theme: '#ff2200'});
        }

        const yOffsets = mapY.get(key);
        if (!yOffsets) {
            return;
        }

        for (let i = 0; i < yOffsets.length; i++) {
            const offset = yOffsets[i];
            const p1 = m.computeCoord2(offset, 0);
            const p2 = m.computeCoord2(offset, target.frame.height);

            const dashPath = [
                `M${p1.x} 0 L${p1.x} ${p1.y}`,
                `M${p2.x} ${p2.y} L${p2.x} ${root.height}`
            ];
            const path = [`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`];

            linesHor.value.push({dashPath, path, theme: '#ff2200'});
        }
        mapY.delete(key);
    })

    mapY.forEach((offsets, key) => {
        const target = page.getShape(key);
        if (!target || !target.isNoTransform() || target.parent?.id !== page.id) {
            return;
        }
        const m = target.matrix2Root();
        m.multiAtLeft(props.context.workspace.matrix);

        for (let i = 0; i < offsets.length; i++) {
            const offset = offsets[i];
            const p1 = m.computeCoord2(offset, 0);
            const p2 = m.computeCoord2(offset, target.frame.height);

            const dashPath = [
                `M${p1.x} 0 L${p1.x} ${p1.y}`,
                `M${p2.x} ${p2.y} L${p2.x} ${root.height}`
            ];
            const path = [`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`];

            linesVer.value.push({dashPath, path, theme: '#ff2200'});
        }
    })

    const matrix = new Matrix(ctx.workspace.matrix);
    for (let i = 0; i < pageX.length; i++) {
        console.log()
        const y = matrix.computeCoord2(0, pageX[i]).y;
        const path = [`M0 ${y} L${root.width} ${y}`];
        linesHor.value.push({dashPath: [], path, theme: '#ff2200'});
    }
    for (let i = 0; i < pageY.length; i++) {
        const x = matrix.computeCoord2(pageY[i], 0).x;
        const path = [`M${x} 0 L${x} ${root.height}`];
        linesVer.value.push({dashPath: [], path, theme: '#ff2200'});
    }

    referLineStatusChange();
    referLineFocusChange();
}

function workspaceWatcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.ROOT_UPDATE) {
        scaleRenderer.render();
        renderRefLine();
    }
}

function userWatcher(t: number) {
    if (t === User.RULE_STATUS_CHANGE) {
        ruleVisible.value = props.context.user.isRuleVisible;
        scaleRenderer.render();
    }
}

function toolWatcher(t: number) {
    if (t === Tool.RULE_RENDER) {
        scaleRenderer.render();
    } else if (t === Tool.RULE_RENDER_SIM) {
        scaleRenderer.render(true);
    } else if (t === Tool.HOVER_REFER_CHANGE) {
        referLineStatusChange();
    } else if (t === Tool.REFER_FOCUS_CHANGE) {
        referLineFocusChange();
    }
}

function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        scaleRenderer.render();
        const ctx = props.context;
        if (ctx.selection.selectedShapes.length) {
            ctx.tool.selectLine(undefined);
        }
    }
}

function formatNumber(v: number) {
    return Math.abs(v % 1) > 0.01 ? v.toFixed(2) : Math.round(v);
}

function moveStop(e: MouseEvent) {
    if (e.button !== 0) {
        e.stopPropagation();
    }
}

let move: any;
let referLineHandler: ReferLineHandler | undefined;
let isDrag = false;

function downHor(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    e.stopPropagation();
    props.context.tool.selectLine(undefined);
    referLineHandler = new ReferLineHandler(props.context, e, "hor");
    document.addEventListener('mousemove', moveHor);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveHor;
}

function moveHor(e: MouseEvent) {
    if (isDrag) {
        referLineHandler?.execute(e);
    } else {
        const y = props.context.workspace.getContentXY(e).y;
        if (y >= 20) {
            isDrag = true;
            referLineHandler?.createApiCaller();
        }
    }
}

function downVer(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    e.stopPropagation();
    props.context.tool.selectLine(undefined);
    referLineHandler = new ReferLineHandler(props.context, e, "ver");
    document.addEventListener('mousemove', moveVer);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveVer;
}

function moveVer(e: MouseEvent) {
    if (isDrag) {
        referLineHandler?.execute(e);
    } else {
        const x = props.context.workspace.getContentXY(e).x;
        if (x >= 20) {
            isDrag = true;
            referLineHandler?.createApiCaller();
        }
    }
}

function clear() {
    isDrag = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', upCommon);
    window.removeEventListener("blur", blur);
    referLineHandler?.fulfil();
    referLineHandler = undefined;
}

function upCommon(e: MouseEvent) {
    clear();
}

function blur() {
    clear();
}

interface ReferLineView {
    theme: string;
    dashPath: string[];
    path: string[];
}

const hovered = ref<ReferLineView | undefined>();
let __hovered: ['ver' | 'hor', number] | undefined;
const selected = ref<ReferLineView | undefined>();
let __selected: ['ver' | 'hor', number] | undefined;

function referLineStatusChange() {
    hovered.value = undefined;
    __hovered = undefined;
    const hover = props.context.tool.hoveredLine;
    if (!hover) {
        return;
    }
    __hovered = hover;
    const [direction, index] = hover;
    if (direction === 'hor') {
        hovered.value = linesHor.value[index];
    } else {
        hovered.value = linesVer.value[index];
    }
}

function referLineFocusChange() {
    selected.value = undefined;
    __selected = undefined;
    const select = props.context.tool.selectedLine;
    if (!select) {
        return;
    }
    __selected = select;
    const [direction, index] = select;
    if (direction === 'hor') {
        selected.value = linesHor.value[index];
    } else {
        selected.value = linesVer.value[index];
    }
    if (selected.value) {
        props.context.selection.resetSelectShapes();
    }
}

function downHover(e: MouseEvent) {
    if (e.button !== 0 || !__hovered) {
        return;
    }
    e.stopPropagation();
    props.context.tool.selectLine([...__hovered]);
}

onMounted(() => {
    props.context.tool.watch(toolWatcher);
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
    props.context.user.watch(userWatcher);
    props.page.watch(pageWatcher);
    referUnderContainerHandler.updateUnderRootContainerMap();
})
onUnmounted(() => {
    props.context.tool.unwatch(toolWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    props.context.user.unwatch(userWatcher);
    props.page.unwatch(pageWatcher);
    referUnderContainerHandler.clearContainerWatcher();
})
</script>
<template>
    <div v-if="ruleVisible" class="rule-container">
        <svg width="100" height="100" viewBox="0 0 100 100">
            <g v-for="(lh, i) in linesHor" :key="i">
                <path v-for="(lhs, _i) in lh.path" :d="lhs" :key="_i" :stroke="lh.theme"/>
            </g>
            <g v-for="(lv, i) in linesVer" :key="i">
                <path v-for="(lvs, _i) in lv.path" :d="lvs" :key="_i" :stroke="lv.theme"/>
            </g>
            <g v-if="hovered">
                <path v-for="(lhd, _i) in hovered.dashPath" :d="lhd" :key="_i" stroke="red" stroke-width="1.2"
                      stroke-dasharray="3 3"/>
                <path :d="hovered.path[0]" stroke="red" stroke-width="1.2"/>
                <path :d="hovered.path[0]" stroke="transparent" stroke-width="14" @mousedown="downHover"
                      style="pointer-events: auto"/>
            </g>
            <g v-if="selected">
                <path v-for="(lhd, _i) in selected.dashPath" :d="lhd" :key="_i" stroke="#ff2200" stroke-width="1"
                      stroke-dasharray="3 3"/>
                <path :d="selected.path[0]" stroke="#ff2200" stroke-width="1"/>
                <path :d="selected.path[0]" stroke="transparent" stroke-width="14" style="pointer-events: auto"/>
            </g>
        </svg>
        <div class="contact-block"/>
        <div class="d-hor" @mousemove="moveStop" @mousedown="downHor">
            <div v-for="(s, i) in scalesHor"
                 :key="i"
                 :style="{transform: `translateX(${s.offset}px)`, opacity: s.opacity}"
                 class="scale"
            >
                <div class="scale-number">
                    {{ s.data }}
                </div>
                <div class="dot"></div>
            </div>
            <div v-for="(b, i) in blocksHor"
                 :key="i"
                 :style="{transform: `translateX(${b.offsetStart}px)`, width: (b.offsetEnd - b.offsetStart) + 'px'}"
                 class="block"
            >
                <div v-if="!b.hidden" class="start-data"> {{ formatNumber(b.dataStart) }}</div>
                <div class="end-data"> {{ formatNumber(b.dataEnd) }}</div>
            </div>
        </div>
        <div class="d-ver" @mousemove="moveStop" @mousedown="downVer">
            <div v-for="(s, i) in scalesVer"
                 :key="i"
                 :style="{transform: `translateY(${s.offset}px)`, opacity: s.opacity}"
                 class="scale"
            >
                <div class="scale-number">
                    {{ s.data }}
                </div>
                <div class="dot"></div>
            </div>
            <div v-for="(b, i) in blocksVer"
                 :key="i"
                 :style="{transform: `translateY(${b.offsetStart}px)`, height: (b.offsetEnd - b.offsetStart) + 'px'}"
                 class="block"
            >
                <div v-if="!b.hidden" class="start-data"> {{ formatNumber(b.dataStart) }}</div>
                <div class="end-data"> {{ formatNumber(b.dataEnd) }}</div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.rule-container {
    --color: #CCC;
    --block-back: rgba(24, 120, 245, 0.25);

    width: 100%;
    height: 100%;
    pointer-events: none;
    position: relative;
    font-weight: 700;

    overflow: hidden;

    > svg {
        pointer-events: none;
        position: absolute;
        z-index: 10;
        overflow: visible;
    }

    .contact-block {
        width: 20px;
        height: 20px;
        background-color: var(--theme-color-anti);
        box-sizing: border-box;
        border-right: 1px solid var(--grey);
        border-bottom: 1px solid var(--grey);
        position: absolute;
    }

    .d-hor {
        position: absolute;
        width: calc(100% - 20px);
        top: 0;
        left: 20px;
        height: 20px;
        box-sizing: border-box;
        border-bottom: 1px solid var(--grey);
        background-color: var(--theme-color-anti);
        overflow-x: clip;
        pointer-events: auto;
        cursor: row-resize;
        z-index: 9;

        > .scale {
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 50px;
            height: 100%;
            font-size: 10px;
            color: var(--color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;

            .dot {
                width: 1px;
                height: 4px;
                background-color: var(--color);
            }
        }

        > .block {
            pointer-events: none;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background-color: var(--block-back);

            > div {
                color: var(--active-color);
                font-size: 10px;
                position: absolute;
            }

            .start-data {
                left: 0;
                transform: translateX(-108%);
            }

            .end-data {
                right: 0;
                transform: translateX(108%);
            }
        }
    }

    .d-ver {
        position: absolute;
        width: 20px;
        top: 20px;
        left: 0;
        height: calc(100% - 20px);
        box-sizing: border-box;
        border-right: 1px solid var(--grey);
        background-color: var(--theme-color-anti);
        overflow-y: clip;
        pointer-events: auto;
        cursor: col-resize;
        z-index: 9;

        > .scale {
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 50px;

            font-size: 10px;
            color: var(--color);

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;

            writing-mode: vertical-lr;

            .scale-number {
                transform: rotate(180deg);
            }

            .dot {
                width: 4px;
                height: 1px;
                background-color: var(--color);
            }
        }

        > .block {
            pointer-events: none;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background-color: var(--block-back);

            > div {
                color: var(--active-color);
                font-size: 10px;
                position: absolute;

                writing-mode: vertical-lr;
            }

            .start-data {
                top: 0;
                transform: translateY(-108%) rotate(180deg);
            }

            .end-data {
                bottom: 0;
                transform: translateY(108%) rotate(180deg);
            }
        }
    }
}
</style>