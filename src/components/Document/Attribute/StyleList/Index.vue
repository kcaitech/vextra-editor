/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { StyleMangerMember, StyleSheet } from "@kcdesign/data";
import { mask_map } from "./map";

const props = defineProps<{
    context: Context;
}>();
type StyleManage = {
    typeId: string,
    variables: StyleMangerMember[]
}
const styleMasks = ref<StyleManage[]>([]);

function update() {
    styleMasks.value = [];
    let masks = ([...props.context.data.stylelib ?? []] as StyleSheet[]).find(s => s.id === props.context.data.id);
    if (!masks) return;
    const fillMask: StyleManage = { typeId: 'fill-mask', variables: [] }
    const shadowMask: StyleManage = { typeId: 'shadow-mask', variables: [] }
    const borderMask: StyleManage = { typeId: 'border-mask', variables: [] }
    const blurMask: StyleManage = { typeId: 'blur-mask', variables: [] }
    const radiusMask: StyleManage = { typeId: 'radius-mask', variables: [] }
    for (let i = 0; i < masks.variables.length; i++) {
        const v = masks.variables[i];
        if (v.disabled) continue;
        if (v.typeId === 'fill-mask') {
            fillMask.variables.push(v);
        } else if (v.typeId === 'shadow-mask') {
            shadowMask.variables.push(v);
        } else if (v.typeId === 'border-mask') {
            borderMask.variables.push(v);
        } else if (v.typeId === 'blur-mask') {
            blurMask.variables.push(v);
        } else if (v.typeId === 'radius-mask') {
            radiusMask.variables.push(v);
        }
    }
    styleMasks.value.push(fillMask, shadowMask, blurMask, radiusMask, borderMask);
    styleMasks.value = styleMasks.value.filter(m => m.variables.length !== 0);
}

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib') update();
}

onMounted(() => {
    update();
    props.context.data.watch(stylelib_watcher);
})
onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher);
})
</script>

<template>
    <div class="container">
        <template v-for="mask in styleMasks" :key="mask.typeId">
            <component :is="mask_map.get(mask.typeId)" :data="mask.variables" :context="props.context"></component>
        </template>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    height: auto;
}
</style>