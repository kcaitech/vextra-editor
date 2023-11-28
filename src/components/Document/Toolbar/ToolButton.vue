<template>
    <div ref="toolButtonEl"
        :class="{ 'tool-button': true, 'tool-button-invalid': invalid, 'tool-button-selected': !!props.selected }">
        <slot />
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
const props = defineProps<{ valid?: boolean, selected?: boolean }>();

const toolButtonEl = ref<HTMLDivElement>();

defineExpose({
    toolButtonEl
})

const invalid = computed(() => {
    return props.valid === undefined ? false : !props.valid;
})

</script>
<style scoped>
.tool-button {
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 2px;
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
.tool-button:active {
    background-color: #1878F5;
}

.tool-button-invalid {
    color: var(--grey-light);
}

.tool-button-selected {
    background-color: var(--active-color);
}

.tool-button-selected:hover {
    background-color: var(--active-color);
}
</style>
