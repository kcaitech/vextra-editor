<script lang="ts" setup>
import Auto from '@/components/Document/Toolbar/PathEdit/Auto.vue'
import Curve from '@/components/Document/Toolbar/PathEdit/Curve.vue';
import PathClip from '@/components/Document/Toolbar/PathEdit/PathClip.vue';
import {Context} from "@/context";
import {Action} from "@/context/tool";
import {ref} from "vue";

interface Props {
    context: Context
    selected: Action
}

const props = defineProps<Props>();
const selected = ref<Action>(Action.AutoV);

function select(action: Action) {
    props.context.tool.setAction(action);
}

</script>
<template>
    <div class="wrapper">
        <Auto :active="selected === Action.AutoV" @select="select"></Auto>
        <Curve :active="selected === Action.Curve" @select="select"></Curve>
        <PathClip :active="selected === Action.PathClip" @select="select"></PathClip>
    </div>
</template>
<style scoped lang="scss">
.wrapper {
    height: 100%;
}
</style>