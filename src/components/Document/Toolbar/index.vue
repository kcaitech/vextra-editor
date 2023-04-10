<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from "vue"
import { Context } from '@/context';
import OpenFile from "./OpenFile.vue";
import EditorTools from "./EditorTools.vue";
import UserInfo from './UserInfo.vue';

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
    <div class="toolbar">
        <OpenFile></OpenFile>
        <EditorTools :context="context" :selection="selection"></EditorTools>
        <UserInfo :context="props.context" ></UserInfo>
    </div>
</template>

<style scoped>
.toolbar {
    align-items: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow:row nowrap;
    padding: 0px 14px;
}
</style>