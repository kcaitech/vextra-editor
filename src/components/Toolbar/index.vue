<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from "vue"
import { Context } from '@/context';
import UndoRedo from './UndoRedo.vue';
const props = defineProps<{context: Context}>();
const repo = shallowRef(props.context.repo);
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
    <UndoRedo :repo="repo"/>
</template>

<style scoped>

</style>