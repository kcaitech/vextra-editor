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

    if (!selected.length) {
        return;
    }

    renderItems = selected;

    const points: XY[] = [];
    for (let i = 0; i < renderItems.length; i++) {
        const shape = renderItems[i];
        const frame = shape.frame;
        points.push(
            ...[
                { x: 0, y: 0 },
                { x: frame.width, y: 0 },
                { x: frame.width, y: frame.height },
                { x: 0, y: frame.height }
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
        const blob = await getBase64();
        if (!blob) {
            message('info', t('clipboard.copyAsPNGFailed'));
            return;
        }
        const writeResult = props.context.workspace.clipboard.writeBlob(blob);
        if (writeResult) {
            message('info', t('clipboard.copyAsPNGSuccess'));
        } else {
            message('info', t('clipboard.copyAsPNGFailed'));
        }
        pedal.value = false;
    })
}

function getBase64(): Promise<Blob | null> {
    const svg = pageCard.value.pageSvg as SVGElement;
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
        // _svg.setAttribute('style', "transform: matrix(2, 0, 0, 2, 0, 0); 'transform-origin': left top;")
        document.body.appendChild(_svg);
        const { width, height } = _svg.viewBox.baseVal;
        canvas.width = width;
        canvas.height = height;
        const svgString = new XMLSerializer().serializeToString(_svg);
        document.body.removeChild(_svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.onload = () => {
            context.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        }
        img.onerror = () => {
            resolve(null)
        }
    })
}

function menuWatcher(t: number) {
    if (t === Menu.WRITE_MEDIA) {
        write();
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