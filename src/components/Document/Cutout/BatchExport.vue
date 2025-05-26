/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context"
import { color2string, shape_track } from "@/utils/content";
import { getCutoutShape, getGroupChildBounds, getPageBounds, getShadowMax, parentIsArtboard } from "@/utils/cutout";
import {
    ExportFileFormat,
    ExportFormat,
    ExportFormatNameingScheme,
    FrameCpt,
    ShapeFrame,
    ShapeType,
    ShapeView
} from "@kcdesign/data";
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import PageCard from "@/components/common/PageCard.vue";
import { useI18n } from "vue-i18n";
import Tooltip from '@/components/common/Tooltip.vue';
import { downloadImages, exportSingleImage, getSvgImageData } from "@/utils/image";
import { fixedZero } from "@/utils/common";
import { Action } from "@/context/tool";

const { t } = useI18n();

const props = defineProps<{
    context: Context
}>();

type ExportInfo = {
    x: number,
    y: number,
    width: number,
    height: number,
    children: ShapeView[],
    curShape: ShapeView,
    format: ExportFormat,
    frame: ShapeFrame,
    repeat: boolean,
    checked: boolean,
    url: string,
    background: string
}
const top = ref(0);
const left = ref(0);
const exportShapes = ref<ShapeView[]>();
let exportItems: ExportInfo[] = reactive([]);
const dialog = ref<HTMLDivElement>()
const checked = ref(true);
const checkedAll = ref<HTMLInputElement>();
const svgImageUrls: Map<string, string> = new Map();
const DEFAULT_COLOR = () => {
    const backgroundColor = props.context.selection.selectedPage?.backgroundColor;
    if (backgroundColor) {
        return color2string(backgroundColor);
    } else {
        return 'rgba(239,239,239,1)';
    }
}

let downClient = { x: 0, y: 0 }
let isDrag = false;
const mousedown = (e: MouseEvent) => {
    e.stopPropagation();
    downClient.x = e.clientX;
    downClient.y = e.clientY;

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
}

const mouseMove = (e: MouseEvent) => {
    e.stopPropagation();
    const deep = Math.hypot(e.clientX - downClient.x, e.clientY - downClient.y);
    if (deep > 4) {
        isDrag = true;
    }
    if (!dialog.value) return;
    if (isDrag) {
        const { width, height, x, y } = dialog.value.getBoundingClientRect();
        const clientWidth = document.body.clientWidth;
        const clientHeight = document.body.clientHeight;
        top.value += e.movementY;
        left.value += e.movementX;
        if (top.value < 0) top.value = 0;
        if (left.value < 0) left.value = 0;
        if ((width + x) > clientWidth) left.value = clientWidth - width;
        if ((height + y) > clientHeight) top.value = clientHeight - height;
    }
}
const mouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    isDrag = false;
    downClient = { x: 0, y: 0 }
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
}


const init_posi = () => {
    top.value = 50;
    const clientWidth = document.body.clientWidth;
    const el = document.getElementById('export_dialog');
    if (el) {
        const { x } = el.getBoundingClientRect();
        left.value = x;
    } else {
        left.value = clientWidth - 615;
    }
}

const getExportShapes = () => {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length) {
        exportShapes.value = shapes.filter(s => s.isVisible && s.exportOptions && s.exportOptions.exportFormats.length > 0);
    } else {
        const childs = Array.from(page.shapes.values());
        exportShapes.value = childs.filter(s => s.isVisible && s.exportOptions && s.exportOptions.exportFormats.length > 0);
    }

    getExportInfo();
}

const getExportInfo = () => {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page) return;
    if (exportShapes.value) {
        for (let i = 0; i < exportShapes.value.length; i++) {
            const shape = exportShapes.value[i];
            const info = getInfo(shape);
            const formats = shape.exportOptions!.exportFormats as ExportFormat[];
            for (let index = 0; index < formats.length; index++) {
                let item: ExportInfo
                const format = formats[index];
                const background = shape.exportOptions!.canvasBackground ? DEFAULT_COLOR() : 'transparent';
                item = { ...info, format, frame: shape.frame, repeat: formatRepeat(format, formats), background }
                exportItems.push(item);
            }
        }
    }
    if (!shapes.length) {
        if (page.exportOptions && page.exportOptions.exportFormats.length > 0) {
            const { x, y, width, height } = getPageBounds(page);
            let info = {
                x,
                y,
                width,
                height,
                children: page.childs.filter(s => s.type !== ShapeType.Cutout),
                curShape: page,
                checked: true,
                url: '',
                background: 'transparent'
            }
            const formats = page.exportOptions.exportFormats as ExportFormat[];
            for (let index = 0; index < formats.length; index++) {
                let item: ExportInfo
                const format = formats[index];
                item = { ...info, format, frame: page.frame, repeat: formatRepeat(format, formats) }
                exportItems.unshift(item);
            }
        }
    }
    nextTick(() => {
        exportItems.forEach(async (item, index) => {
            await getSvgUrl(item, index);
            item.url = svgImageUrls.get(item.curShape.id) || '';
            getExportUrl();
        })
    })
}

const formatRepeat = (format: ExportFormat, formats: ExportFormat[]) => {
    if (formats.length === 1) return false;
    const scale = formats.every(item => item.scale === format.scale);
    const namingScheme = formats.every(item => item.namingScheme === format.namingScheme);
    const fileFormat = formats.every(item => item.fileFormat === format.fileFormat);
    const name = formats.every(item => item.name === format.name);
    return scale && namingScheme && fileFormat && name;
}

const selectedShapes: Map<string, ShapeView> = new Map();

const getInfo = (shape: ShapeView) => {
    const p = shape.boundingBox()
    const p_artboard = parentIsArtboard(shape);
    let info = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        children: [] as ShapeView[],
        curShape: shape,
        checked: true,
        url: ''
    }
    if (p_artboard && shape.type === ShapeType.Cutout) {
        const page = props.context.selection.selectedPage!;
        let frame = FrameCpt.frame2Root(shape);
        info.x = frame.x - page.frame.x;
        info.y = frame.y - page.frame.y;
        if (p_artboard.parent && p_artboard.parent.type !== ShapeType.Page) {
            frame = FrameCpt.frame2Parent(p_artboard);
            info.x = frame.x + shape.frame.x;
            info.y = frame.y + shape.frame.y;
        }
        info.width = shape.frame.width;
        info.height = shape.frame.height;
        const shapeItem = Array(p_artboard).filter(s => s.type !== ShapeType.Cutout);
        info.children.push(...shapeItem);
    } else if (shape.type === ShapeType.Cutout) {
        info.width = p.width;
        info.height = p.height;
        info.x = p.x;
        info.y = p.y;
        getCutoutShape(shape, props.context.selection.selectedPage!, selectedShapes);
        const shapeItem = Array.from(selectedShapes.values()).filter(s => s.type !== ShapeType.Cutout);
        info.children.push(...shapeItem);
    }
    if (shape.type !== ShapeType.Cutout) {
        if (shape.type === ShapeType.Group) {
            const { left, top, right, bottom } = getShadowMax(shape);
            const { x, y, width: _w, height: _h } = getGroupChildBounds(shape);
            info.x = x - left;
            info.y = y - top;
            info.width = _w + left + right;
            info.height = _h + top + bottom;
        } else {
            const { left, top, right, bottom } = getShadowMax(shape);
            info.x = shape.outerFrame.x - left;
            info.y = shape.outerFrame.y - top;
            info.width = (shape.outerFrame.width + left + right);
            info.height = (shape.outerFrame.height + top + bottom);
        }
        info.children.push(shape);
    }
    return info;
}

const getName = (info: ExportInfo) => {
    const { format, curShape } = info
    let name = ''
    if (format.namingScheme === ExportFormatNameingScheme.Prefix) {
        name = format.name + curShape.name;
    } else {
        name = curShape.name + format.name;
    }
    return name;
}

const click = (shape: ShapeView) => {
    shape_track(props.context, shape)
}

const changeAll = () => {
    exportItems.forEach(item => {
        item.checked = checkedAll.value?.checked || false;
    })
}
const changeItem = (e: Event, index: number) => {
    const el = e.target as HTMLInputElement;
    exportItems[index].checked = el.checked;
    const every = exportItems.every(item => item.checked);
    const some = exportItems.some(item => item.checked);
    if (every && checkedAll.value) {
        checked.value = true;
        checkedAll.value.indeterminate = false;
    }
    if (!some && checkedAll.value) {
        checked.value = false;
        checkedAll.value.indeterminate = false;
    }
    if (!every && some && checkedAll.value) {
        checkedAll.value.indeterminate = true;
        checked.value = false;
    }
}

const selectLength = () => {
    return exportItems.filter(item => item.checked).length;
}

type PCard = InstanceType<typeof PageCard>
const pageCard = ref<PCard[]>();
const getSvgUrl = async (item: ExportInfo, index: number) => {
    if (!pageCard.value) return;
    if (pageCard.value[index].pageSvg) {
        const shape = item.curShape;
        const { width, height } = pageCard.value[index].pageSvg!.viewBox.baseVal
        pageCard.value[index].pageSvg!.setAttribute("width", `${width * item.format.scale}`);
        pageCard.value[index].pageSvg!.setAttribute("height", `${height * item.format.scale}`);
        await getSvgImageData(pageCard.value[index].pageSvg!, shape.exportOptions!.trimTransparent, shape.id, item.format, svgImageUrls, shape);
    }
}

const getExportUrl = async () => {
    const promises = [];
    for (let i = 0; i < exportItems.length; i++) {
        const item = exportItems[i];
        const img = new Image();
        img.src = item.url;
        const promise = new Promise<void>((resolve) => {
            img.onload = function () {
                let dataUrl = ''
                const format = item.format;
                if (format.fileFormat === ExportFileFormat.Svg) {
                    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svgElement.innerHTML = atob(item.url.split(',')[1]);
                    const scaledWidth = img.width * format.scale;
                    const scaledHeight = img.height * format.scale;
                    svgElement.setAttribute('width', `${scaledWidth}`);
                    svgElement.setAttribute('height', `${scaledHeight}`);
                    const serializer = new XMLSerializer();
                    const svgString = serializer.serializeToString(svgElement);
                    dataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
                } else {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const scaledWidth = img.width * format.scale;
                    const scaledHeight = img.height * format.scale;
                    canvas.width = scaledWidth;
                    canvas.height = scaledHeight;
                    ctx!.scale(format.scale, format.scale);
                    ctx!.drawImage(img, 0, 0);
                    ctx!.drawImage(img, 0, 0);
                    dataUrl = canvas.toDataURL('image/png');
                }
                exportItems[i].url = dataUrl;
                resolve();
            };
        });
        promises.push(promise);
    }
    await Promise.all(promises);
}

const download = () => {
    const exportList = exportItems.filter(item => item.checked);
    if (exportList.length === 0) return;
    const { format, curShape, url } = exportList[0];
    if (exportList.length === 1 && !(format.name.includes('/'))) {
        let fileName;
        if (format.namingScheme === ExportFormatNameingScheme.Prefix) {
            fileName = format.name + curShape.name;
        } else {
            fileName = curShape.name + format.name;
        }
        exportSingleImage(url, format.fileFormat, fileName);
    } else {
        let imageUrlsInfo: any = [];
        for (let i = 0; i < exportList.length; i++) {
            const item = exportList[i];
            let fileName;
            if (item.format.namingScheme === ExportFormatNameingScheme.Prefix) {
                fileName = item.format.name + item.curShape.name;
            } else {
                fileName = item.curShape.name + item.format.name;
            }
            const fileInfo = {
                name: '',
                fileName: fileName,
                image: [item.url],
                fileFormat: item.format.fileFormat,
            }
            imageUrlsInfo.push(fileInfo);
        }
        const fileNameCount: any = {};
        imageUrlsInfo.forEach((item: any) => {
            if (fileNameCount[item.fileName + item.fileFormat] === undefined) {
                fileNameCount[item.fileName + item.fileFormat] = 1;
            } else {
                fileNameCount[item.fileName + item.fileFormat]++;
                item.fileName += '-' + fileNameCount[item.fileName + item.fileFormat];
            }
        });
        downloadImages(imageUrlsInfo);
    }
}

const close = () => {
    if (props.context.tool.action === Action.Export) {
        props.context.tool.setAction(Action.AutoV);
    }
    props.context.menu.setExportDialog(false);
}
const documentClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.target instanceof Element && !e.target.closest('.export-dialog')) {
        close();
    }
}
onMounted(() => {
    init_posi();
    getExportShapes();
    document.addEventListener('click', documentClick);
})

onUnmounted(() => {
    document.removeEventListener('click', documentClick);
    close();
})
import close_icon from '@/assets/icons/svg/close.svg';
import caution_icon from '@/assets/icons/svg/caution.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { SpaceHandler } from "@/space";
</script>

<template>
    <div class="export-dialog" ref="dialog" :style="`transform: translate(${left}px, ${top}px)`" @click.stop
        @mousedown.stop @wheel.stop>
        <div class="header" @mousedown="mousedown">
            <div class="title">{{ t('cutoutExport.export') }}</div>
            <div class="close" @click="close">
                <SvgIcon :icon="close_icon"/>
            </div>
        </div>
        <div class="dialog-body">
            <div class="exportList">
                <div class="export_checkbox">
                    <input ref="checkedAll" class="checkbox" type="checkbox" :checked="checked" @change="changeAll" />
                    <span>已选中 {{ selectLength() }}/{{ exportItems.length }}</span>
                </div>
                <ul class="export_list">
                    <li class="export_item" v-for="(item, index) in exportItems" :key="index">
                        <input class="checkbox" type="checkbox" :id="`export-${index}`" :checked="item.checked"
                            @change="(e) => changeItem(e, index)" />
                        <div class="picture" @click="click(item.curShape)">
                            <img :src="item.url" />
                        </div>
                        <label :for="`export-${index}`">
                            <div class="content">
                                <div>
                                    <h5>{{ getName(item) }}</h5>
                                    <Tooltip :content="`${t('cutoutExport.repeat')}`" v-if="item.repeat">
                                        <SvgIcon :icon="caution_icon"/>
                                    </Tooltip>
                                </div>
                                <p>{{ item.format.scale + 'x' }} {{ item.format.fileFormat.toUpperCase() }},
                                    {{ fixedZero(item.frame.width * item.format.scale) + '×' }}{{
        fixedZero(item.frame.height * item.format.scale) + 'px' }}</p>
                            </div>
                        </label>
                        <PageCard ref="pageCard" :background-color="item.background"
                            :view-box="`${item.x} ${item.y} ${item.width} ${item.height}`" :shapes="item.children"
                            :width="item.width" :height="item.height"></PageCard>
                    </li>
                </ul>
            </div>
        </div>
        <div class="export-dialog-footer" :style="{ opacity: selectLength() > 0 ? '1' : '0.5' }">
            <div class="button" @click="download"><span>{{ t('cutoutExport.export') }}</span></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.export-dialog {
    font-size: var(--font-default-fontsize);
    position: fixed;
    top: 0;
    left: 0;
    width: 360px;
    background-color: #fff;
    border-radius: 8px;
    z-index: 999;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;
    cursor: default;

    .header {
        height: 54px;
        padding: 0 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        .title {
            color: rgba(0, 0, 0, 0.9);
        }

        .close {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(0, 0, 0, 0.75);
            border-radius: 4px;

            svg {
                width: 12px;
                height: 12px;
            }

            &:hover {
                background-color: #F5F5F5;
            }
        }
    }

    .dialog-body {
        outline: none;

        .exportList {
            padding: 0px 0px 6px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            box-sizing: border-box;

            .export_checkbox {
                color: rgba(0, 0, 0, 0.85);
                height: 48px;
                display: flex;
                align-items: center;

                span {
                    margin-left: 8px;
                }
            }

            .export_list {
                max-height: 384px;
                position: relative;
                width: 100%;
                overflow-x: hidden;
                padding: 0;
                margin: 0;
                padding-right: 8px;
                box-sizing: border-box;

                &::-webkit-scrollbar {
                    width: 7px;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 3.5px;
                    background: #efefef;
                }

                .export_item {
                    padding: 11px 0;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;

                    >svg {
                        position: fixed;
                        left: 100000px;
                        top: 100000px;
                        opacity: 0;
                        z-index: -2023;
                    }

                    .picture {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        width: 42px;
                        height: 42px;
                        margin: 0 8px;
                        background: #fafafa;
                        background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0), linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0);
                        background-position: 0 0, 5px 5px;
                        background-size: 10px 10px;
                        padding: 4px;
                        box-sizing: border-box;

                        img {
                            max-width: 100%;
                            max-height: 100%;
                            margin: auto;
                            display: block;
                        }
                    }

                    .content {
                        width: 200px;
                        height: 42px;

                        div {
                            display: flex;
                            align-items: center;

                            h5 {
                                height: 19.5px;
                                font-family: PingFangSC-Semibold;
                                font-size: 13px;
                                font-weight: 600;
                                line-height: 19.5px;
                                letter-spacing: 0;
                                color: rgba(0, 0, 0, 0.75);
                                margin: 0 8.5px 0 0;
                                max-width: 190px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }

                            svg {
                                width: 12px;
                                height: 12px;
                            }
                        }

                        p {
                            margin: 0;
                            color: rgba(0, 0, 0, 0.25);
                            width: 200px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-weight: 500;
                            line-height: 1.8;
                        }
                    }
                }
            }
        }
    }

    .export-dialog-footer {
        padding: 12px 46px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;

        .button {
            color: #ffffff;
            height: 32px;
            width: 100%;
            background-color: #1878f5;
            border-radius: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}

.checkbox {
    outline: none;
    cursor: pointer;
    position: relative;
}

.checkbox::after {
    position: absolute;
    top: 0;
    background-color: #fff;
    color: #fff;
    width: 14px;
    height: 14px;
    display: inline-block;
    visibility: visible;
    padding-left: 0px;
    text-align: center;
    content: ' ';
    border-radius: 2px;
    box-sizing: border-box;
    border: 1px solid #ddd;
}

.checkbox:checked::after {
    content: "";
    background-color: #1878f5;
    border-color: #1878f5;
    background-color: #1878f5;
}

.checkbox:checked::before {
    content: '';
    position: absolute;
    top: 1px;
    left: 4.5px;
    width: 3.5px;
    height: 8px;
    border: solid white;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
    z-index: 1;
}

.checkbox:indeterminate::after {
    content: "";
    background-color: #1878f5;
    border-color: #1878f5;
    background-color: #1878f5;
}

.checkbox:indeterminate::before {
    content: "";
    width: 8px;
    height: 2px;
    background-color: #ffffff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}
</style>