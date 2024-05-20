<script setup lang="ts">

import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";

const props = defineProps<{
    context: Context
}>();

const ruleVisible = ref<boolean>(false);

function render() {
    ruleVisible.value = props.context.user.isRuleVisible;

    if (!ruleVisible.value) {
        return;
    }

}

function workspaceWatcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.ROOT_UPDATE) {
        render();
    }
}

function userWatcher(t: number) {
    if (t === User.RULE_STATUS_CHANGE) {
        render();
    }
}

onMounted(() => {
    props.context.workspace.watch(workspaceWatcher);
    props.context.user.watch(userWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.user.unwatch(userWatcher);
})
</script>
<template>
    <div v-if="ruleVisible" class="rule-container">
        <div class="contact-block"></div>
        <div class="d-hor"></div>
        <div class="d-ver"></div>
    </div>
</template>
<style scoped lang="scss">
.rule-container {
    width: 100%;
    height: 100%;
    pointer-events: none;
    position: relative;

    .contact-block {
        width: 20px;
        height: 20px;
        background-color: var(--theme-color-anti);
        box-sizing: border-box;
        border-right: 1px solid var(--grey);
        border-bottom: 1px solid var(--grey);
    }

    .d-hor {
        position: absolute;
        width: calc(100% - 20px);
        top: 0;
        left: 20px;
        height: 20px;
        box-sizing: border-box;
        border-bottom: 1px solid var(--grey);
        background-color: var(--theme-color-anti);
    }

    .d-ver {
        position: absolute;
        width: 20px;
        top: 20px;
        left: 0;
        height: calc(100% - 20px);
        box-sizing: border-box;
        border-right: 1px solid var(--grey);
        background-color: var(--theme-color-anti);
    }
}
</style>