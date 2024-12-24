<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import DropFile from '@/components/common/DropFile.vue';

import { IContext, DocumentProps, openDocument, DocumentVue } from '@/index';

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
    result.selection.selectPage(result.data.pagesList[0]?.id);
    state.value = "editor"
}

</script>

<template>
    <DropFile v-if="state==='home'" @pick="onPickFile"/>
    <DocumentVue v-if="state==='editor' && context" :context="context"/>
</template>
