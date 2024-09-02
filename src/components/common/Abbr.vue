<script setup lang="ts">
import { XYsBounding } from '@/utils/common';
import { Artboard, Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
    view: number;
    shape: ShapeView;
    theme: string;
}

const props = defineProps<Props>();
const path = ref<string>('');
const is_image = ref(false);
const is_auto_layout = ref(false);
const flex_abbr = ref<boolean>(true);
const icon_class = ref<string>('');

function updateIconClass() {
    const s = props.shape;
    if (s.data.mask) return icon_class.value = "layer-mask";
    if (s.isImageFill) return icon_class.value = "layer-image";
    if(is_auto_layout.value) return icon_class.value = "layer-auto-box";
    else return icon_class.value = `layer-${s.type}`;
}


function getPath() {
    const shape = props.shape.data;
    is_image.value = shape.isImageFill && !shape.mask;
    is_auto_layout.value = !!(shape as Artboard).autoLayout;
    flex_abbr.value = shape.isPathIcon && !is_image.value && !shape.mask && !is_auto_layout;

    if (!flex_abbr.value) return updateIconClass();

    const f = shape.frame;
    const m = new Matrix();
    m.trans(-f.width / 2, -f.height / 2);
    if (!props.shape.isNoTransform()) {
        if (shape.rotation) m.rotate(shape.rotation / 180 * Math.PI);
    }
    const box = XYsBounding(
        [
            { x: 0, y: 0 },
            { x: f.width, y: 0 },
            { x: f.width, y: f.height },
            { x: 0, y: f.height }
        ].map(p => m.computeCoord3(p))
    );

    const new_w = box.right - box.left;
    const new_h = box.bottom - box.top;
    let max_length = new_w;
    if (new_h > new_w) {
        max_length = new_h;
    }
    const ratio = 100 / max_length;
    m.scale(ratio);
    m.trans(50, 50);

    const _path = props.shape
        .getPath()
        .clone();

    _path.transform(m);
    path.value = _path.toString();
}

const stop = watch(() => props.view, getPath);
onMounted(getPath);
onUnmounted(stop);
</script>
<template>
<div class="abbr-container">
    <svg v-if="flex_abbr" viewBox="-12 -12 124 124">
        <path :d="path" stroke-width="10" fill="none" :stroke="theme" stroke-linejoin="round"/>
    </svg>
    <svg-icon v-else-if="is_image" icon-class="layer-image" :fill="theme" :stroke="theme"/>
    <svg-icon v-else :icon-class="icon_class" :fill="theme"/>
</div>
</template>
<style scoped lang="scss">
.abbr-container {
    width: 13px;
    height: 13px;
    display: flex;
    align-items: center;

    > svg {
        width: 13px;
        height: 13px;
    }
}
</style>