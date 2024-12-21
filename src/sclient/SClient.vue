<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import DropFile from './DropFile.vue';
import { IContext, DocumentProps, openDocument, DocumentVue } from '../index';
const state = ref<"home"|"editor">("home")
const context = shallowRef<IContext | undefined>(undefined);
async function onPickFile(file: File) {
    const fmt =  ['moss', 'sketch', 'fig'].filter(ext => file.name.endsWith(ext))[0]
    if (!fmt) return;
    const result = await openDocument({
        source: "file",
        file,
        fmt: fmt as any
    } as DocumentProps);
    if (!result) return;
    context.value = result;

    // setTimeout(() => {
        result.selection.selectPage(result.data.pagesList[0]?.id);
        state.value = "editor"
    // }, 1000);
}

</script>

<template>
<DropFile v-if="state==='home'" @pick="onPickFile"/>
<DocumentVue v-if="state==='editor' && context" :context="context"/>
</template>


<style lang="scss">
html,
body {
    margin: 0;
    padding: 0;
    background-color: rgba(250, 250, 250, 1);
    font-family: var(--font-family);
    font-weight: var(--font-weight-regular);
    user-select: none; //禁止复制内容
    position: relative;
    overflow: hidden;
    --webkit-overflow-scrolling: touch;
    width: 100%;
    height: 100%;

    &::-webkit-scrollbar {
        height: 0;
        width: 0;
    }

}

.overlay {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

input,
button,
textarea {
    font-family: var(--font-family);
}

#app {
    position: absolute;
    width: 100%;
    height: 100%;
}

</style>