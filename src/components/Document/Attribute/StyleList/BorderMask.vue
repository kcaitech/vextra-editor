<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import down_icon from "@/assets/icons/svg/down.svg";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { Context } from "@/context";
import StrokeMaskPanelItem from "@/components/Document/Attribute/Border2/Lib/StrokeMaskPanelItem.vue"
import { BorderFillsContext, StrokeFillContextMgr } from "../Border2/ctx";
import { BorderMask } from "@kcdesign/data";

const { t } = useI18n();
const props = defineProps<{
    context: Context;
    data: BorderMask[];
}>();
const extend = ref<boolean>(props.context.attr.borderMaskFold);

const fillCtxMgr = new StrokeFillContextMgr(props.context, {} as BorderFillsContext);

const changeFold = () => {
    extend.value = !extend.value;
    props.context.attr.setBorderMaskFold();
}
</script>

<template>
    <div class="container">
        <div class="header" @click="changeFold">
            <span>{{ t('stylelib.borders') }}</span>
            <div class="down">
                <SvgIcon :icon="down_icon" :style="{ transform: extend ? 'rotate(0deg)' : 'rotate(-90deg)' }"/>
            </div>
        </div>
        <template v-if="extend" v-for="c in data" :key="c.id">
            <StrokeMaskPanelItem v-if="!c.disabled" :context="context" :data="c" :manager="fillCtxMgr"></StrokeMaskPanelItem>
        </template>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    padding: 12px 8px;
    box-sizing: border-box;
    height: auto;
    border-bottom: 1px solid #F0F0F0;

    .header {
        display: flex;
        height: 30px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;

        span {
            font-size: 12px;
            font-weight: 500;
        }

        .down {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border-radius: var(--default-radius);
            transition: .2s;

            >img {
                width: 14px;
                height: 14px;
            }

            &:hover {
                background-color: #F5F5F5;
            }
        }
    }
}
</style>