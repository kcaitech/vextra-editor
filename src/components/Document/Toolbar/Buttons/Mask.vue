<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n'
import { Context } from '@/context';
import { onMounted, onUnmounted, ref } from "vue";
import { Selection } from "@/context/selection";
import { useMask } from "@/components/Document/Creator/execute";
import { ShapeType } from "@kcdesign/data";

const { t } = useI18n()
const props = defineProps<{
    context: Context
}>();

const disabled = ref<boolean>(false);

function mask() {
    useMask(props.context);
}

function statusUpdater(t: any) {
    if (t === Selection.CHANGE_SHAPE){
         const shapes = props.context.selection.selectedShapes;
        if (shapes.length && shapes.some(i => i.type !== ShapeType.Cutout)) {
            disabled.value = true
        } else {
            disabled.value = false
        }
    }
}
onMounted(() => {
    props.context.selection.watch(statusUpdater);
});
onUnmounted(() => {
    props.context.selection.unwatch(statusUpdater);
});

import pattern_mask_icon from '@/assets/icons/svg/pattern-mask.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

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
        :style="{ width: '32px', 'pointer-events': disabled ? 'auto' : 'none' }"
        @click="mask"
    >
        <div class="svg-container" :style="{opacity: disabled ? 1 : 0.4}">
            <SvgIcon :icon="pattern_mask_icon"/>
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