<script setup lang="ts">
import { defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import DropFile from './DropFile.vue';
import Examples from './Examples.vue'
const { t } = useI18n();
const emit = defineEmits<{
    (e: "openlocalfile", file?: File): void;
    (e: "openremotefile"): void;
}>();

function onClick(e: Event) {
    e.stopPropagation();
    emit("openlocalfile");
}
function onClickRemote(e: Event) {
    e.stopPropagation();
    emit("openremotefile");
}
function onFilePick(f: File) {
    // console.log('filepick', f)
    emit("openlocalfile", f);
}
</script>

<template>
    <DropFile v-on:pick="onFilePick">
        <!-- <Examples :examples="[{name: 'aaa', url: ''}]"/> -->
    </DropFile>
</template>

<style scoped>
div {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
}

button {
    width: 200px;
    height: 100px;
}
</style>