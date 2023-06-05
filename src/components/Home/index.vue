<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DropFile from './DropFile.vue';
const { t } = useI18n();
const emit = defineEmits<{
    (e: "openlocalfile", file?: File): void;
}>();

function onFilePick(f: File) {
    // console.log('filepick', f)
    emit("openlocalfile", f);
}

</script>

<template>
    <DropFile v-on:pick="onFilePick"></DropFile>
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