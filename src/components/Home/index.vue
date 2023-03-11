<script setup lang="ts">
import { defineEmits, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import DropFile from './DropFile.vue';
import Examples from './Examples.vue'
const { t } = useI18n();
const emit = defineEmits<{
    (e: "openlocalfile", file?: File): void;
    (e: "openremotefile", fid: string): void;
}>();

function onClick(e: Event) {
    e.stopPropagation();
    emit("openlocalfile");
}
// function onClickRemote(e: Event) {
//     e.stopPropagation();
//     emit("openremotefile", '128d50e9-0705-42c6-9f51-f9a049de33aa');
// }
function onFilePick(f: File) {
    // console.log('filepick', f)
    emit("openlocalfile", f);
}
function selectExample(uri: string) {
    emit("openremotefile", uri);
}

const fileList = reactive<{ name: string, uri: string }[]>([])
function list() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8000/list');
    xhr.onload = (ev: ProgressEvent) => {
        const data = xhr.response;
        // name: string;
        // prefix: string;
        // size: number;
        // etag: string;
        // lastModified: Date;

        console.log('list', data)

        if (data instanceof Array) {
            fileList.length = 0;
            data.forEach((d) => {
                const name = d.prefix.substring(0, d.prefix.length - 1)
                fileList.push({ name: name, uri: name })
            })
        }
    }
    xhr.responseType = 'json';
    xhr.send();
}
list();

</script>

<template>
    <DropFile v-on:pick="onFilePick">
        <Examples :examples="fileList" @select-example="selectExample"/>
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