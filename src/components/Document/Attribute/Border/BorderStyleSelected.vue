<script lang="ts" setup>
import { SelectItem } from '@/components/common/Select.vue';
import { } from 'vue'
const props = defineProps<{
    data: SelectItem
}>();
</script>

<template>
    <div class="item-container">
        <span>{{ props.data?.content }}</span>
        <svg-icon :icon-class="props.data?.value || ''"></svg-icon>
    </div>
</template>

<style scoped lang="scss">
.item-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;

    >span {
        flex: 0 0 40px;
    }

    >svg {
        width: calc(100% - 40px);
        height: 100%;
    }
}
</style>