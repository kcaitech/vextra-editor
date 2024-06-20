<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";
import { ArtboradView, GuideAxis, PageView } from '@kcdesign/data';
import { Block, Tool } from "@/context/tool";
import { Selection } from "@/context/selection";
import { formatNumber, ReferLineHandler, ReferUnit } from "@/components/Document/Rule/refer";
import { ReferUnderContainerRenderer } from "@/components/Document/Rule/referUnderContainerRenderer";
import { Scale, ScaleRenderer } from "@/components/Document/Rule/scaleRenderer";
import { RootReferHandler } from "@/components/Document/Rule/rootReferHandler";
import { ActiveGuide, LineTheme, ReferLineSelection } from "@/components/Document/Rule/referLineSelection";
import { v4 } from "uuid";
import { cloneDeep } from "lodash";

const props = defineProps<{
    context: Context;
    page: PageView;
}>();

const ruleVisible = ref<boolean>(false);

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
    id: v4(),
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
    id: v4(),
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
    // console.log('...args:', ...args);
    if (args.length === 1 && args[0] === 'childs') {
        referUnderContainerRenderer.updateUnderRootContainerMap();
        return;
    }
    if (args && args.includes('guides')) {
        rootReferHandler.render();

        if (args.includes('length', -1)) {
            props.context.tool.referSelection.updateSelectionForDelete(props.page.id);
        } else if (args.includes('offset', -1)) {
            props.context.tool.referSelection.updateSelectedSelection(props.page.id);
        }
    }
}

function workspaceWatcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.ROOT_UPDATE) {
        scaleRenderer.render();
        rootReferHandler.render();
        referUnderContainerRenderer.updateByMatrix();
        props.context.tool.referSelection.updateSelectedSelection(selected.value.env.id);
        referLineSelection.resetHovered();
    }
}

function userWatcher(t: number) {
    if (t === User.RULE_STATUS_CHANGE) {
        ruleVisible.value = props.context.user.isRuleVisible;
        scaleRenderer.render();
        rootReferHandler.render();

        if (ruleVisible.value) {
            props.page.watch(pageWatcher);
            referUnderContainerRenderer.updateUnderRootContainerMap();
        } else {
            props.page.unwatch(pageWatcher);
            referUnderContainerRenderer.clearContainerWatcher();
        }
    }
}

function toolWatcher(t: number) {
    if (t === Tool.RULE_RENDER) {
        scaleRenderer.render();
    } else if (t === Tool.RULE_RENDER_SIM) {
        scaleRenderer.render(true);
    }
}

function selectionWatcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        scaleRenderer.render();
        referLineSelection.updateByShapesSelected();
    } else if (t === Selection.CHANGE_PAGE) {
        const page = props.context.selection.selectedPage!;

        rootReferHandler.updatePage(page)
        referUnderContainerRenderer.pageChange(page);

        referLineSelection.resetSelected();
        referLineSelection.resetHovered();
        selected.value.env = page;
        hovered.value.env = page;
        rootLines.value.shape = page;
        rootLines.value.id = page.id;

        scaleRenderer.render();
        referUnderContainerRenderer.clearContainerWatcher();
        referUnderContainerRenderer.updateUnderRootContainerMap();
    }
}

/**
 * @description 参考线的创建与编辑
 */
let move: any;
let referLineHandler: ReferLineHandler | undefined;
let isDrag = false;
let downXY = { x: 0, y: 0 };

function moveStop(event: MouseEvent) {
    if (event.button !== 0) {
        event.stopPropagation();
    }
}

function downHor(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }
    downXY = event;
    event.stopPropagation();
    referLineHandler = new ReferLineHandler(props.context, GuideAxis.Y);
    document.addEventListener('mousemove', moveHor);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveHor;
}

function moveHor(event: MouseEvent) {
    if (isDrag) {
        referLineHandler?.modifyOffset(event);
        referLineSelection.updateHoveredSelection(hovered.value.env.id);
    } else {
        const y = props.context.workspace.getContentXY(event).y;
        const enoughDelta = Math.hypot(event.x - downXY.x, event.x - downXY.y) > 5;
        if (y >= 20 && enoughDelta) {
            isDrag = true;
            referLineHandler?.createApiCaller(event);
            // hovered.value.valid = true;
        }
    }
}

function downVer(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }
    downXY = event;
    event.stopPropagation();
    referLineHandler = new ReferLineHandler(props.context, GuideAxis.X);
    document.addEventListener('mousemove', moveVer);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = moveVer;
}

function moveVer(event: MouseEvent) {
    if (isDrag) {
        referLineHandler?.modifyOffset(event);
        referLineSelection.updateHoveredSelection(hovered.value.env.id);
    } else {
        const x = props.context.workspace.getContentXY(event).x;
        const enoughDelta = Math.hypot(event.x - downXY.x, event.x - downXY.y) > 5;

        if (x >= 20 && enoughDelta) {
            isDrag = true;
            referLineHandler?.createApiCaller(event);
        }
    }
}

function clear() {
    if (!isDrag && hovered.value.valid) {
        // 单点选择参考线
        selected.value.id = hovered.value.id;

        selected.value.valid = true;
        selected.value.visible = true;

        selected.value.index = hovered.value.index;
        selected.value.env = hovered.value.env;

        selected.value.path = cloneDeep(hovered.value.path);
        selected.value.start = { ...hovered.value.start };
        selected.value.end = { ...hovered.value.end };

        selected.value.axis = hovered.value.axis;
        selected.value.offset = hovered.value.offset;
        selected.value.transform = hovered.value.transform;
        selected.value.desc = hovered.value.desc;
        // 清除图层选区
        props.context.selection.resetSelectShapes();
    }

    isDrag = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', upCommon);
    window.removeEventListener("blur", blur);
    referLineHandler?.fulfil();
    referLineHandler = undefined;
}

function downHover(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    if (!hovered.value.valid) {
        return;
    }

    event.stopPropagation();

    downXY = event;

    const { axis, env, index } = hovered.value;

    referLineHandler = new ReferLineHandler(props.context, axis, env as ArtboradView, index);

    document.addEventListener('mousemove', modifyOffset);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = modifyOffset;
}

function downSelect(event: MouseEvent) {
    if (event.button !== 0) {
        return;
    }

    if (!selected.value.valid) {
        return;
    }

    event.stopPropagation();

    downXY = event;

    const { axis, env, index } = selected.value;

    referLineHandler = new ReferLineHandler(props.context, axis, env as ArtboradView, index);

    hovered.value.valid = false;

    document.addEventListener('mousemove', modifyOffset);
    document.addEventListener('mouseup', upCommon);
    window.addEventListener("blur", blur);

    move = modifyOffset;
}

function modifyOffset(event: MouseEvent) {
    if (!referLineHandler) {
        return;
    }

    if (isDrag) {
        if (!selected.value.valid) {
            hovered.value.valid = true;
        }
        referLineHandler.modifyOffset(event);
        referLineSelection.updateHoveredSelection(hovered.value.env.id);
    } else {
        let offset;
        if (referLineHandler.m_axis === GuideAxis.X) {
            offset = props.context.workspace.getContentXY(event).x
        } else {
            offset = props.context.workspace.getContentXY(event).y
        }

        const enoughDelta = Math.hypot(event.x - downXY.x, event.x - downXY.y) > 5;

        if (offset >= 20 && enoughDelta) {
            referLineHandler.createApiCaller(event, referLineHandler.m_index);
            isDrag = true;
        }
    }
}

function upCommon() {
    clear();
}

function blur() {
    clear();
}

let holder: any = undefined;
let keyboardWorking = false;

function keydown(event: KeyboardEvent) {
    if (
        !props.context.user.isRuleVisible ||
        !selected.value.valid ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        isDrag
    ) {
        return;
    }

    const code = event.code;

    let step = 1;

    if (event.shiftKey) {
        step *= 10;
    }

    if (code === 'ArrowRight') {
        if (selected.value.axis === GuideAxis.X) {
            modifyOffsetByKeyboard(step);
        }
    } else if (code === 'ArrowLeft') {
        if (selected.value.axis === GuideAxis.X) {
            modifyOffsetByKeyboard(-step);
        }
    } else if (code === 'ArrowUp') {
        if (selected.value.axis === GuideAxis.Y) {
            modifyOffsetByKeyboard(-step);
        }
    } else if (code === 'ArrowDown') {
        if (selected.value.axis === GuideAxis.Y) {
            modifyOffsetByKeyboard(step);
        }
    }
}

function modifyOffsetByKeyboard(del: number) {
    keyboardWorking = true;

    const { env, index, axis } = selected.value;

    if (!referLineHandler) {
        referLineHandler = new ReferLineHandler(props.context, axis, env as ArtboradView, index);
    }

    referLineHandler.modifyOffsetByKeyboard(del);

    updateHolder();
}

function updateHolder() {
    clearTimeout(holder);

    holder = setTimeout(() => {
        if (!keyboardWorking) {
            return;
        }
        keyboardWorking = false;
        referLineHandler?.fulfil();
        referLineHandler = undefined;
        clearTimeout(holder);
        holder = null;
    }, 500);
}

watch(() => props.page, (n, o) => {
    o.unwatch(pageWatcher);
    n.watch(pageWatcher);
})

onMounted(() => {
    props.context.tool.watch(toolWatcher);
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
    props.context.user.watch(userWatcher);
    props.page.watch(pageWatcher);
    props.context.tool.setReferFiner(referLineSelection.search.bind(referLineSelection));
    props.context.tool.setReferSelection(referLineSelection);

    referUnderContainerRenderer.updateUnderRootContainerMap();

    document.addEventListener('keydown', keydown);
    ruleVisible.value = props.context.user.isRuleVisible;
    scaleRenderer.render();
});
onUnmounted(() => {
    props.context.tool.unwatch(toolWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    props.context.user.unwatch(userWatcher);
    props.page.unwatch(pageWatcher);
    referLineSelection.removeScout();
    referUnderContainerRenderer.clearContainerWatcher();
    document.removeEventListener('keydown', keydown);
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
            <g v-if="selected.valid" :class="selected.axis === GuideAxis.X ? 'x-line' :'y-line'"
               @mousedown="downSelect">
                <text v-if="selected.path.length" class="offset-desc" :style="{transform: selected.transform }">
                    {{ selected.desc }}
                </text>
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
    font-weight: 500;

    overflow: hidden;

    > svg {
        pointer-events: none;
        position: absolute;
        z-index: 2;
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
        z-index: 1;

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
            justify-content: flex-end;
            gap: 1px;

            .dot {
                width: 1px;
                height: 2px;
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
                bottom: 3px;
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
        z-index: 1;

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
            justify-content: flex-end;
            gap: 1px;

            writing-mode: vertical-lr;

            .scale-number {
                transform: rotate(180deg);
            }

            .dot {
                width: 2px;
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
                bottom: 3px;
                right: 3px;

                writing-mode: vertical-lr;
            }

            .start-data {
                top: 0;
                transform: translateY(-100%) rotate(180deg);
            }

            .end-data {
                bottom: 0;
                transform: translateY(108%) rotate(180deg);
            }
        }
    }
}
</style>