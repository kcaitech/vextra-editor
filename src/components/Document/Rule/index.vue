<script setup lang="ts">

import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";
import { Matrix, PathShapeView, ShapeView } from '@kcdesign/data';
import { Block, Tool } from "@/context/tool";
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

function getContainer(shape: ShapeView) {
    let p = shape.parent;
    while (p) {
        if (p.isContainer) break;
        p = shape.parent;
    }
    return p;
}

function getMatrix2Container(shape: ShapeView) {
    const container = getContainer(shape)!;
    let m = new Matrix(shape.matrix2Parent());
    let p = shape.parent;
    while (p && (p.id !== container.id)) {
        m.multiAtLeft(p.matrix2Parent());
        p = p.parent;
    }

    return m;
}

function generateBlocksForRule() {
    blocksHor.value.length = 0;
    blocksVer.value.length = 0;
    const ctx = props.context;
    // 大于50咱们就不做细节更新了，可以考虑直接把controllerFrame作为结果；
    const shapes = ctx.selection.selectedShapes;
    if (ctx.user.isRuleVisible && ctx.selection.selectedShapes.length && ctx.selection.selectedShapes.length < 50) {
        const parentContainer = new Map<string, ShapeView>();
        // 先确认坐标系
        let env;
        let id;

        for (let i = 0; i < shapes.length; i++) {
            const parent = getContainer(shapes[i])!;
            id = parent.id;
            if (parentContainer.has(parent.id)) {
                env = ctx.selection.selectedPage!;
                break;
            }

            parentContainer.set(parent.id, parent);
        }
        if (!env) {
            env = parentContainer.get(id || '') || ctx.selection.selectedPage!;
        }

        let isNotUnderRoot = env !== ctx.selection.selectedPage!;

        const matrix = new Matrix(ctx.workspace.matrix);
        matrix.trans(-20, -20);
        const inverse = new Matrix(matrix);

        const blocksX: Block[] = [];
        const blocksY: Block[] = [];

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            const m2parent = getMatrix2Container(shape);

            const parent = getContainer(shape)!;
            const parent2root = parent.matrix2Root();

            const m2root = new Matrix(m2parent);
            m2root.multiAtLeft(parent2root);

            const points: XY[] = [];
            const points2env: XY[] = [];
            const frame = shape.frame;
            if (shape.isStraight) {
                m2root.preScale(frame.width, frame.height);
                const [start, end] = (shape as PathShapeView)?.segments[0]?.points;
                if (!start || !end) {
                    continue;
                }
                points.push(m2root.computeCoord3(start), m2root.computeCoord3(end));
                if (isNotUnderRoot) {
                    m2parent.preScale(frame.width, frame.height);
                    points2env.push(m2root.computeCoord3(start), m2root.computeCoord3(end));
                }
            } else {
                points.push(
                    m2root.computeCoord2(0, 0),
                    m2root.computeCoord2(frame.width, 0),
                    m2root.computeCoord2(frame.width, frame.height),
                    m2root.computeCoord2(0, frame.height)
                );

                if (isNotUnderRoot) {
                    points2env.push(
                        m2parent.computeCoord2(0, 0),
                        m2parent.computeCoord2(frame.width, 0),
                        m2parent.computeCoord2(frame.width, frame.height),
                        m2parent.computeCoord2(0, frame.height)
                    );
                }
            }

            const { left, top, right, bottom } = XYsBounding(points);
            let leftEnv = left;
            let topEnv = top;
            let rightEnv = right;
            let bottomEnv = bottom;

            if (isNotUnderRoot) {
                const { left, top, right, bottom } = XYsBounding(points2env);
                leftEnv = left;
                topEnv = top;
                rightEnv = right;
                bottomEnv = bottom;
            }

            {
                const offsetStart = inverse.computeCoord2(left, 0).x;
                const offsetEnd = inverse.computeCoord2(right, 0).x;

                const block: Block = {
                    start: left,
                    end: right,
                    dataStart: left,
                    dataEnd: right,
                    offsetStart,
                    offsetEnd
                };

                if (isNotUnderRoot) {
                    block.dataStart = leftEnv;
                    block.dataEnd = rightEnv;
                }

                blocksX.push(block);
            }

            {
                const offsetStart = inverse.computeCoord2(0, top).y;
                const offsetEnd = inverse.computeCoord2(0, bottom).y;
                const block: Block = {
                    start: top,
                    end: bottom,
                    dataStart: top,
                    dataEnd: bottom,
                    offsetStart,
                    offsetEnd
                };

                if (isNotUnderRoot) {
                    block.dataStart = topEnv;
                    block.dataEnd = bottomEnv;
                }

                blocksY.push(block);
            }
        }


        blocksHor.value = mergeBlocks(blocksX);
        blocksVer.value = mergeBlocks(blocksY)
    }
}

function mergeBlocks(blocks: Block[]) {
    const len = blocks.length;
    if (len < 2) {
        return blocks;
    }

    blocks.sort((a, b) => a.start > b.start ? 1 : -1);

    const result: Block[] = [blocks[0]];

    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        const last = result[result.length - 1];

        if (block.start > last.end) {
            result.push(block);
        } else {
            last.end = Math.max(block.end, last.end);
            last.dataEnd = Math.max(block.dataEnd, last.dataEnd);
            last.offsetEnd = Math.max(block.offsetEnd, last.offsetEnd);
        }
    }

    return result;
}

function render() {
    const hor = scalesHor.value;
    const ver = scalesVer.value;
    const refH = refersHor.value;
    const refV = refersVer.value;
    hor.length = 0;
    ver.length = 0;

    refH.length = 0;
    refV.length = 0;

    ruleVisible.value = props.context.user.isRuleVisible;

    if (!ruleVisible.value) {
        return;
    }

    const matrix = new Matrix(props.context.workspace.matrix);

    const percent = Math.round(matrix.m00 * 100);

    matrix.trans(-20, -20);

    const inverse = new Matrix(matrix.inverse);
    const { width, height } = props.context.workspace.root;

    contentWidth.value = width;
    contentHeight.value = height;

    const scale = getScale(percent);

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

    // todo 此处为测试数据
    refH.push(-2800, -3750, -4000);
    refV.push(-4000, -4900);

    for (let i = 0; i < refH.length; i++) {
        refH[i] = matrix.computeCoord2(refH[i], 0).x - 0.25;
    }
    for (let i = 0; i < refV.length; i++) {
        refV[i] = matrix.computeCoord2(0, refV[i]).y - 0.25;
    }
}

function getScale(percent: number) {
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
        generateBlocksForRule();
        render();
    }
}

function userWatcher(t: number) {
    if (t === User.RULE_STATUS_CHANGE) {
        render();
    }
}

function toolWatcher(t: number) {
    if (t === Tool.BLOCKS_CHANGE) {
        generateBlocksForRule();
    }
}

onMounted(() => {
    props.context.tool.watch(toolWatcher);
    props.context.workspace.watch(workspaceWatcher);
    props.context.user.watch(userWatcher);
})
onUnmounted(() => {
    props.context.tool.unwatch(toolWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
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
    --color: #DADADA;
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