<script lang="ts" setup>
import ToolButton from './ToolButton.vue';
import { Action, Tool } from "@/context/tool";
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import { string_by_sys } from "@/utils/common";
const { t } = useI18n()
interface Props {
    context: Context,
    params: any,
}
const props = defineProps<Props>();

function select() {
    props.context.tool.notify(Tool.COMPONENT);
}


</script>

<template>
    <Tooltip :content="string_by_sys(`${t('navi.comps')} &nbsp;&nbsp; Shift I`)">
        <ToolButton ref="button" @click="select">
            <div class="svg-component">
                <svg-icon icon-class="resource"></svg-icon>
            </div>
        </ToolButton>
    </Tooltip>
</template>

<style lang="scss" scoped>
.svg-component {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;

    >svg {
        width: 18px;
        height: 18px;
    }
}

.popover {
    position: absolute;
}
</style>