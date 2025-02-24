<script setup lang="ts">
import { Border, Color, Fill, FillType, Gradient } from "@kcdesign/data";
import { onUnmounted, ref, watch } from "vue";
import { DEFAULT_IMAGE } from "@/context/atrribute";

import SolidPreview from "@/components/common/ColorBlock/SolidPreview.vue";
import GradientPreview from "@/components/common/ColorBlock/GradientPreview.vue";
import ImagePreview from "@/components/common/ColorBlock/ImagePreview.vue";

const compos = {
    'solid': SolidPreview,
    'gradient': GradientPreview,
    'pattern': ImagePreview
};

const props = defineProps<{
    colors: (Color | Fill | Border)[];
    size?: number,
    round?: boolean,
    disabledAlpha?: boolean
}>();
type BlockType = 'solid' | 'pattern' | 'gradient';

const fillsPreview = ref<{
    type: BlockType;
    data: Color | Gradient | string;
    disabledAlpha?: boolean;
}[]>([]);

function update() {
    const container = fillsPreview.value;
    container.length = 0;
    const { colors, disabledAlpha } = props;
    for (const c of colors) {
        if (c instanceof Color) {
            container.push({ type: "solid", data: c, disabledAlpha });
        } else if (c instanceof Fill) {
            if (c.fillType === FillType.SolidColor) {
                container.push({ type: "solid", data: c.color, disabledAlpha });
            } else if (c.fillType === FillType.Gradient) {
                container.push({ type: "gradient", data: c.gradient! });
            } else if (c.fillType === FillType.Pattern) {
                container.push({ type: "pattern", data: c.peekImage(true) || DEFAULT_IMAGE })
            }
        }
    }
}

update();
onUnmounted(watch(() => props.colors, update));
</script>
<template>
    <div :class="{ 'color-wrapper': true, round }" :style="{ width: (size || 16) + 'px', height: (size || 16) + 'px' }">
        <component v-for="(c, idx) in fillsPreview" :key="idx" :is="(compos[c.type])" :params="(c as any)" />
    </div>
</template>
<style scoped lang="scss">
.color-wrapper {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.45);

    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
    background-size: auto 50%;

    position: relative;
}

.round {
    border-radius: 50%;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.6);
}
</style>