<script lang="ts" setup>
import { Context } from "@/context";
import { ArrowDown } from '@element-plus/icons-vue';
import { nextTick, onMounted, ref } from "vue";
import LableDropMenu from "./LableDropMenu.vue";
import { useI18n } from 'vue-i18n'
import SvgIcon from "@/components/common/SvgIcon.vue";

const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();

const selectoption = ref(false);
const selsectedShow = ref(false);
const multiple = ref(props.context.menu.isMulripleI || 1);
const platform = ref(props.context.menu.isPlatform || 1);
const platformMenuItems = ref<string[]>([
    'iOS', 'Web', 'Android', `${t('lable.applet_of_WeChat')}`
])
const pxMenuItems = ref<string[]>([
    `${t('lable.pixel')} x0.5`, `${t('lable.pixel')} x1`, `${t('lable.pixel')} x2`
])

const onSelected = () => {
    if (selsectedShow.value) {
        props.context.menu.lableMenuMount('platform');
    } else {
        props.context.menu.lableMenuMount();
    }
    selsectedShow.value = !selsectedShow.value;
}
const listMenuStatus = (i: number) => {
    platform.value = i;
    props.context.menu.setPlatform(i);
}
const multiples = [0.5, 1, 2];
const pxMenuStatus = (i: number) => {
    multiple.value = i;
    props.context.menu.setLableMulriple(multiples[i], i);
}
const close = () => {
    selsectedShow.value = false;
}
onMounted(() => {
    multiple.value = props.context.menu.isMulripleI;
    platform.value = props.context.menu.isPlatform;
})

import down_icon from "@/assets/icons/svg/down.svg"
</script>

<template>
    <div class="container">
        <span class="name">{{ t('lable.development_platform') }}</span>
        <div class="selected">
            <div class="platform-input" @click.stop="onSelected">
                <span>{{ platformMenuItems[platform] }}</span>
<!--                <el-icon>-->
<!--                    <ArrowDown-->
<!--                        :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />-->
<!--                </el-icon>-->
                <SvgIcon :icon="down_icon"/>
                <LableDropMenu v-if="selsectedShow" :context="context" :Items="platformMenuItems" :pxItems="pxMenuItems"
                    :choose="platform" :choose2="multiple" @close="close" @listMenuStatus="listMenuStatus"
                    @pxMenuStatus="pxMenuStatus"></LableDropMenu>
            </div>
        </div>
    </div>
    <div class="line" style="width: 216px;height: 1px;background-color: #F5F5F5;margin-left: 12px;"></div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 64px;
    display: flex;
    padding: 16px 12px;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    .name {
        font-weight: bold;
        margin-right: 14px;
    }

    .selected {
        flex: 1;

        .platform-input {
            position: relative;
            width: 100%;
            height: 32px;
            border-radius: var(--default-radius);
            padding-left: 12px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            background-color: #F5F5F5;

            span {
                flex: 1;
            }

            >svg {
                width: 12px;
                height: 12px;
                color: #666666;
                margin-right: 7px;
            }
        }

        .platform-input:hover {
            background-color: #EBEBEB;
        }
    }
}
</style>