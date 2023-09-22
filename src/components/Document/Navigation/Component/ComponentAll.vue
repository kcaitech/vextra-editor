<script lang="ts" setup>
import { Context } from '@/context';
import ComponentPageCard from './ComponentPageCard.vue';
import ComponentPageList from './ComponentPageList.vue';
const props = defineProps<{
    type: string
    context: Context
    contents: any[]
}>()
</script>

<template>
    <div class="card" v-if="type === 'card'">
        <ComponentPageCard :context="context" :contents="contents">
        </ComponentPageCard>
    </div>
    <div class="list" v-if="type === 'list'">
        <ComponentPageList :context="context" :contents="contents">
        </ComponentPageList>
    </div>
</template>

<style scoped lang="scss"></style>