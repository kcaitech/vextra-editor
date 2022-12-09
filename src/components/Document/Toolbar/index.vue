<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from "vue"
import { Context } from '@/context';
import UndoRedo from './UndoRedo.vue';
import GroupUngroup from './GroupUngroup.vue'

const props = defineProps<{ context: Context }>();
const repo = shallowRef(props.context.repo);
const selection = shallowRef(props.context.selection);
function watcher() {
    repo.value = props.context.repo;
}
onMounted(() => {
    props.context.watch(watcher);
})
onUnmounted(() => {
    props.context.unwatch(watcher);
})
</script>

<template>
    <UndoRedo :repo="repo" />
    <div class="vertical-line" />
    <GroupUngroup :context="context" :selection="selection" />
</template>

<style scoped>
div.vertical-line {
    width: 1px;
    height: 100%;
    background-color: gray;
    flex: 0 0 auto;
}
</style>