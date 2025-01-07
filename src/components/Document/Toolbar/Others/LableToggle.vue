<script setup lang="ts">
import { ref, watch } from 'vue'
import { Context } from '@/context';
import { useI18n } from 'vue-i18n'
import { Action } from '@/context/tool';
import SvgIcon from '@/components/common/SvgIcon.vue';

const { t } = useI18n();
interface Props {
    context: Context,
    params: any
}
const props = defineProps<Props>();
const isLable = ref(false);
const visible = ref(false)
const vis = ref(false);
const isActive = ref(props.context.tool.isLable);
const input = ref<HTMLInputElement>();
watch(isActive, (v) => {
    props.context.tool.setLableSwitch(v);
    vis.value = true;
    const active = props.context.tool.action;
    if (!v || active === Action.AutoV /* || active === Action.AddComment */) return;
    props.context.tool.setAction(Action.AutoV);
})

var timer: any = null
const onMouseenter = () => {
    timer = setTimeout(() => {
        visible.value = true
        clearTimeout(timer)
    }, 600)
}
const onMouseleave = () => {
    clearTimeout(timer);
    visible.value = false;
    vis.value = false;
}

const toggleSwitch = () => {
    isActive.value = !isActive.value;
    input.value?.blur();
}
import switch_icon from '@/assets/icons/svg/switch.svg';
</script>

<template>
    <div class="content_lable">
        <el-tooltip class="box-item" effect="dark" :content="t('lable.development')" placement="bottom" :show-after="600"
            :offset="10" :hide-after="0" :visible="vis ? false : visible">
            <div class="d-switch" :class="{ 'is-checked': isActive }" @mouseenter.stop="onMouseenter"
                @mouseleave.stop="onMouseleave">
                <input class="d-switch__input" ref="input" type="checkbox" :checked="isActive" @change.stop="toggleSwitch"
                    :true-value="isActive" :false-value="!isActive" />
                <span class="d-switch_action">
                    <SvgIcon :icon="switch_icon" style="width: 16px;height: 16px"/>
                </span>
            </div>
        </el-tooltip>
    </div>
</template>

<style scoped lang="scss">
.content_lable {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 52px;
    margin: 0 10px;
}

.d-switch {
    position: relative;
    height: 30px;
    transition: background 0.2s;
    width: 52px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 200px;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;

    .d-switch__input {
        position: relative;
        z-index: 1;
        margin: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }

    .d-switch_action {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
        left: 6px;
        top: 4px;
        z-index: 0;
        height: 22px;
        width: 22px;
        background: black;
        border-radius: 50%;

        svg {
            color: #fff;
        }
    }

    &.is-checked {
        background: rgba(255, 255, 255, 0.1);

        .d-switch_action {
            left: 100%;
            background: #1878f5;
            margin-left: -27px;
        }
    }
}
</style>