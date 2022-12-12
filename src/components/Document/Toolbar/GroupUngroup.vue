<script setup lang="ts">
import { Selection } from '@/context/selection';
import { Artboard } from '@/data/artboard';
import { Page } from '@/data/page';
import { GroupShape } from '@/data/shape';
import { defineProps, computed, onMounted, onUnmounted, ref } from 'vue';
import Icon from "@/components/common/Icon.vue";
import { Context } from '@/context';
const groupsvg = require("@/assets/group.svg")
const ungroupsvg = require("@/assets/ungroup.svg")

const props = defineProps<{ context: Context, selection: Selection }>();
const editor = computed(() => {
    if (props.selection.selectedPage == undefined) {
        throw new Error("No Selected Page?");
    }
    return props.context.editor4Page(props.selection.selectedPage);
})

const NOGROUP = 0;
const GROUP = 1;
const UNGROUP = 2;
const state = ref(0);
const preState = ref(2);
function setState(s: number) {
    if (state.value !== NOGROUP) preState.value = state.value;
    state.value = s;
}
const updater = () => {
    const len = props.selection.selectedShapes.length;
    if (len === 0) {
        setState(NOGROUP);
    } else if (len === 1) {
        const shape = props.selection.selectedShapes[0];
        if (shape instanceof GroupShape && !(shape instanceof Artboard || shape instanceof Page)) {
            setState(UNGROUP);
        } else {
            setState(NOGROUP);
        }
    } else {
        let val = GROUP;
        for (let i = 0; i < len; i++) {
            const shape = props.selection.selectedShapes[i];
            if (shape instanceof Artboard || shape instanceof Page) {
                val = UNGROUP;
                break;
            }
        }
        setState(val);
    }
}
onMounted(() => {
    props.selection.watch(updater);
    updater();
})
onUnmounted(() => {
    props.selection.unwatch(updater);
})

const groupClick = () => {
    console.log("group")
    updater();
    if (state.value === GROUP) {
        editor.value.group(props.selection.selectedShapes);
    }
}
const ungroupClick = () => {
    console.log("ungroup")
    updater();
    if (state.value === UNGROUP) {
        editor.value.ungroup(props.selection.selectedShapes[0] as GroupShape);
    }
}
const nogroupClick = () => {
    console.log("no-group")
}

</script>

<template>
    <div class="group">
        <Icon :onclick="groupClick" :valid="true" :selected="false" :icon="groupsvg" v-if="state === GROUP"></Icon>
        <Icon :onclick="ungroupClick" :valid="true" :selected="false" :icon="ungroupsvg" v-if="state === UNGROUP"></Icon>
        <Icon :onclick="nogroupClick" :valid="false" :selected="false" :icon="preState === GROUP ? groupsvg : ungroupsvg" v-if="state === NOGROUP"></Icon>
    </div>
</template>

<style scoped>
div.group {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
}
</style>