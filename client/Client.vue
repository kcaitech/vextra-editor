/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { IContext, DocumentProps, openDocument, DocumentVue } from '@/index';
import { supportedFormats } from '@/basic/consts';
import DropFile from '@/components/common/DropFile.vue';

const state = ref<"home"|"editor">("home")
const context = shallowRef<IContext | undefined>(undefined);

async function onPickFile(file: File) {
    const fmt = supportedFormats.find(f => file.name.endsWith(`.${f}`))
    if (!fmt) {
        console.log("Unsupported file format", fmt);
        return;
    };
    console.log("Opening file", file.name);
    const result = await openDocument({
        source: "file",
        file,
        fmt
    } as DocumentProps);
    if (!result) {
        console.log("Failed to open file", file.name);
        return;
    };
    context.value = result;
    result.selection.selectPage(result.data.pagesList[0]?.id);
    state.value = "editor"
}

</script>

<style scoped>
.copyright-footer {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: 12px;
    color: #666;
}

.copyright-link {
    text-decoration: none;
    color: #666;
    /* transition: color 0.3s ease; */
}

.copyright-link:hover {
    color: #1c7dff;
}
</style>

<template>
    <DropFile v-if="state==='home'" @pick="onPickFile"/>
    <DocumentVue v-if="state==='editor' && context" :context="context"/>
    
    <footer class="copyright-footer">
        <a href="https://kcaitech.com" target="_blank" class="copyright-link">
            Copyright (c) 2023-2025 KCai Technology
        </a>
    </footer>
</template>
