<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n'
import { Context } from '@/context';
import { onMounted, onUnmounted, ref } from "vue";
import { Selection } from "@/context/selection";
import { useMask } from "@/components/Document/Creator/execute";

const { t } = useI18n()
const props = defineProps<{
    context: Context
}>();

const disabled = ref<boolean>(!props.context.selection.selectedShapes.length);

function mask() {
    useMask(props.context);
}

function statusUpdater(t: any) {
    if (t === Selection.CHANGE_SHAPE) disabled.value = !props.context.selection.selectedShapes.length;
}
onMounted(() => {
    props.context.selection.watch(statusUpdater);
});
onUnmounted(() => {
    props.context.selection.unwatch(statusUpdater);
});
</script>

<template>
<el-tooltip
    class="box-item"
    effect="dark"
    :content="`${t('system.create_mask')} Ctrl Alt M`"
    placement="bottom"
    :show-after="600"
    :offset="10"
    :hide-after="0"
>
    <ToolButton
        :selected="false"
        :style="{ width: '32px', 'pointer-events': disabled ? 'none' : 'auto' }"
        @click="mask"
    >
        <div class="svg-container" :style="{opacity: disabled ? 0.5 : 1}">
            <svg-icon icon-class="pattern-mask"/>
        </div>
    </ToolButton>
</el-tooltip>
</template>

<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;

    transition: 0.1s;

    > svg {
        width: 18px;
        height: 18px;
    }
}

</style>