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
import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";
import { onMounted, onUnmounted, ref, reactive, toRaw, nextTick } from "vue";
import { Menu } from "@/context/menu";
import PageCard from "@/components/common/PageCard.vue";
import { XY } from "@/context/selection";
import { XYsBounding } from "@/utils/common";
import { useI18n } from 'vue-i18n';
import { message } from "@/utils/message";
import { getShadowMax } from "@/utils/cutout";

interface Props {
    context: Context;
}

type PCard = InstanceType<typeof PageCard>

const props = defineProps<Props>();

let renderItems: ShapeView[] = reactive([]);
const xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const width = ref<number>(0);
const height = ref<number>(0);
const background_color = ref<string>('transparent');
const pedal = ref<boolean>(false);
const pageCard = ref<PCard>();
const t = useI18n().t;

function write() {
    renderItems.length = 0;
    pedal.value = false;

    const selected = props.context.selection.selectedShapes
        .map(s => toRaw(s));

    if (!selected.length) return;

    renderItems = selected;

    const points: XY[] = [];
    for (let i = 0; i < renderItems.length; i++) {
        const shape = renderItems[i];
        const frame = shape.outerFrame;

        const { left, top, right, bottom } = getShadowMax(shape);

        const x = frame.x - left;
        const y = frame.y - top;
        const _right = frame.width + right;
        const _bottom = frame.height + bottom;
        points.push(...[
            { x, y },
            { x: _right, y },
            { x: _right, y: _bottom },
            { x, y: _bottom }
        ].map(p => shape.matrix2Parent().computeCoord3(p)));
    }

    const box = XYsBounding(points);
    xy.value = { x: box.left, y: box.top };
    width.value = box.right - box.left;
    height.value = box.bottom - box.top;

    pedal.value = true;

    nextTick(async () => {
        const blob = await getBlob();
        if (!blob) {
            message('info', t('clipboard.copyAsPNGFailed'));
            return;
        }
        const name = selected.map(i => i.name).toString();
        if (await props.context.clip.writeAsPNG(blob, name, width.value, height.value)) {
            message('info', t('clipboard.copyAsPNGSuccess'));
        } else {
            message('info', t('clipboard.copyAsPNGFailed'));
        }
        pedal.value = false;
    })
}

function updateThumbnail() {
    const page = props.context.selection.selectedPage!;

    let backgroundColor: string | undefined;
    let views: ShapeView[] = [];
    if (props.context.data.thumbnailViewId) {
        const thumbnailView = page.getView(props.context.data.thumbnailViewId);
        if (thumbnailView) {
            views = [thumbnailView];
        } else {
            const firstPage = props.context.data.pagesList[0];
            if (page.id !== firstPage.id) return;
            views = [...page.childs];
            backgroundColor = page.backgroundColor?.toHex() ?? undefined;
        }
    } else {
        const firstPage = props.context.data.pagesList[0];
        if (page.id !== firstPage.id) return;
        views = [...page.childs];
        backgroundColor = page.backgroundColor?.toHex() ?? undefined;
    }

    renderItems.length = 0;
    pedal.value = false;

    if (!views.length) return;

    renderItems = views;

    const points: XY[] = [];
    for (let i = 0; i < renderItems.length; i++) {
        const shape = renderItems[i];
        const frame = shape.outerFrame;

        const { left, top, right, bottom } = getShadowMax(shape);

        const x = frame.x - left;
        const y = frame.y - top;
        const _right = frame.width + right;
        const _bottom = frame.height + bottom;
        points.push(...[
            { x, y },
            { x: _right, y },
            { x: _right, y: _bottom },
            { x, y: _bottom }
        ].map(p => shape.matrix2Parent().computeCoord3(p)));
    }

    const box = XYsBounding(points);
    xy.value = { x: box.left, y: box.top };
    width.value = box.right - box.left;
    height.value = box.bottom - box.top;

    pedal.value = true;

    nextTick(async () => {
        getBlob(backgroundColor).then((blob) => {
            if (!blob) return;
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const uint8Array = new Uint8Array(arrayBuffer);
                console.log('update thumbnail');
                props.context.net?.genThumbnail('thumbnail', 'image/png', uint8Array);
            }
            reader.readAsArrayBuffer(blob);
        });

        pedal.value = false;
    })
}

/**
 * @description quality = 0.5
 */
function write4LazyLoader(target: ShapeView) {
    renderItems.length = 0;
    pedal.value = false;

    const selected = [target].map(s => toRaw(s));
    if (!selected.length) {
        return;
    }

    renderItems = selected;

    const points: XY[] = [];
    for (let i = 0; i < renderItems.length; i++) {
        const shape = renderItems[i];
        const frame = shape.outerFrame;

        const { left, top, right, bottom } = getShadowMax(shape);

        const x = frame.x -left;
        const y = frame.y -top;
        const _right = frame.width + right;
        const _bottom = frame.height + bottom;
        points.push(
            ...[
                { x, y },
                { x: _right, y },
                { x: _right, y: _bottom },
                { x, y: _bottom }
            ].map(p => shape.matrix2Root().computeCoord3(p))
        )
    }

    const box = XYsBounding(points);
    const page = props.context.selection.selectedPage!;
    xy.value = { x: box.left - page.frame.x, y: box.top - page.frame.y };
    width.value = box.right - box.left;
    height.value = box.bottom - box.top;

    pedal.value = true;

    nextTick(async () => {
        const b64 = await getBase64();
        if (!b64) {
            return;
        }
        emits('loaded', b64);
        pedal.value = false;
    })
}

const emits = defineEmits<{
    (e: 'loaded', b64: string): void;
}>();

function getBlob(backgroundColor?: string): Promise<Blob | null> {
    const svg = pageCard.value?.pageSvg as SVGElement;
    return new Promise((resolve) => {
        if (!svg) return resolve(null);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return resolve(null);

        const _svg = svg.cloneNode(true) as SVGSVGElement;

        document.body.appendChild(_svg);
        const { width, height } = _svg.viewBox.baseVal;
        _svg.setAttribute('width', `${width}`);
        _svg.setAttribute('height', `${height}`);
        canvas.width = width;
        canvas.height = height;
        if (backgroundColor) {
            context.save();
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, width, height);
            context.restore();
        }
        const svgString = new XMLSerializer().serializeToString(_svg);
        document.body.removeChild(_svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.onload = async () => {
            context.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        }
        img.onerror = (err) => {
            console.error(err);
            resolve(null)
        }
    })
}

function getBase64(): Promise<string | null> {
    const svg = pageCard.value?.pageSvg as SVGElement;
    return new Promise((resolve) => {
        if (!svg) {
            resolve(null);
            return;
        }
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            resolve(null);
            return;
        }

        const _svg = svg.cloneNode(true) as SVGSVGElement;

        document.body.appendChild(_svg);
        const { width, height } = _svg.viewBox.baseVal;
        _svg.setAttribute('width', `${width}`);
        _svg.setAttribute('height', `${height}`);
        canvas.width = width;
        canvas.height = height;
        const svgString = new XMLSerializer().serializeToString(_svg);
        document.body.removeChild(_svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.onload = () => {
            context.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 1))
        }
        img.onerror = (err) => {
            console.error(err);
            resolve(null)
        }
    })
}

function menuWatcher(t: number, target: ShapeView) {
    if (t === Menu.WRITE_MEDIA) {
        write();
    } else if (t === Menu.WRITE_MEDIA_LAZY) {
        write4LazyLoader(target);
    } else if (t === Menu.GEN_THUMBNAIL) {
        updateThumbnail();
    }
}

onMounted(() => {
    props.context.menu.watch(menuWatcher);
})
onUnmounted(() => {
    props.context.menu.unwatch(menuWatcher);
})
</script>

<template>
<div v-if="pedal" class="pedal">
    <PageCard ref="pageCard" :background-color="background_color"
              :view-box="`${xy.x} ${xy.y} ${width} ${height}`"
              :shapes="renderItems" :width="width" :height="height"></PageCard>
</div>
</template>

<style scoped lang="scss">
.pedal {
    position: fixed;
    pointer-events: none;
    top: 10000px;
    left: 0;
    width: 600px;
    height: 600px;
    overflow: visible;
}
</style>