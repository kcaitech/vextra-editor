<script setup lang="ts">
import { Context } from '@/context';
import ComponentCollapse from './ComponentCollapse.vue';
interface Props {
    context: Context
    items: []
    type: string
}
const props = defineProps<Props>();
</script>
<template>
    <ComponentCollapse v-for="(item, index) in props.items" :key="index" :context="props.context" :type="type" :item="item" :index="index"></ComponentCollapse>
</template>
<style lang="scss" scoped>
.el-collapse {
    --el-collapse-border-color: none;

    :deep(.el-collapse-item__content) {
        padding-bottom: 10px;
    }
    :deep(.el-icon svg) {
        display: none;
    }
}
</style>