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
    height: 80%;
    margin: 0 2px;
    border-radius: 2px;
    min-width: 28px;
    min-height: 28px;
    overflow: hidden;
    cursor: pointer;
    box-sizing: border-box;
    color: #ffffff;
    transition: 0.06s;
}

.tool-button:hover,
.tool-button:active {
    background-color: #000;
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
