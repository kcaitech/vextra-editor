<template>
    <div class="list">
        <div class="list-item" v-for=" item  in lists" :key="item.document.id">
            {{ item.document.name }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getDoucment } from './files'

const lists = ref<any[]>([])

onMounted(async () => {
    lists.value = await getDoucment()
})
</script>
<style lang="scss" scoped>
.list {
    height: 100%;
    overflow-y: scroll;
}
</style>
