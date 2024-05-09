<template>
   <div class="list">
      <TeamItem :data="teamlist" :tips="tips"></TeamItem>
   </div>
</template>

<script setup lang="ts">
import TeamItem from './TeamItem.vue';
import { onMounted } from 'vue';
import { useCounterStore } from './team'
import { storeToRefs } from 'pinia'

const store = useCounterStore()
const { teamlist,tips  } = storeToRefs(store)
const { GetteamList } = store

onMounted(() => {
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
