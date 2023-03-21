<script setup lang="ts">
import { Selection } from '@/context/selection';
import { Artboard } from '@kcdesign/data/data/artboard';
import { Page } from '@kcdesign/data/data/page';
import { GroupShape } from '@kcdesign/data/data/shape';
import { defineProps, computed, onMounted, onUnmounted, ref } from 'vue';
// import Icon from "@/components/common/Icon.vue";
import { Context } from '@/context';
import ToolButton from "./ToolButton.vue"
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

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
        editor.value.group(props.selection.selectedShapes, t("shape.group_shape"));
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
        <ToolButton :onclick="groupClick" :valid="true" :selected="false" v-if="state === GROUP">
            <svg-icon  icon-class="group"></svg-icon>
        </ToolButton>
        <ToolButton :onclick="ungroupClick" :valid="true" :selected="false" v-if="state === UNGROUP">
            <svg-icon  icon-class="ungroup"></svg-icon>
        </ToolButton>
        <ToolButton :onclick="nogroupClick" :valid="false" :selected="false" v-if="state === NOGROUP">
            <svg-icon  :icon-class="preState === GROUP ? 'group' : 'ungroup'"></svg-icon>
        </ToolButton>
    </div>
</template>

<style scoped lang="scss">
div.group {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    width: 40px;
    > div {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ffffff;
        > svg {
            height: 70%;
            width: 70%;
        }
    }

}
</style>