<template>
    <img :src="icon" :class="svgClass" aria-hidden="true"/>
</template>
 
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ icon: string, className?: string }>();
const svgClass = computed(() => {
    if (props.className) {
        return 'svg-icon ' + props.className
    } else {
        return 'svg-icon'
    }
})
</script>