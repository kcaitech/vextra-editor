<script lang="ts" setup>
import { SelectItem } from '@/components/common/Select.vue';
const props = defineProps<{
    data: SelectItem | null
}>();
</script>

<template>
    <div class="item-container">
        <svg-icon :icon-class="props.data?.value || ''"/>
        <span>{{ props.data?.content }}</span>
    </div>
</template>

<style scoped lang="scss">
.item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;

    >span {
        flex: 0 0 40px;
    }

    >svg {
        width: calc(100% - 74px);
        height: 100%;
        color: #BFBFBF;
        margin-right: 12px;
    }
}
</style>