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
import DropFile from '@/components/common/DropFile.vue';

import { IContext, DocumentProps, openDocument, DocumentVue } from '@/index';

const state = ref<"home"|"editor">("home")
const context = shallowRef<IContext | undefined>(undefined);

async function onPickFile(file: File) {
    const fmt =  ['vext', 'moss', 'sketch', 'fig'].filter(ext => file.name.endsWith(ext))[0]
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
    
    <footer style="position: fixed; bottom: 10px; left: 50%; transform: translateX(-50%); text-align: center; font-size: 12px; color: #666;">
        <a href="https://kcaitech.com" target="_blank" style="text-decoration: none; color: #666;">
            Copyright (c) 2023-2025 KCai Technology
        </a>
    </footer>
</template>
