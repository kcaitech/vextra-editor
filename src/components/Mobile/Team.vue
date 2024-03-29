<template>
   <div class="list">
      <TeamItem :data="teamlist"></TeamItem>
   </div>
</template>
<script setup lang="ts">
import { GetteamList, GetprojectLists } from './team'
import TeamItem from './Teamitem.vue';
import { ref } from 'vue';
import { onMounted } from 'vue';

const teamlist = ref<any[]>([])

const emits = defineEmits<{
    testevnt: [data: object]
}>()

onMounted(async () => {
   teamlist.value = await GetteamList()
})
</script>
<style lang="scss" scoped>
.list {
    height: 100%;
    overflow-y: scroll;
    padding: 0 14px;
}
</style>
