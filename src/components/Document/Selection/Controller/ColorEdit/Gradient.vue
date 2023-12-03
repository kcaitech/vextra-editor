<script setup lang="ts">
import { Context } from '@/context';
import { GradientType } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { gradient_map } from "./map";
import { dbl_action } from '@/utils/mouse_interactive';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const _g_type = ref<GradientType>(GradientType.Linear);
function init() {
    console.log('gradient mode init');
    _g_type.value = props.context.color.gradient?.gradientType || GradientType.Linear;
}
function down(e: MouseEvent) {
    console.log('gradient-down');
    e.stopPropagation();
    if (dbl_action()) {
        props.context.color.switch_editor_mode(false);
    }
}
onMounted(init)
</script>
<template>
    <div class="gradient" @mousedown.stop="down">
        <component :is="gradient_map.get(_g_type)"></component>
    </div>
</template>
<style scoped lang="scss">
.gradient {
    width: 100%;
    height: 100%;
    background-color: rgba($color: #000000, $alpha: 0.3);
    position: absolute;
    z-index: 9;
}
</style>