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
import {
    BasicArray,
    ExportFileFormat,
    ExportFormat,
    ExportFormatNameingScheme,
    ExportOptions,
    ExportVisibleScaleType,
    ShapeType,
    ShapeView
} from '@kcaitech/vextra-core';
import { ref, onMounted, onUnmounted, reactive, nextTick, watch, toRaw } from 'vue';
import { Context } from '@/context';
import PreinstallSelect from './PreinstallSelect.vue';
import Preview from './CutPreview.vue';
import ExportArguments from './ExportArguments.vue';
import { v4 } from 'uuid';
import { useI18n } from 'vue-i18n';
import { Selection } from '@/context/selection';
import {
    get_actions_add_export_format,
    get_actions_export_format_delete,
    get_actions_export_format_file_format,
    get_actions_export_format_perfix,
    get_actions_export_format_unify,
    get_export_formats
} from '@/utils/shape_style';
import { downloadImages, exportSingleImage, getExportFillUrl, getPngImageData, getPosition, getSvgImageData } from '@/utils/image';
import SvgIcon from '@/components/common/SvgIcon.vue';
import export_menu_icon from "@/assets/icons/svg/export-menu.svg"
import add_icon from "@/assets/icons/svg/add.svg"
import { ShapeDom } from '../../Content/vdom/shape';
import { getCutoutShape, getPageBounds, parentIsArtboard } from '@/utils/cutout';
import { color2string } from '@/utils/content';

const { t } = useI18n();

type Props = {
    context: Context;
    shapes: ShapeView[];
    trigger: any[];
}

type SvgFormat = {
    id: string;
    width: number;
    height: number;
    x: number;
    y: number;
    background: string;
    shapes: ShapeView[];
}

export type FormatItems = {
    id: number;
    format: ExportFormat;
}

const props = defineProps<Props>();
const isPreinstall = ref(false);

const sizeItems: string[] = ['0.5x', '1x', '2x', '3x', '4x', '5x'];
const prefixItems: ExportFormatNameingScheme[] = [ExportFormatNameingScheme.Prefix, ExportFormatNameingScheme.Suffix];
const formatItems: string[] = ['PNG', 'JPG', 'SVG'];
const fileFormat: ExportFileFormat[] = [ExportFileFormat.Png, ExportFileFormat.Jpg, ExportFileFormat.Svg, ExportFileFormat.Pdf];
const preinstallArgus: FormatItems[] = reactive([]);
const reflush = ref<number>(0);
const mixed = ref<boolean>(false);
const exportOption = ref<ExportOptions>();
const trim_bg = ref(false);
const canvas_bg = ref(false);
const previewUnfold = ref(false);
type Preview = InstanceType<typeof Preview>;
const preview = ref<Preview>();

const renderSvgs = ref<SvgFormat[]>([]);

function update(args: any[]) {
    if (args.includes('exportOptions') || args.includes('variables')) {
        updateData();
    }
    if (args.includes('layout')) {
        nextTick(() => {
            const selected = props.context.selection.selectedShapes;
            getShapesSvg(selected);
        })
        reflush.value++;
    }
}

function updateData() {
    preinstallArgus.length = 0;
    mixed.value = false;
    exportOption.value = undefined;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    renderSvgs.value = [];
    if (len === 1) {
        const shape = selected[0];
        const options = shape.exportOptions;
        if (options) {
            exportOption.value = options;
            trim_bg.value = options.trimTransparent;
            canvas_bg.value = options.canvasBackground;
            previewUnfold.value = options.unfold;

            for (let i = 0; i < options.exportFormats.length; i++) {
                const format = options.exportFormats[i];
                const f = { id: i, format };
                preinstallArgus.unshift(f);
            }
        }
    } else if (len > 1) {
        const options = selected[0].exportOptions;
        const _formats = get_export_formats(selected);
        if (_formats === 'mixed') {
            mixed.value = true;
        } else {
            preinstallArgus.push(..._formats.reverse());
            if (options) {
                exportOption.value = options;
            }
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const options = page.exportOptions;
            if (options) {
                exportOption.value = options;
                previewUnfold.value = options.unfold || false;
                for (let i = 0; i < options.exportFormats.length; i++) {
                    const format = options.exportFormats[i];
                    const f = { id: i, format };
                    preinstallArgus.unshift(f);
                }
            }
        }
    }
    reflush.value++;
}

const showPreinstall = () => {
    if (isPreinstall.value) return isPreinstall.value = false;
    isPreinstall.value = true;
    props.context.escstack.save('showPreinstall', () => {
        const achieve = isPreinstall.value;
        isPreinstall.value = false;
        return achieve;
    })
}

const preinstall = (v: string) => {
    const len = props.shapes.length;
    switch (v) {
        case 'ios':
            addIos(len);
            break;
        case 'android':
            addAndroid(len);
            break;
        case 'default':
            addDefault(len);
            break;
    }
}
const addDefault = (len: number) => {
    const format = new ExportFormat(new BasicArray(), v4(), 0, ExportFileFormat.Png, '', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
    const formats = [format];
    if (len === 1) {
        const shape = props.shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.addExportFormat([format]);
    } else if (len > 1) {
        if (mixed.value) {
            const actions = get_actions_export_format_unify(props.shapes, formats);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesExportFormatUnify(actions);
            }
        } else {
            const actions = get_actions_add_export_format(props.shapes, formats);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddExportFormat(actions);
            }
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.pageAddExportFormat(formats);
        }
    }
}
const addAndroid = (len: number) => {
    const format1 = new ExportFormat([0] as BasicArray<number>, v4(), 0, ExportFileFormat.Png, 'mdpi/', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
    const format2 = new ExportFormat([1] as BasicArray<number>, v4(), 0, ExportFileFormat.Png, 'xhdpi/', ExportFormatNameingScheme.Prefix, 2, ExportVisibleScaleType.Scale);
    const format3 = new ExportFormat([2] as BasicArray<number>, v4(), 0, ExportFileFormat.Png, 'xxhdpi/', ExportFormatNameingScheme.Prefix, 3, ExportVisibleScaleType.Scale);
    const format4 = new ExportFormat([3] as BasicArray<number>, v4(), 0, ExportFileFormat.Png, 'xxxhdpi/', ExportFormatNameingScheme.Prefix, 4, ExportVisibleScaleType.Scale);
    const formats = [format1, format2, format3, format4]
    if (len === 1) {
        const shape = props.shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.addExportFormat(formats);
    } else if (len > 1) {
        if (mixed.value) {
            const actions = get_actions_export_format_unify(props.shapes, formats, true);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesExportFormatUnify(actions);
            }
        } else {
            const actions = get_actions_add_export_format(props.shapes, formats);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddExportFormat(actions);
            }
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.pageAddExportFormat(formats);
        }
    }
}
const addIos = (len: number) => {
    const format1 = new ExportFormat([0] as BasicArray<number>, v4(), 0, ExportFileFormat.Png, '', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
    const format2 = new ExportFormat([1] as BasicArray<number>, v4(), 0, ExportFileFormat.Png, '@2x', ExportFormatNameingScheme.Suffix, 2, ExportVisibleScaleType.Scale);
    const format3 = new ExportFormat([2] as BasicArray<number>, v4(), 0, ExportFileFormat.Png, '@3x', ExportFormatNameingScheme.Suffix, 3, ExportVisibleScaleType.Scale);
    const formats = [format1, format2, format3]
    if (len === 1) {
        const shape = props.shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.addExportFormat(formats);
    } else if (len > 1) {
        if (mixed.value) {
            const actions = get_actions_export_format_unify(props.shapes, formats, true);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesExportFormatUnify(actions);
            }
        } else {
            const actions = get_actions_add_export_format(props.shapes, formats);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddExportFormat(actions);
            }
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.pageAddExportFormat(formats);
        }
    }
}

function first() {
    if (preinstallArgus.length === 0 && !mixed.value) preinstall('default');
}

const changePrefix = (index: number, idx: number) => {
    const _idx = preinstallArgus.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportFormatPerfix(_idx, prefixItems[index]);
    } else if (len > 1) {
        const actions = get_actions_export_format_perfix(selected, _idx, prefixItems[index]);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatPrefix(actions);
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setPageExportFormatPrefix(_idx, prefixItems[index]);
        }
    }
}
const changeFormat = (index: number, idx: number) => {
    const _idx = preinstallArgus.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportFormatFileFormat(_idx, fileFormat[index]);
    } else if (len > 1) {
        const actions = get_actions_export_format_file_format(selected, _idx, fileFormat[index]);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatFileFormat(actions);
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setPageExportFormatFileFormat(_idx, fileFormat[index]);
        }
    }
}

const deleteArgus = (idx: number) => {
    const _idx = preinstallArgus.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.deleteExportFormat(_idx);
    } else if (len > 1) {
        const actions = get_actions_export_format_delete(props.shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteExportFormat(actions);
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.pageDeleteExportFormat(_idx);
        }
    }
}

const trimBackground = (v: boolean) => {
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportTrimTransparent(v);
    }
}
const canvasBackground = (v: boolean) => {
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportCanvasBackground(v);
    }
}
const previewCanvas = (v: boolean) => {
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    previewUnfold.value = v;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportPreviewUnfold(v);
    } else if (len < 1) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setPageExportPreviewUnfold(v);
        }
    }
}
const isShowCheckbox = ref(false);
const showCheckbox = () => {
    isShowCheckbox.value = props.context.selection.selectedShapes.length === 1 && props.context.selection.selectedShapes[0].type === ShapeType.Cutout;
}

const pageSvg = ref<SVGSVGElement[]>();
const pngImageUrls: Map<string, string> = new Map();
const exportFill = () => {
    pngImageUrls.clear();
    const selected = props.context.selection.selectedShapes;
    getShapesSvg(selected);
    reflush.value++;
    nextTick(async () => {
        if (selected.length === 0) {
            await Promise.resolve(exportPageImage());
        }
        else {
            await Promise.resolve(getExportUrl());
        }
        const page = props.context.selection.selectedPage;
        if (!page) return;
        const shape = selected.length > 0 ? selected[0] : page;
        const options = shape.exportOptions;
        const formats = options!.exportFormats;
        if (selected.length <= 1 && formats.length === 1 && !formats[0].name.includes('/')) {
            const id = shape.id + formats[0].id;
            const url = pngImageUrls.get(id);
            if (url) {
                let fileName;
                if (formats[0].namingScheme === ExportFormatNameingScheme.Prefix) {
                    fileName = formats[0].name + shape.name;
                } else {
                    fileName = shape.name + formats[0].name;
                }
                exportSingleImage(url, formats[0].fileFormat, fileName);
            }
        } else {
            const shapes = selected.length > 0 ? selected : [page];
            const imageUrls = getExportFillUrl(shapes, pngImageUrls);
            downloadImages(imageUrls);
        }
    })
}

const getExportUrl = async () => {
    const selected = props.context.selection.selectedShapes;
    const promises: Array<Promise<void>> = [];
    for (let i = 0; i < selected.length; i++) {
        if (selected.length === 0) break;
        const shape = selected[i];
        if (pageSvg.value) {
            const svg = pageSvg.value[i]!;
            (shape.exportOptions! as ExportOptions).exportFormats.forEach((format) => {
                const id = shape.id + format.id;
                const { width, height } = svg.viewBox.baseVal
                svg.setAttribute("width", `${width * format.scale}`);
                svg.setAttribute("height", `${height * format.scale}`);
                let promise: Promise<void> = Promise.resolve();
                const isTrim = shape.type === ShapeType.Line || shape.type === ShapeType.Star || shape.type === ShapeType.Polygon
                if (format.fileFormat === ExportFileFormat.Jpg || format.fileFormat === ExportFileFormat.Png) {
                    promise = getPngImageData(svg, shape.exportOptions!.trimTransparent || isTrim, id, format, pngImageUrls, shape);
                } else if (format.fileFormat === ExportFileFormat.Svg) {
                    promise = getSvgImageData(svg, shape.exportOptions!.trimTransparent || isTrim, id, format, pngImageUrls, shape);
                }
                promises.push(promise);
            });
        }
    }
    await Promise.all(promises);
}

const exportPageImage = async () => {
    const page = props.context.selection.selectedPage;
    if (!page || !page.exportOptions) return;
    const options = page.exportOptions as ExportOptions;
    const promises: Array<Promise<void>> = [];
    if (pageSvg.value) {
        const svg = pageSvg.value[0]!;
        options.exportFormats.forEach((format, idx) => {
            const id = page.id + format.id;
            const { width, height } = svg.viewBox.baseVal
            svg.setAttribute("width", `${width * format.scale}`);
            svg.setAttribute("height", `${height * format.scale}`);
            let promise: Promise<void> = Promise.resolve();
            if (format.fileFormat === ExportFileFormat.Jpg || format.fileFormat === ExportFileFormat.Png) {
                promise = getPngImageData(svg, options.trimTransparent, id, format, pngImageUrls, page);
            } else if (format.fileFormat === ExportFileFormat.Svg) {
                promise = getSvgImageData(svg, options.trimTransparent, id, format, pngImageUrls, page);
            }
            promises.push(promise);
        });
    }
    await Promise.all(promises);
}

function update_by_shapes() {
    updateData();
    showCheckbox();
}

const DEFAULT_COLOR = () => {
    const backgroundColor = props.context.selection.selectedPage?.backgroundColor;
    if (backgroundColor) {
        return color2string(backgroundColor);
    } else {
        return 'rgba(239,239,239,1)';
    }
}

function getShapesSvg(shapes: ShapeView[]) {
    if (shapes.length > 0) {
        let items: SvgFormat[] = [];
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            let shapeItem: ShapeView[] = [];
            let bgc = 'transparent';
            if (shape.type === ShapeType.Cutout) {
                const item = parentIsArtboard(shape);
                if (shape.isVisible && item) {
                    shapeItem = Array(item).filter(s => s.type !== ShapeType.Cutout);
                } else {
                    const selectedShapes: Map<string, ShapeView> = new Map();
                    getCutoutShape(shape, props.context.selection.selectedPage!, selectedShapes);
                    shapeItem = Array.from(selectedShapes.values()).filter(s => s.type !== ShapeType.Cutout);
                }
                shape.exportOptions?.canvasBackground ? bgc = DEFAULT_COLOR() : bgc = 'transparent';
            } else {
                shapeItem = [shape];
            }
            const { x, y, width, height } = getPosition(shape);
            items.push(
                {
                    id: shape.id + i,
                    width,
                    height,
                    x,
                    y,
                    background: bgc,
                    shapes: shapeItem
                }
            )
        }
        renderSvgs.value = toRaw(items);
    } else if (shapes.length === 0) {
        let r_Items: SvgFormat[] = [];
        const page = props.context.selection.selectedPage;
        if (!page) return;
        const { x, y, width: _w, height: _h } = getPageBounds(page);
        r_Items.push(
            {
                id: page.id + 0,
                width: _w,
                height: _h,
                x: x,
                y: y,
                background: 'transparent',
                shapes: page.childs.filter(s => s.type !== ShapeType.Cutout)
            }
        )
        renderSvgs.value = toRaw(r_Items);
    }
}

let page = props.context.selection.selectedPage!;
page.watch(updateData);
function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) update_by_shapes();
    if (t === Selection.CHANGE_PAGE) {
        update_by_shapes();
        page.unwatch(updateData);
        page = props.context.selection.selectedPage!;
        page.watch(updateData);
    }
}

const stop = watch(() => props.trigger, (v) => {
    update(v);
})

onMounted(() => {
    update_by_shapes();
    props.context.selection.watch(selection_watcher);
});
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    stop();
    page.unwatch(updateData);
});
</script>

<template>
    <div class="cutout_export_box">
        <div class="title" @click.stop="first">
            <div class="name" :class="{ 'checked': preinstallArgus.length > 0 }">{{ t('cutoutExport.export') }}</div>
            <div class="cutout_add_icon">
                <div class="cutout-icon cutout-preinstall" :style="{ backgroundColor: isPreinstall ? '#EBEBEB' : '' }"
                    @click.stop="showPreinstall">
                    <SvgIcon :icon="export_menu_icon" />
                </div>
                <div class="cutout-icon" @click.stop="preinstall('default')">
                    <SvgIcon :icon="add_icon" />
                </div>
                <PreinstallSelect v-if="isPreinstall" @close="isPreinstall = false" @preinstall="preinstall">
                </PreinstallSelect>
            </div>
        </div>
        <div class="tips-wrap" v-if="mixed">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div v-else-if="!mixed">
            <div class="argus" v-if="preinstallArgus.length > 0">
                <ExportArguments v-for="(argus, index) in preinstallArgus" :key="argus.id" :index="index" :argus="argus"
                                 :context="context" :shapes="shapes" :sizeItems="sizeItems" :perfixItems="prefixItems"
                                 :length="preinstallArgus.length" :formatItems="formatItems"
                                 @changePerfix="changePrefix"
                    @change-format="changeFormat" @delete="deleteArgus">
                </ExportArguments>
            </div>
            <div class="canvas-bgc" v-if="isShowCheckbox && exportOption && preinstallArgus.length > 0">
                <el-checkbox :model-value="trim_bg" @change="trimBackground"
                    :label="t('cutoutExport.trim_transparent_pixels')" />
            </div>
            <div class="canvas-bgc" v-if="isShowCheckbox && exportOption && preinstallArgus.length > 0">
                <el-checkbox :model-value="canvas_bg" @change="canvasBackground"
                    :label="t('cutoutExport.canvas_background_color')" />
            </div>
            <div class="export-box" v-if="preinstallArgus.length > 0">
                <div @click="exportFill"><span>{{ t('cutoutExport.export') }}</span></div>
            </div>
            <Preview ref="preview" v-if="exportOption && exportOption.exportFormats.length" :context="context" :trigger="trigger"
                :shapes="shapes" :unfold="previewUnfold" @preview-change="previewCanvas" :canvas_bg="canvas_bg"
                :trim_bg="trim_bg">
            </Preview>
        </div>
        <div class="export-svg" :reflush="reflush">
            <template v-for="(svg) in renderSvgs" :key="svg.id">
                <svg ref="pageSvg" :width="svg.width" :height="svg.height" overflow="visible"
                    :viewBox="`${svg.x} ${svg.y} ${svg.width} ${svg.height}`"
                    v-html="(svg.shapes[0] as ShapeDom)?.el?.outerHTML || ''"
                    :style="{ 'background-color': svg.background }"></svg>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
.cutout_export_box {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .title {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        .name {
            flex-shrink: 0;
            height: 14px;
            font-size: 12px;
            font-weight: normal;
            font-feature-settings: "kern" on;
            color: #737373;
        }

        .checked {
            color: #000000;
        }

        .cutout_add_icon {
            display: flex;
            align-items: center;
            position: relative;
            gap: 8px;

            .cutout-icon {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);
                box-sizing: border-box;

                &:hover {
                    background-color: #F5F5F5;
                }

                >svg {
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }

    .argus {
        width: 100%;
        padding: 6px 0;
    }

    .canvas-bgc {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;

        :deep(.el-checkbox__inner::after) {
            border: 1.5px solid #000;
            border-left: 0;
            border-top: 0;
            transition: none;
        }

        :deep(.el-checkbox__inner) {
            transition: none;
        }

        :deep(.el-checkbox__label) {
            font-size: 12px;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
            background-color: #fff;
            border-color: #000;
        }

        :deep(.el-checkbox__input.is-checked+.el-checkbox__label) {
            color: #000;
        }

        :deep(.el-checkbox__inner:hover) {
            border-color: #dcdfe6;
        }
    }

    .export-box {
        display: flex;
        height: 32px;
        width: 100%;
        align-items: center;
        margin: 8px 0;

        div {
            font-weight: bold;
            width: 100%;
            height: 30px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #F0F0F0;

            span {
                color: #262626;
            }

            &:hover {
                background-color: #F0F0F0;
            }
        }
    }
}

.tips-wrap {
    padding: 12px 0;

    .mixed-tips {
        display: block;
        width: 100%;
        text-align: center;
        font-size: var(--font-default-fontsize);
    }
}

.export-svg {
    position: fixed;
    left: 100000px;
    top: 100000px;
    opacity: 0;
    z-index: -2023;
    overflow: hidden;
}
</style>