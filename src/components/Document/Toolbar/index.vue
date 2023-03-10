<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from "vue"
import { Context } from '@/context';
import UndoRedo from './UndoRedo.vue';
import GroupUngroup from './GroupUngroup.vue';
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
        <UserInfo></UserInfo>
        <!-- <UndoRedo :repo="repo" /> back/go
        <div class="vertical-line" />-->
        <!-- <GroupUngroup :context="context" :selection="selection" /> -->

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
.vertical-line {
    width: 1px;
    height: 50%;
    background-color: gray;
    flex: 0 0 auto;
    margin-left: 5px;
    margin-right: 5px;
}
</style>