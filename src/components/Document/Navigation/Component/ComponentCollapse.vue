<script lang="ts" setup>
import { Context } from '@/context';
import ComponentAll from './ComponentAll.vue';
import { ref } from 'vue';
import W from './W.vue';
const props = defineProps<{
    type: string
    context: Context
    item?: any
    index: number
}>()
const activeNames = ref(['1'])
</script>

<template>
    <el-collapse v-model="activeNames">
        <el-collapse-item :name="index">
            <template #title>{{item.name[0]}}</template>
            <ComponentAll :context="context" :type="type" :contents="item.contents" v-if="item.contents && item.contents.length"></ComponentAll>
            <W :context="props.context" :items="item.children" :type="props.type" v-if="item.children && item.children.length"></W>
        </el-collapse-item>
    </el-collapse>
</template>

<style scoped lang="scss">
.el-collapse {
    --el-collapse-border-color: none;

    :deep(.el-collapse-item__content) {
        padding-bottom: 10px;
    }
}
</style>