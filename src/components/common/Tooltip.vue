<script setup lang="ts">
const props = defineProps<{
    content: string,
    offset?: number
}>();
</script>

<template>
    <el-tooltip class="box-item" effect="dark" :content="content" placement="bottom"
    :show-after="500" :offset="offset || 10" :hide-after="0">
        <slot />
    </el-tooltip>
</template>

<style scoped lang="scss">
</style>
