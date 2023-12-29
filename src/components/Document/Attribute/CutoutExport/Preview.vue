<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import comsMap from '@/components/Document/Content/comsmap';
import { ExportFileFormat, ExportFormat, Shape, ShapeType, ShapeView, adapt2Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { getCutoutShape, getGroupChildBounds, getPageBounds, getShadowMax, getShapeBorderMax, parentIsArtboard } from '@/utils/cutout';
import { color2string } from '@/utils/content';
import { Selection } from '@/context/selection';
import { debounce } from 'lodash';
import { getPngImageData, getSvgImageData } from '@/utils/image';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {
    context: Context
    shapes: ShapeView[]
    unfold: boolean
    canvas_bg: boolean
    trim_bg: boolean
}
interface SvgFormat {
    id: string
    width: number
    height: number
    x: number
    y: number
    background: string
    shapes: Shape[]
}
const emits = defineEmits<{
    (e: 'previewChange', v: boolean): void;
}>();
const DEFAULT_COLOR = () => {
    const f = props.context.selection.selectedPage!.data.style.fills[0];
    if (f) {
        return color2string(f.color);
    } else {
        return 'rgba(239,239,239,1)';
    }
}
const props = defineProps<Props>();
const reflush = ref(0);
const isTriangle = ref(props.unfold);
const width = ref<number>(0);
const height = ref<number>(0);
const xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const background_color = ref<string>(DEFAULT_COLOR());
let renderItems: Shape[] = reactive([]);
const selectedShapes: Map<string, ShapeView> = new Map();
const previewSvg = ref<SVGSVGElement>();
const pngImage = ref();
const renderSvgs = ref<SvgFormat[]>([]);
const ImageUrls: Map<string, string> = new Map();
const toggleExpand = () => {
    isTriangle.value = !isTriangle.value;
    emits('previewChange', isTriangle.value);
    _getCanvasShape();
}
const _getCanvasShape = () => {
    const shapes = props.context.selection.selectedShapes;
    const shape = shapes[0];
    if (shapes.length === 1 && shape.type !== ShapeType.Cutout) {
        if (props.context.workspace.isTranslating) return;
    }
    resetSvg();
    if (shapes.length === 1 && shape.type === ShapeType.Cutout) {
        const item = parentIsArtboard(shape);
        getPosition(shape);
        if (shape.isVisible() && item) {
            renderItems = Array(adapt2Shape(item));
        } else {
            selectedShapes.clear();
            getCutoutShape(shape, props.context.selection.selectedPage!, selectedShapes);
            if (shape.isVisible()) renderItems = Array.from(selectedShapes.values()).map(s => adapt2Shape(s));
        }
    } else if (shapes.length === 1) {
        getPosition(shape);
        renderItems = [shape].map(s => adapt2Shape(s));
    } else if (shapes.length === 0) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const { x, y, width:_w, height: _h } = getPageBounds(page);
            width.value = _w;
            height.value = _h;
            xy.value.x = x;
            xy.value.y = y;
            renderItems = page.childs.map(s => adapt2Shape(s));
        }
    }
    setTimeout(() => {
        if (previewSvg.value) {
            let format: ExportFormat;
            let id = '';
            let shape: ShapeView;
            if (shapes.length === 1) {
                shape = shapes[0];
                format = shape.data.exportOptions!.exportFormats[0];
                id = shape.id + format.id;
            } else {
                const page = props.context.selection.selectedPage;
                if (!page || page.data.exportOptions!.exportFormats.length === 0) return;
                shape = page;
                format = page && page.data.exportOptions!.exportFormats[0];
                id = page.id + format.id;
            }
            const { width, height } = previewSvg.value.viewBox.baseVal
            previewSvg.value.setAttribute("width", `${width * format.scale}`);
            previewSvg.value.setAttribute("height", `${height * format.scale}`);
            if (format.fileFormat === ExportFileFormat.Png || format.fileFormat === ExportFileFormat.Jpg) {
                getPngImageData(previewSvg.value, props.trim_bg, id, format, ImageUrls, shape);
            } else if (format.fileFormat === ExportFileFormat.Svg) {
                getSvgImageData(previewSvg.value, props.trim_bg, id, format, ImageUrls, shape);
            }
            setTimeout(() => {
                pngImage.value = ImageUrls.get(id);
                reflush.value++;
            }, 100)
        }
    }, 10);
}



const getCanvasShape = debounce(_getCanvasShape, 250, { leading: true });

const getPosition = (shape: ShapeView) => {
    const p = shape.boundingBox()
    const p_artboard = parentIsArtboard(shape);
    if (p_artboard && shape.type === ShapeType.Cutout) {
        const frame = shape.frame2Root();
        const page = props.context.selection.selectedPage!;
        xy.value.x = frame.x - page.frame.x;
        xy.value.y = frame.y - page.frame.y;
        width.value = shape.frame.width;
        height.value = shape.frame.height;
    } else if (shape.type === ShapeType.Cutout) {
        width.value = p.width;
        height.value = p.height;
        xy.value.x = p.x;
        xy.value.y = p.y;
    }
    if (shape.type !== ShapeType.Cutout) {
        if (shape.type === ShapeType.Group) {
            const { left, top, right, bottom } = getShadowMax(shape);
            const max_border = getShapeBorderMax(shape);
            const { x, y, width: _w, height: _h } = getGroupChildBounds(shape);
            xy.value.x = shape.frame.x + x - (left + max_border);
            xy.value.y = shape.frame.y + y - (top + max_border);
            width.value = _w + (left + max_border) + (right + max_border);
            height.value = _h + (top + max_border) + (bottom + max_border);
        } else {
            const { left, top, right, bottom } = getShadowMax(shape);
            const max_border = getShapeBorderMax(shape);
            console.log(max_border);
            
            xy.value.x = (shape.frame.x - left - max_border);
            xy.value.y = (shape.frame.y - top - max_border);
            width.value = (shape.frame.width + (left + max_border) + (right + max_border));
            height.value = (shape.frame.height + (top + max_border) + (bottom + max_border));
        }
    }
}

const resetSvg = () => {
    renderItems = [];
    width.value = 0;
    height.value = 0;
    xy.value.x = 0;
    xy.value.y = 0;
    reflush.value++;
}
function page_color() {
    background_color.value = DEFAULT_COLOR();
    const selected = props.context.selection.selectedShapes;
    if (!selected.length) {
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
const select_watcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        const shapes = props.context.selection.selectedShapes;
        const page = props.context.selection.selectedPage;
        if (page && page.data.exportOptions && shapes.length === 0) {
            isTriangle.value = page.data.exportOptions.unfold;
        } else if (shapes.length === 1 && shapes[0].data.exportOptions) {
            isTriangle.value = shapes[0].data.exportOptions.unfold;
        }
        page_color();
        _getCanvasShape();
        if (shapes.length === 1) {
            shape.value = shapes[0];
        } else if (shapes.length === 0) {
            shape.value = undefined;
        }
    }
    if (t === Selection.CHANGE_PAGE) {
        _getCanvasShape();
    }
}

const getShapesSvg = (shapes: ShapeView[]) => {
    if (shapes.length > 0) {
        let renderItems: SvgFormat[] = [];
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            let shapeItem: ShapeView[] = [];
            let bgc = 'transparent';
            if (shape.type === ShapeType.Cutout) {
                const item = parentIsArtboard(shape);
                if (shape.isVisible() && item) {
                    shapeItem = Array(item);
                } else {
                    selectedShapes.clear();
                    getCutoutShape(shape, props.context.selection.selectedPage!, selectedShapes);
                    shapeItem = Array.from(selectedShapes.values());
                }
                shape.data.exportOptions?.canvasBackground ? bgc = DEFAULT_COLOR() : bgc = 'transparent';
            } else {
                shapeItem = [shape];
            }
            getPosition(shape);
            renderItems.push(
                {
                    id: shape.id + i,
                    width: width.value,
                    height: height.value,
                    x: xy.value.x,
                    y: xy.value.y,
                    background: bgc,
                    shapes: shapeItem.map(s => adapt2Shape(s))
                }
            )
        }
        renderSvgs.value = renderItems;
    } else if (shapes.length === 0) {
        let renderItems: SvgFormat[] = [];
        const page = props.context.selection.selectedPage;
        if (!page) return;
        const { x, y, width: _w, height: _h } = getPageBounds(page);
        renderItems.push(
            {
                id: page.id + 0,
                width: _w,
                height: _h,
                x: x,
                y: y,
                background: 'transparent',
                shapes: page.childs.map(s => adapt2Shape(s))
            }
        )
        renderSvgs.value = renderItems;
    }
}

defineExpose({ getShapesSvg, renderSvgs })
const img = ref();
const startDrag = (e: DragEvent) => {
    if (img.value) {
        e.dataTransfer!.setDragImage(img.value, img.value.clientWidth / 2, img.value.clientHeight / 2);
    }
}

watch(() => props.canvas_bg, (v) => {
    page_color();
})
watch(() => shape.value, (v, o) => {
    o && o.unwatch(getCanvasShape);
    v && v.watch(getCanvasShape);
}, { immediate: true })

onMounted(() => {
    page_color();
    _getCanvasShape();
    props.context.selection.watch(select_watcher);
})
onUnmounted(() => {
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
        <svg version="1.1" ref="previewSvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :width="width" :height="height"
            :viewBox="`${xy.x} ${xy.y} ${width} ${height}`" :style="{ 'background-color': background_color }">
            <component :is="comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle)" v-for=" c  in  renderItems "
                :key="c.id" :data="c" />
        </svg>
        <div class="preview-canvas" v-if="isTriangle && !props.trim_bg" :reflush="reflush !== 0 ? reflush : undefined">
            <div class="preview-image" v-if="pngImage">
                <img :src="pngImage" ref="img" alt="" :draggable="true" @dragstart="startDrag">
            </div>
        </div>
        <div class="trim-canvas" v-if="isTriangle && props.trim_bg && pngImage"
            :reflush="reflush !== 0 ? reflush : undefined">
            <img :src="pngImage" ref="img" alt="" :draggable="true" @dragstart="startDrag">
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

    >svg {
        position: fixed;
        left: 100000px;
        top: 100000px;
        opacity: 0;
        z-index: -2023;
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
                max-width: 100%;
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
            max-width: 100%;
            max-height: 240px;
            margin: auto;
            display: block;
            object-fit: contain;
        }
    }
}

.exportsvg {
    position: absolute;
    opacity: 0;
    z-index: -1;
}
</style>