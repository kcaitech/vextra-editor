<template>
    <svg :class="svgClass" aria-hidden="true">
        <use :xlink:href="iconName" />
    </svg>
</template>
 
<script setup lang="ts">
import { computed, defineProps } from 'vue'
const props = defineProps<{ iconClass: string, className?: string }>();
const iconName = computed(() => {
    return `#icon-${props.iconClass}`
})
const svgClass = computed(() => {
    if (props.className) {
        return 'svg-icon ' + props.className
    } else {
        return 'svg-icon'
    }
})
</script>

<style scoped>
/* .svg-icon {
    width: 100%;
    height: 100%;
    fill: currentColor;
    overflow: hidden;
} */

</style>
