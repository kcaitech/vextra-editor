<script setup lang="ts">
import { ref } from 'vue';
interface Porps {
    valid?: boolean;
    selected?: boolean;
}
defineProps<Porps>();

const toolButtonEl = ref<HTMLDivElement>();
defineExpose({
    toolButtonEl
})

</script>
<template>
    <div ref="toolButtonEl"
        :class="{ 'tool-button': true, 'tool-button-invalid': !!valid, 'tool-button-selected': !!selected }">
        <slot />
    </div>
</template>

<style scoped>
.tool-button {
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
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
