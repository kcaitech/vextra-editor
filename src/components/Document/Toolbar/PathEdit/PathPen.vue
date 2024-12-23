<script setup lang="ts">
import ToolButton from '../Buttons/ToolButton.vue';
import { Action } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';

const { t } = useI18n()
const props = defineProps<{
    active: boolean
}>();
const emit = defineEmits<{
    (e: "select", action: string): void;
}>();

function select(action: string) {
    emit('select', action);
}

import pattern_pen_icon from '@/assets/icons/svg/pattern-pen.svg';
</script>
<template>
<Tooltip :content="t('shape.pen')">
    <ToolButton ref="button" @click="() => {select(Action.Pen)}" :selected="props.active" :width="32" :height="32">
        <div class="svg-container">
            <SvgIcon :icon="pattern_pen_icon"/>
        </div>
    </ToolButton>
</Tooltip>
</template>
<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;

    > svg {
        width: 18px;
        height: 18px;
    }
}
</style>