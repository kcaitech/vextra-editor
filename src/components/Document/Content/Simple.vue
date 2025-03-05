<script setup lang="ts">
import { Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
interface Props {
    shape: ShapeView
    matrix: Matrix
}
const props = defineProps<Props>();
let background_color = 'rgba(128, 128,128, 0.8)';
const x = ref<number>(0), y = ref<number>(0), width = ref<number>(0), height = ref<number>(0);
function init() {
    const s = props.shape, p = s.parent;
    if (!p) return;
    const box = s.boundingBox();
    const p2r = p.matrix2Root();
    p2r.multiAtLeft(props.matrix);
    const xy = p2r.computeCoord2(box.x, box.y), xy2 = p2r.computeCoord2(box.x + box.width, box.y + box.height);
    x.value = xy.x, y.value = xy.y, width.value = Math.abs(xy2.x - xy.x), height.value = Math.abs(xy2.y - xy.y);
    const fills = s.getFills();
    if (fills.length) {
        const fill = fills[0];
        if (!fill) return;
        const color = fill.color;
        background_color = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
    }
}
onMounted(init);
</script>
<template>
    <div :title="props.shape.name"
        :style="{ left: x + 'px', top: y + 'px', width: width + 'px', height: height + 'px', 'background-color': background_color }">
    </div>
</template>
<style scoped lang="scss">
div {
    position: absolute;
}
</style>