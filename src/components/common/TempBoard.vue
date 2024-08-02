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
import { getShadowMax, getShapeBorderMax } from "@/utils/cutout";
// import CanvasKitInit from 'canvaskit-wasm';
import CanvasKitInit from "@kcdesign/canvaskit-wasm";

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

async function drawImage(img: CanvasImageSource) {
    const CanvasKit = await CanvasKitInit({
        locateFile: (file: string) => {
            console.log('__file__', file);
            return `/${file}`;
        }
    });
    const canvas = CanvasKit.MakeCanvas(375, 600);

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return dataURLToBlob(canvas.toDataURL('image/png', 0.5));
}

function dataURLToBlob(dataURL: string) {
    let arr = dataURL.split(',');
    let mine = (arr[0].match(/:(.*?);/) as any)[1];
    let __atob = atob(arr[1]);
    let n = __atob.length;
    let u8Array = new Uint8Array(n);
    while (n--) {
        u8Array[n] = __atob.charCodeAt(n);
    }
    return new Blob([u8Array], mine);
}

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
        const frame = shape.frame;

        const { left, top, right, bottom } = getShadowMax(shape);
        const { l_max, t_max, r_max, b_max } = getShapeBorderMax(shape);

        const x = frame.x - left - l_max;
        const y = frame.y - top - t_max;
        const _right = frame.width + (right + l_max + r_max);
        const _bottom = frame.height + (bottom + t_max + b_max);
        points.push(...[
            { x, y },
            { x: _right, y },
            { x: _right, y: _bottom },
            { x, y: _bottom }
        ].map(p => shape.matrix2Root().computeCoord3(p)));
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
        const writeResult = props.context.workspace.clipboard.writeBlob(blob);
        if (writeResult) {
            console.log('你这个都打印了')
            message('info', t('clipboard.copyAsPNGSuccess'));
        } else {
            message('info', t('clipboard.copyAsPNGFailed'));
        }
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
        const frame = shape.frame;

        const { left, top, right, bottom } = getShadowMax(shape);
        const { l_max, t_max, r_max, b_max } = getShapeBorderMax(shape);

        const x = -left - l_max;
        const y = -top - t_max;
        const _right = frame.width + (right + l_max + r_max);
        const _bottom = frame.height + (bottom + t_max + b_max);
        console.log(x, y, width, height);
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

function getBlob(): Promise<Blob | null> {
    const svg = pageCard.value?.pageSvg as SVGElement;
    return new Promise((resolve) => {
        if (!svg) return resolve(null);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return resolve(null);

        const _svg = svg.cloneNode(true) as SVGSVGElement;

        document.body.appendChild(_svg);
        const { width, height } = _svg.viewBox.baseVal;
        _svg.setAttribute('width', `${width * 2}`);
        _svg.setAttribute('height', `${height * 2}`);
        canvas.width = width * 2;
        canvas.height = height * 2;
        const svgString = new XMLSerializer().serializeToString(_svg);
        document.body.removeChild(_svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.onload = async () => {
            context.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
            // resolve(await drawImage(img));
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
            resolve(canvas.toDataURL('image/jpeg', 0.5))
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