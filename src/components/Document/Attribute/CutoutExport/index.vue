<script setup lang="ts">
import { ExportFileFormat, ExportFormat, ExportFormatNameingScheme, ExportOptions, ExportVisibleScaleType, Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { Context } from '@/context';
import PreinstallSelect from './PreinstallSelect.vue';
import Preview from './Preview.vue';
import ExportArguments from './ExportArguments.vue';
import { v4 } from 'uuid';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {
    context: Context
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
const preinstallArgus: FormatItems[] = reactive([]);
const reflush = ref<number>(0);
const watchedShapes = new Map();
const mixed = ref<boolean>(false);
const exportOption = ref<ExportOptions>();
const lucency_bg = ref(exportOption.value?.trimTransparent);
const canvas_bg = ref(exportOption.value?.canvasBackground);
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
    const len = props.shapes.length;
    if (len === 1) {
        const shape = props.shapes[0];
        const options = shape.exportOptions;
        if (options) {
            exportOption.value = options;
            console.log(options);
            
            for (let i = 0; i < options.exportFormats.length; i++) {
                const format = options.exportFormats[i];
                const f = { id: i, format };
                preinstallArgus.unshift(f);
            }
        }
    } else if (len > 1) {

    }
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
            if (len === 1) {
                const shape = props.shapes[0];
                const editor = props.context.editor4Shape(shape);
                const format1 = new ExportFormat(v4(), 0, ExportFileFormat.Png, '_', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
                const format2 = new ExportFormat(v4(), 0, ExportFileFormat.Png, '@2x', ExportFormatNameingScheme.Suffix, 2, ExportVisibleScaleType.Scale);
                const format3 = new ExportFormat(v4(), 0, ExportFileFormat.Png, '@3x', ExportFormatNameingScheme.Suffix, 3, ExportVisibleScaleType.Scale);
                const formars = [format1, format2, format3]
                editor.addExportFormat(formars);
            }
            break;
        case 'android':
        if (len === 1) {
                const shape = props.shapes[0];
                const editor = props.context.editor4Shape(shape);
                const format1 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'mdpi/', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
                const format2 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'xhdpi/', ExportFormatNameingScheme.Prefix, 2, ExportVisibleScaleType.Scale);
                const format3 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'xxhdpi/', ExportFormatNameingScheme.Prefix, 3, ExportVisibleScaleType.Scale);
                const format4 = new ExportFormat(v4(), 0, ExportFileFormat.Png, 'xxxhdpi/', ExportFormatNameingScheme.Prefix, 4, ExportVisibleScaleType.Scale);
                const formars = [format1, format2, format3, format4]
                editor.addExportFormat(formars);
            }
            break;
        case 'default':
            if (len === 1) {
                const shape = props.shapes[0];
                const editor = props.context.editor4Shape(shape);
                const format = new ExportFormat(v4(), 0, ExportFileFormat.Png, '_', ExportFormatNameingScheme.Prefix, 1, ExportVisibleScaleType.Scale);
                editor.addExportFormat([format]);
            }
            break;
    }
}
const changeSize = (index: number, argsi: number) => {
    // preinstallArgus.value[argsi].size = sizeItems[index];
}
const changePrefix = (index: number, argsi: number) => {
    // preinstallArgus.value[argsi].prefix = perfixItems[index];
}
const changeFormat = (index: number, argsi: number) => {
    // preinstallArgus.value[argsi].format = formatItems[index];
}
const deleteArgus = (index: number) => {
    preinstallArgus.splice(index, 1);
}
function update_by_shapes() {
    watchShapes();
    updateData();
}
// hooks
const stop = watch(() => props.shapes, update_by_shapes);
onMounted(update_by_shapes);
onUnmounted(stop);
</script>

<template>
    <div class="cutout_export_box">
        <div class="title">
            <div class="name">创建切图与导出</div>
            <div class="cutout_add_icon">
                <div class="cutout-icon cutout-preinstall"
                    :style="{ backgroundColor: isPreinstall ? 'rgba(0, 0, 0, 0.2)' : '' }" @click="showPreinstall"><svg-icon
                        icon-class="text-justify"></svg-icon></div>
                <div class="cutout-icon" @click="preinstall('default')"><svg-icon icon-class="add"></svg-icon></div>
                <PreinstallSelect v-if="isPreinstall" @close="isPreinstall = false" @preinstall="preinstall">
                </PreinstallSelect>
            </div>
        </div>
        <div class="argus" v-if="preinstallArgus.length > 0" preinstallArgus.length>
            <ExportArguments v-for="(argus, index) in preinstallArgus" :key="argus.id" :index="index" :argus="argus"
                :context="context" :shapes="shapes" :sizeItems="sizeItems" :perfixItems="perfixItems"
                :formatItems="formatItems" @change-size="changeSize" @change-prefix="changePrefix"
                @change-format="changeFormat" @delete="deleteArgus">
            </ExportArguments>
        </div>
        <template v-if="shapes[0].exportOptions">
            <div class="canvas-bgc">
                <el-checkbox :value="lucency_bg" label="修剪透明像素" />
            </div>
            <div class="canvas-bgc">
                <el-checkbox :value="canvas_bg" label="画布背景色" />
            </div>
            <div class="export-box">
                <div><span>导出</span></div>
            </div>
            <Preview :context="context" :shapes="shapes" :unfold="false"></Preview>
        </template>
    </div>
</template>

<style scoped lang="scss">
.cutout_export_box {
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
</style>