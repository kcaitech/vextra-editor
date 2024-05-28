<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";
import { Matrix, PathShapeView, ShapeView } from '@kcdesign/data';
import { Block, Tool } from "@/context/tool";
import { Selection } from "@/context/selection";
import { XY } from "@/context/selection";
import { XYsBounding } from "@/utils/common";

const props = defineProps<{
    context: Context
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
const refersHor = ref<number[]>([]);
const refersVer = ref<number[]>([]);

const contentWidth = ref<number>(100);
const contentHeight = ref<number>(100);

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

/**
 * @description 更新参考线
 * 调用场景：Root空间发生变化、指定容器发生变化
 * todo 监听指定容器和Page
 */
function renderRefLine() {
    const ctx = props.context;

    const refH = refersHor.value;
    const refV = refersVer.value;
    refH.length = 0;
    refV.length = 0;

    if (!ctx.user.isRuleVisible) {
        return;
    }

    const { width, height } = props.context.workspace.root;

    contentWidth.value = width;
    contentHeight.value = height;

    // todo 此处为测试数据
    refH.push(-2800, -3750, -4000);
    refV.push(-4000, -4900);

    const matrix = new Matrix(ctx.workspace.matrix);
    matrix.trans(-20, -20);

    for (let i = 0; i < refH.length; i++) {
        refH[i] = matrix.computeCoord2(refH[i], 0).x - 0.25;
    }
    for (let i = 0; i < refV.length; i++) {
        refV[i] = matrix.computeCoord2(0, refV[i]).y - 0.25;
    }
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
    }
}

function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        render();
    }
}

function formatNumber(v: number) {
    return Math.abs(v % 1) > 0.01 ? v.toFixed(2) : Math.round(v);
}

onMounted(() => {
    props.context.tool.watch(toolWatcher);
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
    props.context.user.watch(userWatcher);
})
onUnmounted(() => {
    props.context.tool.unwatch(toolWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    props.context.user.unwatch(userWatcher);
})
</script>
<template>
    <div v-if="ruleVisible" class="rule-container">
        <div class="contact-block"></div>
        <div class="d-hor">
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
            <div v-for="(l, i) in refersHor"
                 :key="i"
                 :style="{transform: `translateX(${l}px)`, height: contentHeight + 'px'}"
                 class="lineX"
            />
        </div>
        <div class="d-ver">
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
            <div
                v-for="(l, i) in refersVer"
                :key="i"
                :style="{transform: `translateY(${l}px)`, width: contentWidth+ 'px'}"
                class="lineY"
            />
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

    .contact-block {
        width: 20px;
        height: 20px;
        background-color: var(--theme-color-anti);
        box-sizing: border-box;
        border-right: 1px solid var(--grey);
        border-bottom: 1px solid var(--grey);
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

        > .scale {
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

        > .scale {
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