<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";
import { Matrix, PageView, PathShapeView, ShapeView } from '@kcdesign/data';
import { Block, Tool } from "@/context/tool";
import { Selection } from "@/context/selection";
import { XY } from "@/context/selection";
import { XYsBounding } from "@/utils/common";

const props = defineProps<{
    context: Context;
    page: PageView;
}>();

interface Scale {
    offset: number;
    data: number;
    opacity: number;
}

const ruleVisible = ref<boolean>(false);
const scalesHor = ref<Scale[]>([]);
const scalesVer = ref<Scale[]>([]);
const blocksHor = ref<Block[]>([]);
const blocksVer = ref<Block[]>([]);

const SCALE_SPACE = 80;

/**
 * @description 坐标系环境对象
 */
let coordinateEnv: ShapeView = props.context.selection.selectedPage!;

/**
 * @description 获取图层所在的环境
 */
function getContainer(shape: ShapeView) {
    let p = shape.parent;
    while (p) {
        if (p.isContainer) {
            break;
        }
        p = p.parent;
    }
    return p;
}

/**
 * @description 合并对象区间
 */
function mergeBlocks(blocks: Block[]) {
    const len = blocks.length;
    if (len < 2) {
        return blocks;
    }

    blocks.sort((a, b) => a.dataStart > b.dataStart ? 1 : -1);

    const result: Block[] = [blocks[0]];

    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        const last = result[result.length - 1];

        if (block.dataStart > last.dataEnd) {
            result.push(block);
        } else {
            last.dataEnd = Math.max(block.dataEnd, last.dataEnd);
            last.offsetEnd = Math.max(block.offsetEnd, last.offsetEnd);
        }
    }

    return result;
}

/**
 * @description 生成对象区间方块
 */
function generateBlocksForRule() {
    let bh = blocksHor.value;
    let bv = blocksVer.value;
    bh.length = 0;
    bv.length = 0;
    const ctx = props.context;
    // 大于50就不做细节更新了，可以考虑直接把controllerFrame作为结果；
    const shapes = ctx.selection.selectedShapes;
    if (ctx.user.isRuleVisible && ctx.selection.selectedShapes.length && ctx.selection.selectedShapes.length < 50) {
        const blocksX: Block[] = [];
        const blocksY: Block[] = [];

        let offsetX = 0;
        let offsetY = 0;

        const matrix = new Matrix(ctx.workspace.matrix);

        if (coordinateEnv.id !== props.context.selection.selectedPage!.id) { // 如果不是根坐标系，则需要变换到特定坐标系
            const frame = coordinateEnv.frame;
            const m2r = coordinateEnv.matrix2Root();
            const points = [
                m2r.computeCoord2(0, 0),
                m2r.computeCoord2(frame.width, 0),
                m2r.computeCoord2(frame.width, frame.height),
                m2r.computeCoord2(0, frame.height)
            ]
            const box = XYsBounding(points);

            offsetX += box.left;
            offsetY += box.top;
        }

        matrix.trans(offsetX - 20, offsetY - 20);
        const inverse = new Matrix(matrix);

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            const m = shape.matrix2Root();
            m.trans(-offsetX, -offsetY);

            const points: XY[] = [];
            const frame = shape.frame;

            if (shape.isStraight) {
                m.preScale(frame.width, frame.height);
                const [start, end] = (shape as PathShapeView)?.segments[0]?.points;
                if (!start || !end) {
                    continue;
                }
                points.push(m.computeCoord3(start), m.computeCoord3(end));
            } else {
                points.push(
                    m.computeCoord2(0, 0),
                    m.computeCoord2(frame.width, 0),
                    m.computeCoord2(frame.width, frame.height),
                    m.computeCoord2(0, frame.height)
                );
            }

            const { left, top, right, bottom } = XYsBounding(points);


            // 计算客户端视图偏移值
            {
                const offsetStart = inverse.computeCoord2(left, 0).x;
                const offsetEnd = inverse.computeCoord2(right, 0).x;

                const block: Block = {
                    dataStart: left,
                    dataEnd: right,
                    offsetStart,
                    offsetEnd
                };

                blocksX.push(block);
            }
            {
                const offsetStart = inverse.computeCoord2(0, top).y;
                const offsetEnd = inverse.computeCoord2(0, bottom).y;

                const block: Block = {
                    dataStart: top,
                    dataEnd: bottom,
                    offsetStart,
                    offsetEnd
                };

                blocksY.push(block);
            }
        }

        bh.push(...mergeBlocks(blocksX));
        bv.push(...mergeBlocks(blocksY));

        // 隐藏间隔距离小的两个端点
        for (let i = 1; i < bh.length; i++) {
            const b = bh[i];
            const last = bh[i - 1];
            if (Math.abs(b.offsetStart - last.offsetEnd) < SCALE_SPACE) {
                b.hidden = true;
            }
        }
        for (let i = 1; i < bv.length; i++) {
            const b = bv[i];
            const last = bv[i - 1];
            if (Math.abs(b.offsetStart - last.offsetEnd) < SCALE_SPACE) {
                b.hidden = true;
            }
        }
    }
}

/**
 * @description 修改刻度透明度
 */
function modifyScaleOpacity() {
    const sh = scalesHor.value;
    const sv = scalesVer.value;

    let bh = blocksHor.value;
    let bv = blocksVer.value;

    // 重置所有刻度的透明度
    for (let s = 0; s < sh.length; s++) {
        sh[s].opacity = 1;
    }
    for (let s = 0; s < sv.length; s++) {
        sv[s].opacity = 1;
    }

    // 修改靠近Block的刻度的透明度
    for (let s = 0; s < sh.length; s++) {
        const scale = sh[s];
        const offset = scale.offset + 25;

        for (let i = 0; i < bh.length; i++) {
            const b = bh[i];
            const distance = Math.min(Math.abs(offset - b.offsetStart), Math.abs(offset - b.offsetEnd));
            if (distance < SCALE_SPACE) {
                scale.opacity = Math.max((distance - 40) / 40, 0);
            }
        }
    }
    for (let s = 0; s < sv.length; s++) {
        const scale = sv[s];
        const offset = scale.offset + 25;

        for (let i = 0; i < bv.length; i++) {
            const b = bv[i];
            const distance = Math.min(Math.abs(offset - b.offsetStart), Math.abs(offset - b.offsetEnd));
            if (distance < SCALE_SPACE) {
                scale.opacity = Math.max((distance - 40) / 40, 0);
            }
        }
    }
}

/**
 * @description 确定坐标系，坐标系一定不能错，错了数据全部会错
 */
function getCoordinate() {
    const page = props.context.selection.selectedPage!;
    const shapes = props.context.selection.selectedShapes;

    coordinateEnv = page;

    if (!shapes.length) {
        return;
    } else if (shapes.length === 1) {
        const shape = shapes[0];
        const container = getContainer(shape) || page;
        if (shape.isContainer && (container.id === page.id)) {
            coordinateEnv = shape;
        } else {
            coordinateEnv = container;
        }
    } else {
        coordinateEnv = getContainer(shapes[0]) || page;

        for (let i = 1; i < shapes.length; i++) {
            const env = getContainer(shapes[i]) || page;

            if (env.id !== coordinateEnv.id) {
                coordinateEnv = page; // 存在不同的环境，坐标系直接变为Root;
                break;
            }
        }
    }
}

/**
 * @description 调用场景：Root空间发生变化、选区改变、选区图层发生改变（包括迁移、Transform， transform可以不用重新绘制刻度）；
 */
function render(sim = false) {
    ruleVisible.value = props.context.user.isRuleVisible;

    if (!ruleVisible.value) {
        return;
    }
    // 1. 绘制刻度。需要线确定坐标系，并不是每次更新都需要重新确定坐标系和绘制刻度
    if (!sim) {
        getCoordinate(); // 确定坐标环境
        // console.log('ENV 一定不能错:', coordinateEnv.name);
        let matrix = new Matrix(props.context.workspace.matrix);

        const percent = Math.round(matrix.m00 * 100);
        const scale = getScaleUnit(percent); // 获取坐标刻度，无论在哪个环境，刻度只跟当前视图缩放比例关联

        matrix.trans(-20, -20);

        if (coordinateEnv.id !== props.context.selection.selectedPage!.id) { // 如果不是根坐标系，则需要变换到特定坐标系
            const frame = coordinateEnv.frame;
            const m2r = coordinateEnv.matrix2Root();
            const points = [
                m2r.computeCoord2(0, 0),
                m2r.computeCoord2(frame.width, 0),
                m2r.computeCoord2(frame.width, frame.height),
                m2r.computeCoord2(0, frame.height)
            ]
            const box = XYsBounding(points);
            matrix.trans(box.left, box.top);
        }

        const inverse = new Matrix(matrix.inverse);
        const { width, height } = props.context.workspace.root;

        const hor = scalesHor.value;
        const ver = scalesVer.value;

        hor.length = 0;
        ver.length = 0;


        let startX = inverse.computeCoord2(0, 0).x;
        let endX = inverse.computeCoord2(width, 0).x;

        startX -= startX % scale;
        endX += scale - endX % scale;

        let startY = inverse.computeCoord2(0, 0).y;
        let endY = inverse.computeCoord2(0, height).y;

        startY -= startY % scale;
        endY += scale - endY % scale;

        for (let data = startX; data < endX; data += scale) {
            const offset = matrix.computeCoord2(data, 0).x - 24.95;

            let scale: Scale = { data, opacity: getOpacity(offset), offset };
            hor.push(scale);
        }

        for (let data = startY; data < endY; data += scale) {
            const offset = matrix.computeCoord2(0, data).y - 24.95;

            let scale: Scale = { data, opacity: getOpacity(offset), offset };
            ver.push(scale);
        }
    }

    // 2. 绘制图层区间方块
    generateBlocksForRule();
    // 3. 修改特定刻度的透明度，避免方块的数值和刻度的数值重叠在一起
    modifyScaleOpacity();
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
    const horLines = page.horReferLines || [];
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
        if (!target || !target.isNoTransform() || target.parent?.id === page.id) {
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

            linesHor.value.push({ dashPath, path, theme: '#ff2200' });
        }

        const yOffsets = mapY.get(key);
        if (!yOffsets) {
            return;
        }

        for (let i = 0; i < yOffsets.length; i++) {
            const offset = yOffsets[i];
            const p1 = m.computeCoord2(0, offset);
            const p2 = m.computeCoord2(target.frame.width, offset);

            const dashPath = [
                `M0 ${p1.y} L${p1.x} ${p1.y}`,
                `M${p2.x} ${p2.y} L${root.width} ${p2.y}`
            ];
            const path = [`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`];

            linesHor.value.push({ dashPath, path, theme: '#ff2200' });
        }
        mapY.delete(key);
    })

    mapY.forEach((offsets, key) => {
        const target = page.getShape(key);
        if (!target || !target.isNoTransform() || target.parent?.id === page.id) {
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

            linesVer.value.push({ dashPath, path, theme: '#ff2200' });
        }
    })

    const inverse = new Matrix(ctx.workspace.matrix.inverse);
    for (let i = 0; i < pageX.length; i++) {
        const x = inverse.computeCoord2(pageX[i], 0).x;
        const path = [`M${x} 0 L${x} ${root.height}`];
        linesVer.value.push({ dashPath: [], path, theme: '#ff2200' });
    }
    for (let i = 0; i < pageY.length; i++) {
        const y = inverse.computeCoord2(0, pageY[i]).y;
        const path = [`M0 ${y} L${root.width} ${y}`];
        linesVer.value.push({ dashPath: [], path, theme: '#ff2200' });
    }

    referLineStatusChange();
    referLineFocusChange();
}

/**
 * @description 获取刻度单位
 */
function getScaleUnit(percent: number) {
    let scale;
    if (percent >= 2 && percent < 5) {
        scale = 2500;
    } else if (percent >= 5 && percent < 10) {
        scale = 1000;
    } else if (percent >= 10 && percent < 20) {
        scale = 500;
    } else if (percent >= 20 && percent < 50) {
        scale = 250;
    } else if (percent >= 50 && percent < 100) {
        scale = 100;
    } else if (percent >= 100 && percent < 200) {
        scale = 50;
    } else if (percent >= 200 && percent < 500) {
        scale = 25;
    } else if (percent >= 500 && percent < 1000) {
        scale = 10
    } else if (percent >= 1000 && percent < 2500) {
        scale = 5;
    } else if (percent >= 2500 && percent < 5000) {
        scale = 2;
    } else {
        scale = 1;
    }
    return scale;
}

function getOpacity(distance: number) {
    if (distance > 10) {
        return 1;
    } else {
        return Number(((distance + 30) / 40).toFixed(1));
    }
}

function workspaceWatcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.ROOT_UPDATE) {
        render();
        renderRefLine();
    }
}

function userWatcher(t: number) {
    if (t === User.RULE_STATUS_CHANGE) {
        render();
    }
}

function toolWatcher(t: number) {
    if (t === Tool.RULE_RENDER) {
        render();
    } else if (t === Tool.RULE_RENDER_SIM) {
        render(true);
    } else if (t === Tool.HOVER_REFER_CHANGE) {
        referLineStatusChange();
    } else if (t === Tool.REFER_FOCUS_CHANGE) {
        referLineFocusChange();
    }
}

function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        render();
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
    if (!e.buttons) {
        e.stopPropagation();
    }
}

let move: any;

function downHor(e: MouseEvent) {
    document.addEventListener('mousemove', moveHor);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveHor;
}

function moveHor(e: MouseEvent) {

}

function downVer(e: MouseEvent) {
    document.addEventListener('mousemove', moveVer);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveVer;
}

function moveVer(e: MouseEvent) {

}

function upCommon(e: MouseEvent) {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', upCommon);
    window.removeEventListener("blur", blur);
}

function blur() {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', upCommon);
    window.removeEventListener("blur", blur);
}

function pageWatcher(...args: any) {
    console.log('args', args);
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
})
onUnmounted(() => {
    props.context.tool.unwatch(toolWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    props.context.user.unwatch(userWatcher);
    props.page.unwatch(pageWatcher);
})
</script>
<template>
    <div v-if="ruleVisible" class="rule-container">
        <svg width="100" height="100" viewBox="0 0 100 100">
            <g v-for="(lh, i) in linesHor" :key="i">
                <path v-for="(lhs, _i) in lh.path" :d="lhs" :key="_i" :stroke="lh.theme"/>
            </g>
            <g v-if="hovered">
                <path v-for="(lhd, _i) in hovered.dashPath" :d="lhd" :key="_i" stroke="red" stroke-width="1.2"
                      stroke-dasharray="3 3"/>
                <path :d="hovered.path[0]" stroke="red" stroke-width="1.2"/>
                <path :d="hovered.path[0]" stroke="transparent" stroke-width="14" @mousedown="downHover"
                      style="pointer-events: auto"/>
            </g>
            <g v-if="selected">
                <path v-for="(lhd, _i) in selected.dashPath" :d="lhd" :key="_i" stroke="#3387f5" stroke-width="1.5"
                      stroke-dasharray="3 3"/>
                <path :d="selected.path[0]" stroke="#3387f5" stroke-width="1.2"/>
                <path :d="selected.path[0]" stroke="transparent" stroke-width="14" style="pointer-events: auto"/>
            </g>
        </svg>
        <div class="contact-block"></div>
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
        z-index: 1;
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

        .block {
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

        .lineX {
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 0.5px;
            height: 4000px;
            background-color: #ff4400;
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

        .lineY {
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 4000px;
            height: 0.5px;
            background-color: #ff4400;
        }
    }
}
</style>