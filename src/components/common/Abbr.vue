<script setup lang="ts">
import { XYsBounding } from '@/utils/common';
import { Matrix, ShapeType, ShapeView } from '@kcdesign/data';
import { onUnmounted } from 'vue';
import { onMounted, ref, watch } from 'vue';
import { computed } from 'vue';

interface Props {
    view: number
    shape: ShapeView
    theme: string
}

const props = defineProps<Props>();
const path = ref<string>('');

const flex_abbr = computed<boolean>(() => {
    return props.shape.isPathIcon;
});
const icon_class = computed<string>(() => {
    return `layer-${props.shape.type}`;
});

function getPath() {
    if (!flex_abbr.value) {
        return;
    }

    const shape = props.shape.data;

    const f = shape.frame;
    const m = new Matrix();
    m.trans(-f.width / 2, -f.height / 2);
    if (!props.shape.isNoTransform()) {
        if (shape.rotation) m.rotate(shape.rotation / 180 * Math.PI);
        // if (shape.isFlippedHorizontal) m.flipHoriz();
        // if (shape.isFlippedVertical) m.flipVert();
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

const e = watch(() => props.view, getPath);
onMounted(getPath);
onUnmounted(e);
</script>
<template>
    <div class="abbr-container">
        <svg v-if="flex_abbr" viewBox="-12 -12 124 124">
            <path :d="path" stroke-width="10" fill="none" :stroke="theme" stroke-linejoin="round"></path>
        </svg>
        <svg-icon v-else-if="props.shape.type === ShapeType.Image" :icon-class="icon_class" :fill="theme"
            :stroke="theme"></svg-icon>
        <svg-icon v-else :icon-class="icon_class" :fill="theme"></svg-icon>
    </div>
</template>
<style scoped lang="scss">
.abbr-container {
    width: 13px;
    height: 13px;
    display: flex;
    align-items: center;

    >svg {
        width: 13px;
        height: 13px;
    }
}
</style>