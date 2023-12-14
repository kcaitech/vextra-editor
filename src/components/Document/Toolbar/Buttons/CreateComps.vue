<script lang="ts" setup>
import ToolButton from '../ToolButton.vue';
import { Action, Tool } from "@/context/tool";
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import ComponentDialog from '../../Attribute/Module/ComponentDialog.vue';
import { string_by_sys } from "@/utils/common";
const { t } = useI18n()
interface Props {
    context: Context
}
const props = defineProps<Props>();

function select() {
    props.context.tool.notify(Tool.COMPONENT);
}


</script>

<template>
    <!-- <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
        <ComponentDialog :context="context" right="-250px" top="0" @closeDialog="closeDialog">
        </ComponentDialog>
    </div> -->
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
        width: 14px;
        height: 14px;
    }
}

.popover {
    position: absolute;
}
</style>