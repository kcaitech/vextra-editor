<script lang="ts" setup>
import { computed } from 'vue'
import { SelectItem } from '@/components/common/Select.vue'
const props = defineProps<{ data: SelectItem }>();
const emit = defineEmits<{
    (e: "select", data: SelectItem): void;
}>();

function select() {
    emit('select', props.data);
}
const isEnd = computed<boolean>(() => {
    return props.data.content.startsWith('end');
})
</script>
<template>
    <div class="border-front-style-item-container" @click="select">
        <svg-icon :class="{ isEnd }" :icon-class="props.data.value"></svg-icon>
    </div>
</template>
<style scoped lang="scss">
.border-front-style-item-container {
    height: 32px;
    width: 100%;
    color: var(--theme-color);
    padding: 0 var(--default-padding);
    margin-left: var(--default-margin-half);
    box-sizing: border-box;
    display: flex;
    align-items: center;

    >svg {
        width: 100%;
        height: 100%;
        color: black;
    }

    >.isEnd {
        transform: rotate(180deg);
    }
}
</style>