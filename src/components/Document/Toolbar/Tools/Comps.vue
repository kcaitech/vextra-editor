<script setup lang="ts">
import { Context } from '@/context';
import { Action, Tool } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import { string_by_sys } from "@/utils/common";
import ToolButton from "../Buttons/ToolButton.vue";
import SvgIcon from '@/components/common/SvgIcon.vue';

const { t } = useI18n();

interface Props {
    context: Context
}
const props = defineProps<Props>();

function selectComps() {
    props.context.tool.notify(Tool.COMPONENT);
}


import resource_icon from '@/assets/icons/svg/resource.svg';
</script>

<template>

        <el-tooltip class="box-item" effect="dark" :content="string_by_sys(`${t('navi.comps')} &nbsp;&nbsp; Shift I`)"
            placement="bottom" :show-after="500" :offset="10" :hide-after="0">
            <ToolButton style="width: 32px">
                <div class="temp" @click="selectComps">
                    <SvgIcon :icon="resource_icon"/>
                </div>
            </ToolButton>
        </el-tooltip>

</template>

<style scoped lang="scss">
    .temp {
        width: 32px;
        height: 32px;
        font-size: 12px;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 6px 6px 6px;
        box-sizing: border-box;

        >svg {
            width: 18px;
            height: 18px;
        }
    }
</style>