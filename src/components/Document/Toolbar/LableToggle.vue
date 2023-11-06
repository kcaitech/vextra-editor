<script setup lang="ts">
import { ref, watch } from 'vue'
import { Switch } from '@element-plus/icons-vue'
import { Context } from '@/context';
import { useI18n } from 'vue-i18n'

const {t} = useI18n();
interface Props {
    context: Context
}
const props = defineProps<Props>();
const isLable = ref(false);
const visible = ref(false)
const vis = ref(false);
const isActive = ref(false);
watch(isActive, (v) => {
    props.context.tool.setLableSwitch(v);
    vis.value = true;
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
}

</script>

<template>
    <div class="content_lable">
        <el-tooltip class="box-item" effect="dark" :content="t('lable.development')" placement="bottom" :show-after="600" :offset="10"
            :hide-after="0" :visible="vis ? false : visible">
            <div class="d-switch" :class="{ 'is-checked': isActive }" @mouseenter.stop="onMouseenter"
                @mouseleave.stop="onMouseleave">
                <input class="d-switch__input" ref="input" type="checkbox" :checked="isActive" @change="toggleSwitch"
                    :true-value="isActive" :false-value="!isActive" />
                <span class="d-switch_action">
                    <Switch style="width: 14px; height: 14px;" />
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
    width: 50px;
    margin: 0 10px;
}

.d-switch {
    position: relative;
    height: 25px;
    transition: background 0.2s;
    width: 40px;
    background: rgb(117, 117, 117);
    border-radius: 10px;
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
    }

    .d-switch_action {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
        left: 2px;
        top: 2px;
        z-index: 0;
        height: 20px;
        width: 20px;
        background: black;
        border-radius: 50%;

        svg {
            color: #fff;
        }
    }

    &.is-checked {
        background: rgb(117, 117, 117);

        .d-switch_action {
            left: 100%;
            background: #865dff;
            margin-left: -22px;
        }
    }
}
</style>