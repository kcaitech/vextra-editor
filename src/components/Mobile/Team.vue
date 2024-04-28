<template>
   <div class="list">
      <TeamItem :data="list"></TeamItem>
   </div>
</template>

<script setup lang="ts">
import TeamItem from './TeamItem.vue';
import { onMounted } from 'vue';
import { useCounterStore } from './team'
import { storeToRefs } from 'pinia'

const store = useCounterStore()
const { list } = storeToRefs(store)
const { GetteamList } = store



onMounted(() => {
   window.document.title = '团队'
   GetteamList()
})
</script>

<style lang="scss" scoped>
.list {
   height: 100%;
   overflow-y: scroll;
   padding: 0 14px;
}
</style>
