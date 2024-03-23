<template>
    <div class="list">
        <FilesItem :data="lists"></FilesItem>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getDoucment } from './files'
import FilesItem from './FilesItem.vue';

const lists = ref<any[]>([])

onMounted(async () => {
    lists.value = await getDoucment()
})
</script>
<style lang="scss" scoped>
.list {
    height: 100%;
    overflow-y: scroll;
    padding: 0 14px;
}
</style>
