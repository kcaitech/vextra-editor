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
    const fillMask: StyleManage = { typeId: 'fill-mask-living', variables: [] }
    const shadowMask: StyleManage = { typeId: 'shadow-mask-living', variables: [] }
    const borderMask: StyleManage = { typeId: 'border-mask-living', variables: [] }
    const blurMask: StyleManage = { typeId: 'blur-mask-living', variables: [] }
    const radiusMask: StyleManage = { typeId: 'radius-mask-living', variables: [] }
    masks.variables.forEach(v => {
        if (v.typeId === 'fill-mask-living') {
            fillMask.variables.push(v);
        } else if (v.typeId === 'shadow-mask-living') {
            shadowMask.variables.push(v);
        } else if (v.typeId === 'border-mask-living') {
            borderMask.variables.push(v);
        } else if (v.typeId === 'blur-mask-living') {
            blurMask.variables.push(v);
        } else if (v.typeId === 'radius-mask-living') {
            radiusMask.variables.push(v);
        }
    })
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