<script setup lang="ts">
import { Context } from '@/context';
import Rect from './Buttons/Rect.vue';
import Ellipse from './Buttons/Ellipse.vue';
import Line from '../Content/Line.vue';
import Arrow from './Buttons/Arrow.vue';
import { ref } from 'vue';

interface Props {
    x: number,
    y: number,
    context: Context,
    width?: number,
    site?: { x: number, y: number },
    active: boolean,
}
const props = defineProps<Props>();

</script>
<template>
    <div ref="shapeMenu" class="shapeMenu" @mousemove.stop>
        <div class="item"></div>
    </div>
</template>
<style scoped lang="scss">

</style>