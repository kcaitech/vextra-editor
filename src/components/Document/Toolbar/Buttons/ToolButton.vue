<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    valid?: boolean;
    selected?: boolean;

    width?: number;
    height?: number;
}>();
const toolButtonEl = ref<HTMLDivElement>();
defineExpose({ toolButtonEl });
</script>
<template>
<div ref="toolButtonEl" :style="{
        width: width ? width +'px' : 'fix-content',
        height: height ? height +'px' : '32px',
    }"
     :class="{ 'tool-button': true, 'tool-button-invalid': !!valid, 'tool-button-selected': !!selected }">
    <slot/>
</div>
</template>

<style scoped>
.tool-button {
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    color: #ffffff;
    border-radius: 4px;
    cursor: pointer;
}

.tool-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.tool-button-invalid {
    color: var(--grey-light);
}

.tool-button-selected {
    background-color: var(--active-color) !important;
}
</style>
