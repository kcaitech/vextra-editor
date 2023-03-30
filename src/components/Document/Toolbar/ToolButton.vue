<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 09:58:44
 * @FilePath: \kcdesign\src\components\Document\Toolbar\ToolButton.vue
-->
<template>
    <div ref="toolButtonEl" :class="{ 'tool-button': true, 'tool-button-invalid': invalid, 'tool-button-selected': !!props.selected }">
        <slot />
    </div>
</template>
<script setup lang="ts">
import { computed, defineProps, ref, defineExpose } from 'vue';
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
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
    overflow: hidden;
    cursor: pointer;
    box-sizing: border-box;
    color: #ffffff;
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
