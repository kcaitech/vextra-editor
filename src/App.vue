<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import { LzData } from './data/lzdata';
import { importDocument } from './io/sketch/documentio';
import { Document } from "./data/document";
import DocumentVue from "@/components/Document/index.vue"
import HomeVue from "@/components/Home/index.vue"

const props = defineProps<{ openLocalFile: (onReady: (data: LzData) => void) => void }>();
// const dataReady = ref<boolean>(false);
const curDoc = shallowRef<Document | undefined>(undefined);

function importData(lzData: LzData) {
    importDocument(lzData).then((core: Document) => {
        curDoc.value = core;
    })
}

function openLocalFile() {
    props.openLocalFile(importData);
}

onMounted(() => {
    // props.openLocalFile(importData);
})

onUnmounted(() => {

})

</script>

<template>
    <HomeVue v-if="curDoc == undefined" @openlocalfile="openLocalFile" />
    <DocumentVue v-if="curDoc != undefined" :data="curDoc" />
</template>

<style>
    :root {
        /*  */
        --theme-color: #2c2c2c;
        --theme-color-anti: white;
        --theme-color2: #f5f5f5;
        --theme-color3: #e0e0e0;
        --theme-color-line: #f0f0f0;
        --font-family: BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,apple color emoji,Noto Color Emoji,segoe ui emoji,segoe ui symbol;
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
