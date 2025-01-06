<script setup lang="ts">
import { XYsBounding } from '@/utils/common';
import { ArtboardView, Matrix, ShapeType, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
    view: number;
    shape: ShapeView;
    theme: string;
}

const props = defineProps<Props>();
const path = ref<string>('');
const is_image = ref(false);
const flex_abbr = ref<boolean>(true);
const icon_class = ref<string>('');

function updateIconClass() {
    const s = props.shape;
    if (s.data.mask) return icon_class.value = "layer-mask";
    if (s.isImageFill) return icon_class.value = "layer-image";
    const auto_layout = s.type === ShapeType.Artboard && !!(s as ArtboardView).autoLayout;
    if(auto_layout) return icon_class.value = "layer-auto-box";
    else return icon_class.value = `layer-${s.type}`;
}

function getPath() {
    const shape = props.shape;
    is_image.value = shape.isImageFill && !shape.mask;
    flex_abbr.value = shape.isPathIcon && !is_image.value && !shape.mask;
    if (!flex_abbr.value ) return updateIconClass();
    const f = shape.frame;
    const m = new Matrix();
    m.trans(-(f.x + f.width / 2), -(f.y + f.height / 2));
    if (!props.shape.isNoTransform()) {
        if (shape.rotation) m.rotate(shape.rotation / 180 * Math.PI);
    }
    const box = XYsBounding([
        {x: f.x, y: f.y},
        {x: f.x + f.width, y: f.y},
        {x: f.x + f.width, y: f.y + f.height},
        {x: f.x, y: f.y + f.height}
    ].map(p => m.computeCoord3(p)));

    const new_w = box.right - box.left;
    const new_h = box.bottom - box.top;
    let max_length = new_w;
    if (new_h > new_w) {
        max_length = new_h;
    }
    const ratio = 100 / max_length;
    m.scale(ratio);
    m.trans(50, 50);

    const _path = props.shape.getPath().clone();

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