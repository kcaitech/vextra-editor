<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import { importDocument } from '@/io/import/sketch/documentio';
import { Document } from "./data/data/document";
import DocumentVue from "@/components/Document/index.vue"
import HomeVue from "@/components/Home/index.vue"
import { Zip } from "@pal/zip";
import { LzDataLocal } from './io/import/sketch/lzdatalocal'; // todo
import { importDocument as importRemote } from './data/io/import';
import { Repository } from './data/data/transact';

const props = defineProps<{}>();
// const dataReady = ref<boolean>(false);
const curDoc = shallowRef<Document | undefined>(undefined);
const curRepo = shallowRef<Repository | undefined>(undefined);

function openLocalFile(file?: File) {
    if (!file) return;
    const lzdata = new LzDataLocal(new Zip(file));
    const repo = new Repository();
    importDocument(file.name, lzdata, repo).then((document) => {
        curRepo.value = repo;
        curDoc.value = document;
        window.document.title = document.name;
    })
}

function openRemoteFile(name: string, fid: string) {
    const repo = new Repository();
    importRemote('http://localhost:8000/', fid, "", name, repo).then((document) => {
        curRepo.value = repo;
        curDoc.value = document;
        window.document.title = document.name;
    })
}

onMounted(() => {

})

onUnmounted(() => {

})

</script>

<template>
    <HomeVue v-if="curDoc == undefined" @openlocalfile="openLocalFile" @openremotefile="openRemoteFile"/>
    <DocumentVue v-if="curDoc != undefined && curRepo != undefined" :data="curDoc" :repo="curRepo" />
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
