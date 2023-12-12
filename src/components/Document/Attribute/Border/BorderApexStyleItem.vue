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
    height: var(--default-input-height);
    width: 64%;
    padding: 0 12px;
    color: #333333;
    margin-left: var(--default-margin-half);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

    >svg {
        width: 100%;
        height: 100%;
    }

    >.isEnd {
        transform: rotate(180deg);
    }
}
</style>