/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Action, Tool } from "@/context/tool";
import { useI18n } from "vue-i18n";
import { string_by_sys } from "@/utils/common";
import { Context } from "@/context";
import { XY } from "@/context/selection";
import SvgIcon from "@/components/common/SvgIcon.vue";
import {
    useArrow,
    useEllipse,
    useLine, usePen,
    usePolygon,
    useRect,
    useStar
} from "@/components/Document/Creator/execute";
import { ImageLoader } from "@/imageLoader";

const { t } = useI18n();

const props = defineProps<{
    context: Context,
    params: any
}>();

const currentTool = ref<string>(Action.AddRect);
const popover = ref<boolean>(false);
const tipsVisible = ref<boolean>(false);
const selected = ref<boolean>(false);
const popoverXY = ref<XY>({ x: 0, y: 0 });
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml';
const picker = ref<HTMLInputElement>();

// 当前工具Icon
const pattern = computed<string>(() => {
    switch (currentTool.value) {
        case Action.AddRect:
            return pattern_rectangle_icon;
        case Action.AddEllipse:
            return pattern_oval_icon;
        case Action.AddLine:
            return pattern_line_icon;
        case Action.AddArrow:
            return pattern_arrow_icon;
        case Action.Pen:
            return pattern_pen_icon;
        case Action.Polygon:
            return pattern_polygon_icon;
        case Action.Star:
            return pattern_star_icon;
        case Action.AddImage:
            return picture_icon;
        default:
            return pattern_rectangle_icon;
    }
});

// 当前工具Tips
const tips = computed<string>(() => {
    const defaultRect = `${t('shape.rect')}\u00a0\u00a0\u00a0\u00a0R`;
    switch (currentTool.value) {
        case Action.AddRect:
            return defaultRect;
        case Action.AddEllipse:
            return `${t('shape.oval')}\u00a0\u00a0\u00a0\u00a0O`;
        case Action.AddLine:
            return `${t('shape.line')}\u00a0\u00a0\u00a0\u00a0L`;
        case Action.AddArrow:
            return string_by_sys(`${t('shape.arrow')}\u00a0\u00a0\u00a0\u00a0L`);
        case Action.Pen:
            return `${t('shape.pen')}\u00a0\u00a0\u00a0\u00a0P`;
        case Action.Polygon:
            return `${t('shape.polygon')}`;
        case Action.Star:
            return `${t('shape.star')}`;
        case Action.AddImage:
            return string_by_sys(`${t('home.picture')} &nbsp;&nbsp; Shift Ctrl K`);
        default:
            return defaultRect;
    }
});

let timer: any = null;

function enter() {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        tipsVisible.value = true;
        clearTimeout(timer);
        timer = null;
    }, 600);
}

function leave() {
    clearTimeout(timer);
    tipsVisible.value = false;
}

function toolWatcher(t: number) {
    if (t === Tool.CHANGE_ACTION) {
        const action = props.context.tool.action;
        selected.value = action === Action.AddRect
            || action === Action.AddEllipse
            || action === Action.AddLine
            || action === Action.AddArrow
            || action === Action.Pen
            || action === Action.Polygon
            || action === Action.Star;

        if (selected.value) {
            currentTool.value = action;
        }
    }
}

function shot() {
    switch (currentTool.value) {
        case Action.AddRect:
            return useRect(props.context);
        case Action.AddEllipse:
            return useEllipse(props.context);
        case Action.AddLine:
            return useLine(props.context);
        case Action.AddArrow:
            return useArrow(props.context);
        case Action.Pen:
            return usePen(props.context);
        case Action.Polygon:
            return usePolygon(props.context);
        case Action.Star:
            return useStar(props.context);
        default:
            return useRect(props.context);
    }
}

function showMenu(e: MouseEvent) {
    props.context.menu.menuMount()
    const el = (e.target as Element)!.closest('.path-button') as HTMLDivElement;
    if (!el) return;
    if (popover.value) {
        popover.value = false;
        return;
    }

    popover.value = true;
    tipsVisible.value = false;

    popoverXY.value.x = el.offsetLeft;
    popoverXY.value.y = 45;
}

function blur(e: MouseEvent) {
    if (!(e.target as Element).closest('.popover-shape-tool, .tool-pathshape-menu-trigger')) popover.value = false;
}

async function select() {
    const filepicker = document.getElementById('filepicker');
    if (filepicker) filepicker.click();
}

function change(e: Event) {
    if (!e.target) return;
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    const loader = new ImageLoader(props.context);
    loader.insertImageByPackages(files, true);
    if (picker.value) (picker.value as HTMLInputElement).value = '';
}

const stop = watch(() => popover.value, (v) => {
    if (v) {
        props.context.escstack.save('pathshape-menu', () => {
            const achieve = popover.value;
            popover.value = false;
            return achieve;
        });
        document.addEventListener('click', blur);
    } else {
        document.removeEventListener('click', blur);
    }
})

onMounted(() => {
    props.context.tool.watch(toolWatcher);
});
onUnmounted(() => {
    props.context.tool.unwatch(toolWatcher);
    stop();
    document.removeEventListener('click', blur);
})

import white_down_icon from "@/assets/icons/svg/white-down.svg";
import white_select_icon from "@/assets/icons/svg/white-select.svg";
import pattern_rectangle_icon from "@/assets/icons/svg/pattern-rectangle.svg";
import pattern_oval_icon from "@/assets/icons/svg/pattern-oval.svg";
import pattern_line_icon from "@/assets/icons/svg/pattern-line.svg";
import pattern_arrow_icon from "@/assets/icons/svg/pattern-arrow.svg";
import pattern_pen_icon from "@/assets/icons/svg/pattern-pen.svg";
import pattern_polygon_icon from "@/assets/icons/svg/pattern-polygon.svg";
import pattern_star_icon from "@/assets/icons/svg/pattern-star.svg";
import picture_icon from "@/assets/icons/svg/picture.svg";

</script>

<template>
    <el-tooltip effect="dark" :content="tips" :show-after="600" :offset="10" :visible="!popover && tipsVisible">
        <div :class="{ 'path-button': true, 'path-button-selected': selected, active: popover }" @mouseenter.stop="enter"
             @mouseleave.stop="leave">
            <div class="svg-container" @click="shot">
                <SvgIcon :icon="pattern"/>
            </div>
            <div class="tool-pathshape-menu-trigger" @click="showMenu">
                <SvgIcon :icon="white_down_icon"/>
            </div>
        </div>
    </el-tooltip>
    <div v-if="popover" class="popover-shape-tool" :style="{ left: popoverXY.x + 'px', top: popoverXY.y + 'px' }">
        <!--矩形-->
      <div class="item" @click="() => { useRect(context);popover = false }">
            <div v-if="currentTool === Action.AddRect" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="pattern_rectangle_icon"/>
                <span>{{ t('shape.rect') }}</span>
            </div>
            <div class="shortKey">R</div>
        </div>
        <!--圆形-->
      <div class="item" @click="() => { useEllipse(context);popover = false  }">
            <div v-if="currentTool === Action.AddEllipse" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="pattern_oval_icon"/>
                <span>{{ t('shape.oval') }}</span>
            </div>
            <div class="shortKey">O</div>
        </div>
        <!--线条-->
      <div class="item" @click="() => { useLine(context);popover = false  }">
            <div v-if="currentTool === Action.AddLine" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="pattern_line_icon"/>
                <span>{{ t('shape.line') }}</span>
            </div>
            <div class="shortKey">L</div>
        </div>
        <!--箭头-->
      <div class="item" @click="() => { useArrow(context);popover = false  }">
            <div v-if="currentTool === Action.AddArrow" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="pattern_arrow_icon"/>
                <span>{{ t('shape.arrow') }}</span>
            </div>
            <div class="shortKey">{{ string_by_sys('Shift L') }}</div>
        </div>
      <div class="item" @click="() => { usePolygon(context);popover = false  }">
            <div v-if="currentTool === Action.Polygon" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="pattern_polygon_icon"/>
                <span>{{ t('shape.polygon') }}</span>
            </div>
            <div class="shortKey"></div>
        </div>
        <!--星形-->
      <div class="item" @click="() => { useStar(context);popover = false  }">
            <div v-if="currentTool === Action.Star" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="pattern_star_icon"/>
                <span>{{ t('shape.star') }}</span>
            </div>
            <div class="shortKey"></div>
        </div>
        <!-- 图片 -->
      <div class="item" @click="() => {select();popover = false }">
            <div v-if="currentTool === Action.AddImage" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="picture_icon"/>
                <span>{{ t('home.picture') }}</span>
            </div>
            <div class="shortKey">{{ string_by_sys('Shift Ctrl K') }}</div>
            <input type="file" ref="picker" :accept="accept" :multiple="true" id="filepicker"
                @change="(e: Event) => { change(e) }" />
        </div>
        <div class="line" />
        <!--钢笔-->
      <div class="item" @click="() => { usePen(context);popover = false  }">
            <div v-if="currentTool === Action.Pen" class="check">
                <SvgIcon :icon="white_select_icon"/>
            </div>
            <div class="desc">
                <SvgIcon :icon="pattern_pen_icon"/>
                <span>{{ t('shape.pen') }}</span>
            </div>
            <div class="shortKey">P</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.active {
    background-color: rgba(255, 255, 255, 0.1);
}

.path-button {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    color: #ffffff;
    border-radius: 4px;
    cursor: pointer;
    width: 48px;
    height: 32px;

    .svg-container {
        display: flex;
        align-items: center;
        flex: 10;
        flex-direction: row-reverse;
        height: 100%;

        >img {
            width: 18px;
            height: 18px;
        }
    }

    .tool-pathshape-menu-trigger {
        flex: 9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;

        >img {
            width: 12px;
            height: 12px;
            transition: 0.2s;
        }
    }

    .tool-pathshape-menu-trigger:hover {
        >img {
            transform: translateY(2px);
        }
    }
}

.path-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.path-button-selected {
    background-color: var(--active-color) !important;
}


.popover-shape-tool {
    width: 158px;

    position: absolute;
    padding: 6px 0;
    box-sizing: border-box;

    background-color: var(--theme-color);
    color: var(--theme-color-anti);

    border-radius: 4px;

    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);

    .item {
        width: 100%;
        height: 32px;

        position: relative;
        box-sizing: border-box;
        padding: 8px 12px 8px 32px;

        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--font-default-fontsize);

        .check {
            position: absolute;
            left: 8px;

            display: flex;
            align-items: center;

            >img {
                width: 12px;
                height: 12px;
            }
        }

        .desc {
            display: flex;
            align-items: center;
            justify-content: space-between;

            >img {
                width: 14px;
                height: 14px;
            }

            >span {
                margin-left: 8px;
            }
        }
    }

    .item:hover {
        background-color: var(--active-color);
    }
}

.line {
    width: 100%;
    height: 4px;
    border-bottom: 1px solid #434343;
    box-sizing: border-box;
}

#filepicker {
    display: none;
}
</style>