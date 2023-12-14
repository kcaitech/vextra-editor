<script lang="ts" setup>
import Auto from '@/components/Document/Toolbar/PathEdit/Auto.vue'
import Curve from '@/components/Document/Toolbar/PathEdit/Curve.vue';
import PathClip from '@/components/Document/Toolbar/PathEdit/PathClip.vue';
import { Context } from "@/context";
import { Action } from "@/context/tool";
import { onMounted, onUnmounted, ref } from "vue";

interface Props {
    context: Context
    selected: Action
}

const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();

const props = defineProps<Props>();
const selected = ref<Action>(Action.AutoV);

function select(action: Action) {
    emit("select", action);
}

function is_curve_active() {
    return props.selected === Action.Curve;
}

let o: Action;

function keyboard_up_watcher(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) {
        return;
    }
    if (['MetaLeft', 'ControlLeft'].includes(e.code)) {
        props.context.tool.setAction(o);
        document.removeEventListener('keyup', keyboard_up_watcher);
    }
}

function keyboard_down_watcher(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) {
        return;
    }
    if (e.repeat) {
        return;
    }
    if (['MetaLeft', 'ControlLeft'].includes(e.code)) {
        o = props.context.tool.action;

        if (o === Action.PathClip) {
            return;
        }

        if (o !== Action.Curve) {
            props.context.tool.setAction(Action.Curve);
            document.addEventListener('keyup', keyboard_up_watcher);
        }
    }
}

onMounted(() => {
    document.addEventListener('keydown', keyboard_down_watcher);
})
onUnmounted(() => {
    document.removeEventListener('keydown', keyboard_down_watcher);
})
</script>
<template>
    <div class="wrapper">
        <Auto :active="props.selected === Action.AutoV" @select="select"></Auto>
        <Curve :active="is_curve_active()" @select="select"></Curve>
        <PathClip :active="props.selected === Action.PathClip" @select="select"></PathClip>
    </div>
</template>
<style scoped lang="scss">
.wrapper {
    height: 100%;
}
</style>