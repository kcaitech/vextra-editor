/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { ImageLoader } from "@/imageLoader/index";
import { ref, onMounted, onUnmounted } from "vue";
import { Tool } from "@/context/tool";

const props = defineProps<{ context: Context }>();
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml';
const picker = ref<HTMLInputElement>();

function change(e: Event) {
    if (!e.target) return;
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    const loader = new ImageLoader(props.context);
    loader.insertImageByPackages(files, true);
    if (picker.value) (picker.value as HTMLInputElement).value = '';
}

function tool_watcher(t: number) {
    if (t === Tool.SELECT_IMAGE) picker.value?.click();
}

onMounted(() => {
    props.context.tool.watch(tool_watcher);
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
})
</script>

<template>
<input type="file" ref="picker" :accept="accept" :multiple="true" id="filepicker"
       @change="(e: Event) => { change(e) }"/>
</template>

<style scoped lang="scss">
#filepicker {
    display: none;
}
</style>