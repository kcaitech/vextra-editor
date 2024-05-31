<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";
import { GuideAxis, PageView } from '@kcdesign/data';
import { Block, Tool } from "@/context/tool";
import { Selection } from "@/context/selection";
import { formatNumber, ReferLineHandler, ReferUnit } from "@/components/Document/Rule/refer";
import { ReferUnderContainerRenderer } from "@/components/Document/Rule/referUnderContainerRenderer";
import { Scale, ScaleRenderer } from "@/components/Document/Rule/scaleRenderer";
import { RootReferHandler } from "@/components/Document/Rule/rootReferHandler";
import { ActiveGuide, LineTheme, ReferLineSelection } from "@/components/Document/Rule/referLineSelection";

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
const referUnderContainerRenderer = new ReferUnderContainerRenderer(props.context, lineUnits.value as ReferUnit[], props.page);

/**
 * @description 绘制root下参考线
 */
const rootLines = ref<ReferUnit>({ id: props.page.id, lines: [], shape: props.page });
const rootReferHandler = new RootReferHandler(props.context, props.page, rootLines.value as ReferUnit);

/**
 * @description 参考线选区
 */
const selected = ref<ActiveGuide>({
    valid: false,
    index: -1,
    env: props.page,
    path: [],
    theme: LineTheme.Active,
    visible: true,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    axis: GuideAxis.X,
    offset: 0,
    transform: '',
    desc: 0
});
const hovered = ref<ActiveGuide>({
    valid: false,
    index: -1,
    env: props.page,
    path: [],
    theme: LineTheme.Normal,
    visible: true,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    axis: GuideAxis.X,
    offset: 0,
    transform: '',
    desc: 0
})
const referLineSelection = new ReferLineSelection(
    props.context,
    lineUnits.value as ReferUnit[],
    rootLines.value as ReferUnit,
    selected.value as ActiveGuide,
    hovered.value as ActiveGuide
);


const pageWatcher = (...args: any) => {
    if (args.length === 1 && args[0] === 'childs') {
        referUnderContainerRenderer.updateUnderRootContainerMap();
    }
    if (args.includes('guides')) {
        rootReferHandler.render();
    }
}

function workspaceWatcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.ROOT_UPDATE) {
        scaleRenderer.render();
        rootReferHandler.render();
        referUnderContainerRenderer.updateByMatrix();
        // referLineSelection.updateReferSelection();
    }
}

function userWatcher(t: number) {
    if (t === User.RULE_STATUS_CHANGE) {
        ruleVisible.value = props.context.user.isRuleVisible;
        scaleRenderer.render();
        rootReferHandler.render();
    }
}

function toolWatcher(t: number) {
    if (t === Tool.RULE_RENDER) {
        scaleRenderer.render();
    } else if (t === Tool.RULE_RENDER_SIM) {
        scaleRenderer.render(true);
    }
}

function selectionWatcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        scaleRenderer.render();
    }
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
    referLineHandler = new ReferLineHandler(props.context, e, GuideAxis.Y);
    document.addEventListener('mousemove', moveHor);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveHor;
}

function moveHor(e: MouseEvent) {
    if (isDrag) {
        referLineHandler?.modifyOffset(e);
    } else {
        const y = props.context.workspace.getContentXY(e).y;
        if (y >= 20) {
            isDrag = true;
            referLineHandler?.createApiCaller();
            referLineHandler?.create(e);
        }
    }
}

function downVer(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    e.stopPropagation();

    referLineHandler = new ReferLineHandler(props.context, e, GuideAxis.X);

    document.addEventListener('mousemove', moveVer);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveVer;
}

function moveVer(e: MouseEvent) {
    if (isDrag) {
        referLineHandler?.modifyOffset(e);
    } else {
        const x = props.context.workspace.getContentXY(e).x;
        if (x >= 20) {
            isDrag = true;
            referLineHandler?.createApiCaller();
            referLineHandler?.create(e);
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

function downHover(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    props.context.selection.resetSelectShapes();
    e.stopPropagation();

    // 选择一条参考线
    // if (hovered.value.valid) {
    //     selected.value.valid = true;
    //     selected.value.visible = true;
    //
    //     selected.value.index = hovered.value.index;
    //     selected.value.env = hovered.value.env;
    //     selected.value.path = hovered.value.path;
    //     selected.value.start = hovered.value.start;
    //     selected.value.end = hovered.value.end;
    //
    //     selected.value.axis = hovered.value.axis;
    //     selected.value.offset = hovered.value.offset;
    //     selected.value.transform = hovered.value.transform;
    // }
}

function upCommon() {
    clear();
}

function blur() {
    clear();
}

onMounted(() => {
    props.context.tool.watch(toolWatcher);
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
    props.context.user.watch(userWatcher);
    props.page.watch(pageWatcher);
    props.context.tool.setReferFiner(referLineSelection.search.bind(referLineSelection));

    referUnderContainerRenderer.updateUnderRootContainerMap();
})
onUnmounted(() => {
    props.context.tool.unwatch(toolWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    props.context.user.unwatch(userWatcher);
    props.page.unwatch(pageWatcher);

    referUnderContainerRenderer.clearContainerWatcher();
})
</script>
<template>
    <div v-if="ruleVisible" class="rule-container">
        <svg width="100" height="100" viewBox="0 0 100 100">
            <g v-for="(unit, key) in lineUnits" :key="key">
                <path v-for="(line, k) in unit.lines" :d="line.path" :key="k" stroke="#ff4400" stroke-width="0.5"/>
            </g>
            <path v-for="(line, i) in rootLines.lines" :d="line.path" :key="i" stroke="#ff4400" stroke-width="0.5"/>
            <g v-if="hovered.valid" :class="hovered.axis === GuideAxis.X ? 'x-line' :'y-line'" @mousedown="downHover">
                <text class="offset-desc" :style="{transform: hovered.transform }">{{ hovered.desc }}</text>
                <path
                    v-for="(p, i) in hovered.path"
                    :key="i"
                    :d="p.data"
                    :stroke="hovered.theme"
                    :stroke-dasharray="p.dash ? '3, 3' : 'none'"
                />
                <path v-for="(p, i) in hovered.path" :d="p.data" :key="i" stroke="transparent" stroke-width="14"/>
            </g>
            <g v-if="selected.valid" :class="selected.axis === GuideAxis.X ? 'x-line' :'y-line'" @mousedown="downHover">
                <text class="offset-desc" :style="{transform: selected.transform }">{{ selected.offset }}</text>
                <path
                    v-for="(p, i) in selected.path"
                    :key="i"
                    :d="p.data"
                    :stroke="selected.theme"
                    :stroke-dasharray="p.dash ? '3, 3' : 'none'"
                />
                <path v-for="(p, i) in selected.path" :d="p.data" :key="i" stroke="transparent" stroke-width="14"/>
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


        .y-line {
            pointer-events: auto;
            cursor: row-resize !important;

            .offset-desc {
                fill: #ff4400;
                font-size: 10px;
            }
        }

        .x-line {
            pointer-events: auto;
            cursor: col-resize !important;

            .offset-desc {
                fill: #ff4400;
                font-size: 10px;
            }
        }
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