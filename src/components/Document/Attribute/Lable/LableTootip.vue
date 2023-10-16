<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
const props = defineProps<{
    copy_text: boolean,
    offset?: number,
    visible: boolean
}>();

onMounted(() => {
})
</script>

<template>
    <el-tooltip class="box-item" effect="dark" placement="left" :offset="offset || 10" :visible="visible">
        <template #content>
            <span>{{ copy_text ? '已复制' : '点击复制' }}</span>
        </template>
        <slot />
    </el-tooltip>
</template>

<style scoped lang="scss"></style>
