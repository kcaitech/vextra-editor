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
import { ref, reactive, onMounted, onUnmounted, watch, toRaw, nextTick } from 'vue';
import {
    ExportFormat,
    ShapeType,
    ShapeView
} from '@kcaitech/vextra-core';
import { Context } from '@/context';
import {
    getCutoutShape,
    getPageBounds,
    parentIsArtboard
} from '@/utils/cutout';
import { color2string } from '@/utils/content';
import { Selection } from '@/context/selection';
import { debounce } from 'lodash';
import { getPosition, getSvgImageData } from '@/utils/image';
import { useI18n } from 'vue-i18n';
import { ShapeDom } from '../../Content/vdom/shape';

const { t } = useI18n();

interface Props {
    context: Context
    shapes: ShapeView[]
    unfold: boolean
    canvas_bg: boolean
    trim_bg: boolean
    trigger: any[]
}

const emits = defineEmits<{
    (e: 'previewChange', v: boolean): void;
}>();
const DEFAULT_COLOR = () => {
    const backgroundColor = props.context.selection.selectedPage?.backgroundColor;
    if (backgroundColor) {
        return color2string(backgroundColor);
    } else {
        return 'rgba(239,239,239,1)';
    }
}
const props = defineProps<Props>();
const reflush = ref(0);
const isTriangle = ref(props.unfold);
const svg_width = ref<number>(0);
const svg_height = ref<number>(0);
const xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const background_color = ref<string>(DEFAULT_COLOR());
let renderItems: ShapeView[] = reactive([]);
const selectedShapes: Map<string, ShapeView> = new Map();
const pngImage = ref();
const svgImageUrls: Map<string, string> = new Map();
const pageSvg = ref<SVGSVGElement>();

const toggleExpand = () => {
    isTriangle.value = !isTriangle.value;
    emits('previewChange', isTriangle.value);
    getCanvasShape();
}
const _getCanvasShape = () => {
    if (!isTriangle.value) return;
    const shapes = props.context.selection.selectedShapes;
    const shape = shapes[0];
    if (shapes.length === 1 && shape.type !== ShapeType.Cutout) {
        if (props.context.workspace.isTranslating) return;
    }
    resetSvg();
    if (shapes.length === 1 && shape.type === ShapeType.Cutout) {
        const item = parentIsArtboard(shape);
        const { x, y, width, height } = getPosition(shape);
        svg_width.value = width;
        svg_height.value = height;
        xy.value.x = x;
        xy.value.y = y;
        if (shape.isVisible && item) {
            renderItems = toRaw(Array(item).filter(s => s.type !== ShapeType.Cutout));
        } else {
            selectedShapes.clear();
            getCutoutShape(shape, props.context.selection.selectedPage!, selectedShapes);
            if (shape.isVisible) renderItems = toRaw(Array.from(selectedShapes.values()).filter(s => s.type !== ShapeType.Cutout));
        }
    } else if (shapes.length === 1) {
        const { x, y, width, height } = getPosition(shape);
        svg_width.value = width;
        svg_height.value = height;
        xy.value.x = x;
        xy.value.y = y;
        renderItems = toRaw([shape]);
    } else if (shapes.length === 0) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const { x, y, width: _w, height: _h } = getPageBounds(page);
            svg_width.value = _w;
            svg_height.value = _h;
            xy.value.x = x;
            xy.value.y = y;
            renderItems = toRaw(page.childs.filter(s => s.type !== ShapeType.Cutout));
        }
    }
    nextTick(() => {
        getSvgUrl();
        reflush.value++;
    })
}

const getSvgUrl = async () => {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (pageSvg.value) {
        let format: ExportFormat;
        let id = '';
        let shape: ShapeView;
        if (shapes.length > 1) return;
        if (shapes.length === 1) {
            shape = shapes[0];
            format = shape.exportOptions!.exportFormats[0];
            id = shape.id + format.id;
        } else {
            if (!page || page.exportOptions!.exportFormats.length === 0) return;
            shape = page;
            format = page && page.exportOptions!.exportFormats[0];
            id = page.id + format.id;
        }
        const { width, height } = pageSvg.value.viewBox.baseVal;
        pageSvg.value.setAttribute("width", `${width * format.scale}`);
        pageSvg.value.setAttribute("height", `${height * format.scale}`);
        await getSvgImageData(pageSvg.value, props.trim_bg, id, format, svgImageUrls, shape);
        pngImage.value = svgImageUrls.get(id);
    } else if (shapes.length > 0) {
        pngImage.value = 'cutout';
    }
}

const getCanvasShape = debounce(_getCanvasShape, 250);
const resetSvg = () => {
    renderItems = [];
    svg_width.value = 0;
    svg_height.value = 0;
    xy.value.x = 0;
    xy.value.y = 0;
    reflush.value++;
}

function page_color() {
    background_color.value = DEFAULT_COLOR();
    const selected = props.context.selection.selectedShapes;
    if (!selected.length) {
        background_color.value = 'transparent';
        return;
    }
    if (selected[0].type !== ShapeType.Cutout) {
        background_color.value = 'transparent';
        return;
    } else if (selected[0].type === ShapeType.Cutout) {
        if (!props.canvas_bg) {
            background_color.value = 'transparent';
        } else {
            background_color.value = DEFAULT_COLOR();
        }
    }
}

const shape = ref<ShapeView | undefined>(props.shapes[0]);
const select_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        const shapes = props.context.selection.selectedShapes;
        const page = props.context.selection.selectedPage;
        if (page && page.exportOptions && shapes.length === 0) {
            isTriangle.value = page.exportOptions.unfold;
        } else if (shapes.length === 1 && shapes[0].exportOptions) {
            isTriangle.value = shapes[0].exportOptions.unfold;
        }
        page_color();
        getCanvasShape();
        if (shapes.length === 1) {
            shape.value = shapes[0];
        } else if (shapes.length === 0) {
            shape.value = undefined;
        }
    }
    if (t === Selection.CHANGE_PAGE) {
        getCanvasShape();
    }
}

const img = ref();
const startDrag = (e: MouseEvent) => {
    e.target?.addEventListener("dragstart", () => drag)
}
const drag = (e: DragEvent) => {
    e.dataTransfer!.setDragImage(img.value, img.value.clientWidth / 2, img.value.clientHeight / 2);
}

watch(() => props.canvas_bg, page_color);

const stop = watch(() => props.trigger, (v) => {
    if (v.includes('layout')) {
        getCanvasShape();
    }
})

onMounted(() => {
    page_color();
    _getCanvasShape();
    props.context.selection.watch(select_watcher);
})
onUnmounted(() => {
    stop();
    props.context.selection.unwatch(select_watcher);
})

</script>

<template>
    <div class="preview_box" v-if="props.context.selection.selectedShapes.length <= 1">
        <div class="title" @click="toggleExpand">
            <div class="triangle">
                <div :class="{ 'triangle-right': !isTriangle, 'triangle-down': isTriangle }">
                </div>
            </div>
            <span>{{ t('cutoutExport.preview') }}</span>
        </div>
        <svg class="preview_svg" v-if="renderItems.length" ref="pageSvg" :width="svg_width" :height="svg_height"
            overflow="visible" :viewBox="`${xy.x} ${xy.y} ${svg_width} ${svg_height}`"
            v-html="(renderItems[0] as ShapeDom)?.el?.outerHTML || ''"
            :style="{ 'background-color': background_color }"></svg>
        <div class="preview-canvas" v-if="isTriangle && !props.trim_bg" :reflush="reflush">
            <div class="preview-image" v-if="pngImage">
                <img :src="pngImage" ref="img" alt="" :draggable="true" @mousedown="startDrag">
            </div>
        </div>
        <div class="trim-canvas" v-if="isTriangle && props.trim_bg && pngImage" :reflush="reflush">
            <img :src="pngImage" ref="img" alt="" :draggable="true" @mousedown="startDrag">
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview_box {
    position: relative;
    overflow: hidden;

    .title {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;

        >.triangle {
            width: 12px;
            min-width: 12px;
            height: 100%;
            display: flex;
            justify-content: center;
            margin-right: 5px;

            >.triangle-right {
                width: 0;
                height: 0;
                border-left: 5px solid #434343;
                border-top: 3.5px solid transparent;
                border-bottom: 3.5px solid transparent;
                position: relative;
                left: 2px;
                top: 13px;
            }

            >.triangle-down {
                width: 0;
                height: 0;
                border-top: 5px solid #434343;
                border-left: 3.5px solid transparent;
                border-right: 3.5px solid transparent;
                position: relative;
                left: 1px;
                top: 14px;
            }
        }

        span {
            color: rgba(0, 0, 0, 0.5);
        }
    }

    .preview-canvas {
        position: relative;
        width: 100%;
        height: 240px;
        background: #fafafa;
        background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0), linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0);
        background-position: 0 0, 8px 8px;
        background-size: 16px 16px;
        border-radius: 6px;
        border: 1px solid #EBEBEB;
        box-sizing: border-box;
        overflow: hidden;


        .preview-image {
            width: 100%;
            height: 100%;
            padding: 8px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;

            >img {
                object-fit: contain;
                width: 100%;
                max-height: 100%;
                margin: auto;
                display: block;
            }
        }
    }

    .trim-canvas {
        margin: 0 auto;
        width: fit-content;
        box-sizing: border-box;
        background: #fafafa;
        background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0), linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0);
        background-position: 0 0, 8px 8px;
        background-size: 16px 16px;

        >img {
            width: 100%;
            max-height: 240px;
            margin: auto;
            display: block;
            object-fit: contain;
        }
    }
}

.preview_svg {
    position: absolute;
    top: 1000000px;
    left: 1000000px;
}

.exportsvg {
    position: absolute;
    opacity: 0;
    z-index: -1;
}
</style>