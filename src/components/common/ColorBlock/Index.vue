<script setup lang="ts">
import { Border, Color, Fill, FillType, Gradient } from "@kcdesign/data";
import { onUnmounted, ref, watch } from "vue";
import SolidPreview from "@/components/common/ColorBlock/SolidPreview.vue";

type Props = {
    colors: (Fill | Color | Border)[];
}
const props = defineProps<Props>();
type BlockType = 'solid' | 'pattern' | 'Gradient';

const fillsPreview = ref<{ type: BlockType, data: Color | Gradient | string }[]>([]);

function update() {
    const container = fillsPreview.value;
    container.length = 0;
    for (const c of props.colors) {
        if (c instanceof Color) {
            container.push({type: "solid", data: c});
        } else if (c instanceof Fill) {
            if (c.fillType === FillType.SolidColor) {
                container.push({type: "solid", data: c.color});
            } else if (c.fillType === FillType.Gradient) {
                container.push({type: "Gradient", data: c.gradient!});
            } else if (c.fillType === FillType.Pattern) {
                container.push({type: "pattern", data: ''})
            }
        } else {
            // todo border
        }
    }
    return container;
}

update();
onUnmounted(watch(() => props.colors, update));
</script>
<template>
    <div class="color-wrapper">
        <template v-for="(c, idx) in fillsPreview" :key="idx">
            <SolidPreview :params="c as any"/>
        </template>
    </div>
</template>
<style scoped lang="scss">
.color-wrapper {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    overflow: hidden;
}
</style>