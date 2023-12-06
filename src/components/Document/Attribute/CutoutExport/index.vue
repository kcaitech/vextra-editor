<script setup lang="ts">
import { ExportFileFormat, ExportFormat, ExportFormatNameingScheme, ExportOptions, ExportVisibleScaleType, Shape, ShapeType } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch, reactive, computed, nextTick } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { Context } from '@/context';
import PreinstallSelect from './PreinstallSelect.vue';
import Preview from './Preview.vue';
import ExportArguments from './ExportArguments.vue';
import { v4 } from 'uuid';
import { useI18n } from 'vue-i18n';
import { Selection } from '@/context/selection';
import comsMap from '@/components/Document/Content/comsmap';
import { get_actions_add_export_format, get_actions_export_format_delete, get_actions_export_format_file_format, get_actions_export_format_name, get_actions_export_format_perfix, get_actions_export_format_scale, get_actions_export_format_unify, get_export_formats } from '@/utils/shape_style';
import { downloadImages, exportSingleImage, getExportFillUrl, getPngImageData, getSvgImageData } from '@/utils/image';

const { t } = useI18n();
interface Props {
    context: Context
    shapes: Shape[]
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
export interface FormatItems {
    id: number,
    format: ExportFormat
}
const props = defineProps<Props>();
const isPreinstall = ref(false);

const sizeItems: string[] = ['0.5x', '1x', '2x', '3x', '4x', '5x'];
const perfixItems: ExportFormatNameingScheme[] = [ExportFormatNameingScheme.Prefix, ExportFormatNameingScheme.Suffix];
const formatItems: string[] = ['PNG', 'JPG', 'SVG', 'PDF'];
const fileFormat: ExportFileFormat[] = [ExportFileFormat.Png, ExportFileFormat.Jpg, ExportFileFormat.Svg, ExportFileFormat.Pdf];
const preinstallArgus: FormatItems[] = reactive([]);
const reflush = ref<number>(0);
const watchedShapes = new Map();
const mixed = ref<boolean>(false);
const exportOption = ref<ExportOptions>();
const trim_bg = ref(false);
const canvas_bg = ref(false);
const previewUnfold = ref(false);
const preview = ref();

let renderSvgs = ref<SvgFormat[]>([]);
function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}
function watcher(...args: any[]) {
    if (args.length > 0 && args.includes('export-options')) updateData();
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
                previewUnfold.value = options.unfold;
                for (let i = 0; i < options.exportFormats.length; i++) {
                    const format = options.exportFormats[i];
                    const f = { id: i, format };
                    preinstallArgus.unshift(f);
                }
            }
        }
    }
    nextTick(() => {
        if (preview.value) {
            preview.value.getShapesSvg(selected);
            renderSvgs.value = preview.value.renderSvgs;
        }
    })
    reflush.value++;
}

const showPreinstall = () => {
    if (isPreinstall.value) return isPreinstall.value = false;
    isPreinstall.value = true;
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
    const format = new ExportFormat(v4(), 0, ExportFileFormat.Png, '', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
    const formars = [format];
    if (len === 1) {
        const shape = props.shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.addExportFormat([format]);
    } else if (len > 1) {
        if (mixed.value) {
            const actions = get_actions_export_format_unify(props.shapes, formars);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesExportFormatUnify(actions);
            }
        } else {
            const actions = get_actions_add_export_format(props.shapes, formars);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddExportFormat(actions);
            }
        }
    } else {
        // const page = props.context.selection.selectedPage;
        // if (page) {
        //     const editor = props.context.editor4Page(page);
        //     editor.pageAddExportFormat(formars);
        // }
    }
}
const addAndroid = (len: number) => {
    const format1 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'mdpi/', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
    const format2 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'xhdpi/', ExportFormatNameingScheme.Prefix, 2, ExportVisibleScaleType.Scale);
    const format3 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'xxhdpi/', ExportFormatNameingScheme.Prefix, 3, ExportVisibleScaleType.Scale);
    const format4 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'xxxhdpi/', ExportFormatNameingScheme.Prefix, 4, ExportVisibleScaleType.Scale);
    const formars = [format1, format2, format3, format4]
    if (len === 1) {
        const shape = props.shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.addExportFormat(formars);
    } else if (len > 1) {
        if (mixed.value) {
            const actions = get_actions_export_format_unify(props.shapes, formars, true);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesExportFormatUnify(actions);
            }
        } else {
            const actions = get_actions_add_export_format(props.shapes, formars);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddExportFormat(actions);
            }
        }
    } else {
        // const page = props.context.selection.selectedPage;
        // if (page) {
        //     const editor = props.context.editor4Page(page);
        //     editor.pageAddExportFormat(formars);
        // }
    }
}
const addIos = (len: number) => {
    const format1 = new ExportFormat(v4(), 0, ExportFileFormat.Png, '', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
    const format2 = new ExportFormat(v4(), 0, ExportFileFormat.Png, '@2x', ExportFormatNameingScheme.Suffix, 2, ExportVisibleScaleType.Scale);
    const format3 = new ExportFormat(v4(), 0, ExportFileFormat.Png, '@3x', ExportFormatNameingScheme.Suffix, 3, ExportVisibleScaleType.Scale);
    const formars = [format1, format2, format3]
    if (len === 1) {
        const shape = props.shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.addExportFormat(formars);
    } else if (len > 1) {
        if (mixed.value) {
            const actions = get_actions_export_format_unify(props.shapes, formars, true);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesExportFormatUnify(actions);
            }
        } else {
            const actions = get_actions_add_export_format(props.shapes, formars);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddExportFormat(actions);
            }
        }
    } else {
        // const page = props.context.selection.selectedPage;
        // if (page) {
        //     const editor = props.context.editor4Page(page);
        //     editor.pageAddExportFormat(formars);
        // }
    }
}
function first() {
    if (preinstallArgus.length === 0 && !mixed.value) preinstall('default');
}
const changeSize = (value: string, idx: number) => {
    const _idx = preinstallArgus.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportFormatScale(_idx, parseFloat(value));
    } else if (len > 1) {
        const actions = get_actions_export_format_scale(props.shapes, _idx, parseFloat(value));
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatScale(actions);
        }
    }
}
const changePerfix = (index: number, idx: number) => {
    const _idx = preinstallArgus.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportFormatPerfix(_idx, perfixItems[index]);
    } else if (len > 1) {
        const actions = get_actions_export_format_perfix(props.shapes, _idx, perfixItems[index]);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatPerfix(actions);
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
        const actions = get_actions_export_format_file_format(props.shapes, _idx, fileFormat[index]);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatFileFormat(actions);
        }
    }
}
const changeName = (value: string, idx: number) => {
    const _idx = preinstallArgus.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportFormatName(_idx, value);
    } else if (len > 1) {
        const actions = get_actions_export_format_name(props.shapes, _idx, value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatName(actions);
        }
    }
}
const deleteArgus = (idx: number) => {
    const _idx = preinstallArgus.length - idx - 1;
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        if (shape.type === ShapeType.Cutout && preinstallArgus.length === 1) return;
        const editor = props.context.editor4Shape(shape);
        editor.deleteExportFormat(_idx);
    } else if (len > 1) {
        const actions = get_actions_export_format_delete(props.shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteExportFormat(actions);
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
    }
}
const isShowCheckbox = ref(false);
const showCheckbox = () => {
    isShowCheckbox.value = props.context.selection.selectedShapes.length === 1 && props.context.selection.selectedShapes[0].type === ShapeType.Cutout;
}

const previewSvgs = ref<SVGSVGElement[]>();
const pngImageUrls: Map<string, string> = new Map();
const exportFill = () => {
    pngImageUrls.clear();
    const selected = props.context.selection.selectedShapes;
    for (let i = 0; i < selected.length; i++) {
        const shape = selected[i];
        if (previewSvgs.value) {
            const svg = previewSvgs.value[i];
            shape.exportOptions!.exportFormats.forEach((format, idx) => {
                const id = shape.id + format.id;
                const { width, height } = svg.viewBox.baseVal
                svg.setAttribute("width", `${width * format.scale}`);
                svg.setAttribute("height", `${height * format.scale}`);
                if (format.fileFormat === ExportFileFormat.Jpg || format.fileFormat === ExportFileFormat.Png) {
                    getPngImageData(svg, shape.exportOptions!.trimTransparent, id, format, pngImageUrls);
                }else if(format.fileFormat === ExportFileFormat.Svg) {
                    getSvgImageData(svg, shape.exportOptions!.trimTransparent, id, format, pngImageUrls);
                }
            });
        }
    }
    setTimeout(() => {
        const page = props.context.selection.selectedPage;
        const options = selected.length > 0 ? selected[0].exportOptions : page && page.exportOptions;
        const formats = options!.exportFormats;
        if (selected.length <= 1 && formats.length === 1 && !formats[0].name.includes('/')) {
            const id = selected[0].id + formats[0].id;
            const url = pngImageUrls.get(id);
            if (url) {
                let fileName;
                if (formats[0].namingScheme === ExportFormatNameingScheme.Prefix) {
                    fileName = formats[0].name + selected[0].name;
                } else {
                    fileName = selected[0].name + formats[0].name;
                }
                exportSingleImage(url, formats[0].fileFormat, fileName);
            }
        } else {
            const imageUrls = getExportFillUrl(selected, pngImageUrls);
            downloadImages(imageUrls);
        }
    }, 100)
}

function update_by_shapes() {
    watchShapes();
    updateData();
    showCheckbox();
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) update_by_shapes();
    if (t === Selection.CHANGE_PAGE) update_by_shapes();
}
// hooks
onMounted(() => {
    update_by_shapes();
    showCheckbox();
    props.context.selection.watch(selection_watcher);
});
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
});
</script>

<template>
    <div class="cutout_export_box">
        <div class="title" @click.stop="first">
            <div class="name">创建切图与导出</div>
            <div class="cutout_add_icon">
                <div class="cutout-icon cutout-preinstall"
                    :style="{ backgroundColor: isPreinstall ? 'rgba(0, 0, 0, 0.2)' : '' }" @click="showPreinstall"><svg-icon
                        icon-class="text-justify"></svg-icon></div>
                <div class="cutout-icon" @click.stop="preinstall('default')"><svg-icon icon-class="add"></svg-icon></div>
                <PreinstallSelect v-if="isPreinstall" @close="isPreinstall = false" @preinstall="preinstall">
                </PreinstallSelect>
            </div>
        </div>
        <div class="tips-wrap" v-if="mixed">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div v-else-if="!mixed">
            <div class="argus" v-if="preinstallArgus.length > 0" preinstallArgus.length>
                <ExportArguments v-for="(argus, index) in preinstallArgus" :key="argus.id" :index="index" :argus="argus"
                    :context="context" :shapes="shapes" :sizeItems="sizeItems" :perfixItems="perfixItems"
                    :length="preinstallArgus.length" :formatItems="formatItems" @change-size="changeSize"
                    @changePerfix="changePerfix" @change-name="changeName" @change-format="changeFormat"
                    @delete="deleteArgus">
                </ExportArguments>
            </div>
            <div class="canvas-bgc" v-if="isShowCheckbox && exportOption">
                <el-checkbox :model-value="trim_bg" @change="trimBackground" label="修剪透明像素" />
            </div>
            <div class="canvas-bgc" v-if="isShowCheckbox && exportOption">
                <el-checkbox :model-value="canvas_bg" @change="canvasBackground" label="画布背景色" />
            </div>
            <div class="export-box" v-if="preinstallArgus.length > 0">
                <div @click="exportFill"><span>导出</span></div>
            </div>
            <Preview ref="preview" v-if="exportOption && exportOption.exportFormats.length" :context="context"
                :shapes="shapes" :unfold="previewUnfold" @preview-change="previewCanvas" :canvas_bg="canvas_bg"
                :trim_bg="trim_bg">
            </Preview>
        </div>
        <div class="exportsvg">
            <template v-for="(svg) in renderSvgs" :key="svg.id">
                <svg version="1.1" ref="previewSvgs" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml"
                    preserveAspectRatio="xMinYMin meet" :width="svg.width" :height="svg.height"
                    :viewBox="`${svg.x} ${svg.y} ${svg.width} ${svg.height}`"
                    :style="{ 'background-color': svg.background }">
                    <component :is="comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle)" v-for=" c  in  svg.shapes "
                        :key="c.id" :data="c" />
                </svg>
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
    padding: 0 10px 12px 10px;
    box-sizing: border-box;

    .title {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        .name {
            font-weight: 600;
            flex-shrink: 0;
        }

        .cutout_add_icon {
            display: flex;
            align-items: center;
            position: relative;

            .cutout-icon {
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;

                &:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                >svg {
                    width: 50%;
                    height: 50%;
                }
            }
        }
    }

    .argus {
        width: 100%;
        margin: 3px 0;
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
        height: 30px;
        width: 100%;
        align-items: center;
        margin: 5px 0;

        div {
            font-weight: bold;
            width: 100%;
            height: 30px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #dcdfe6;

            &:hover {
                border: 1px solid #000;
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

.exportsvg {
    position: fixed;
    right: -1000px;
    top: -1000px;
    opacity: 0;
    z-index: -1;
}
</style>