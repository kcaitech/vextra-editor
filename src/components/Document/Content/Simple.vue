<script setup lang="ts">
import { Matrix, Shape } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
interface Props {
    shape: Shape
    matrix: Matrix
}
const props = defineProps<Props>();
let background_color = 'rgba(128, 128,128, 0.8)';
const x = ref<number>(0), y = ref<number>(0), width = ref<number>(0), height = ref<number>(0);
function init() {
    const s = props.shape;
    const m2r = s.matrix2Root();
    m2r.multiAtLeft(props.matrix);
    const f = s.frame;
    const xy = m2r.computeCoord2(0, 0), xy2 = m2r.computeCoord2(f.width, f.height);
    x.value = xy.x, y.value = xy.y, width.value = xy2.x - xy.x, height.value = xy2.y - xy.y;
    if (s.style.fills.length) {
        const fill = s.style.fills[0];
        if (!fill) return;
        const color = fill.color;
        background_color = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`
    }
}
onMounted(() => {
    init();
})
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