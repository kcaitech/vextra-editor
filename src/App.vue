<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import { LzData } from './data/data/lzdata';
import { importDocument } from '@/io/import/sketch/documentio';
import { Document } from "./data/data/document";
import DocumentVue from "@/components/Document/index.vue";
import HomeVue from "@/components/Home/index.vue";

const props = defineProps<{ openLocalFile: (onReady: (data: LzData) => void, file?: File) => void, openRemoteFile: (fid: string, onReady: (data: Document) => void) => void }>();
// const dataReady = ref<boolean>(false);
const curDoc = shallowRef<Document | undefined>(undefined);

function importData(lzData: LzData) {
    importDocument(lzData).then((core: Document) => {
        curDoc.value = core;
    })
}

function openLocalFile(file?: File) {
    props.openLocalFile(importData, file);
}

function openRemoteFile(fid: string) {
    props.openRemoteFile(fid, (doc: Document) => {
        curDoc.value = doc;
    });
}

onMounted(() => {
    // props.openLocalFile(importData);
})

onUnmounted(() => {

})

</script>

<template>
    <HomeVue v-if="curDoc == undefined" @openlocalfile="openLocalFile" @openremotefile="openRemoteFile"/>
    <DocumentVue v-if="curDoc != undefined" :data="curDoc" />
</template>

<style lang="scss">
html {
    width: 100%;
    height: 100%;
    > body {
        font-family: var(--font-family);
        overflow: hidden;
        margin: 0px;
        width: 100%;
        height: 100%;
        user-select: none;
        > #app {
            display: flex;
            flex-flow: column nowrap;
            width: 100%;
            height: 100%;
        }
    }
}
    
</style>
