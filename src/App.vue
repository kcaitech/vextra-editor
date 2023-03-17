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
    importDocument(lzdata, repo).then((document) => {
        curRepo.value = repo;
        curDoc.value = document
    })
}

function openRemoteFile(fid: string) {
    const repo = new Repository();
    importRemote('http://localhost:8000/', fid, "", repo).then((document) => {
        curRepo.value = repo;
        curDoc.value = document
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

<style>
    :root {
        --theme-color: #2c2c2c;
        --theme-color-anti: white;
        --theme-color2: #f5f5f5;
        --theme-color3: #e0e0e0;
        --theme-color-line: #f0f0f0;
        --font-family: BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,apple color emoji,Noto Color Emoji,segoe ui emoji,segoe ui symbol;
        --default-radius: 4px;
        --default-padding: 16px;
        --default-margin: 12px;
        --default-fontsize: 10px;
        --coco-grey: #808080;
        --default-bold: 700
    }
    html {
        width: 100%;
        height: 100%;
    }
    body {
        font-family: var(--font-family);
        overflow: hidden;
        margin: 0px;
        width: 100%;
        height: 100%;
        user-select: none;
    }
    body #app {
        display: flex;
        flex-flow:column nowrap;
        width:100%;
        height:100%;
    }
</style>

<style scoped>
    div.vertical-line {
        width: 1px;
        height: 100%;
        background-color: var(--theme-color-line);
        flex: 0 0 auto;
    }
</style>
