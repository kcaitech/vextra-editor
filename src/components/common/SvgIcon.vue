<template>
    <svg :class="svgClass" aria-hidden="true">
        <use :xlink:href="iconName" />
    </svg>
</template>
 
<script setup lang="ts">
import { computed } from 'vue'
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