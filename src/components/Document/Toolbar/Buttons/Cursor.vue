<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n'
import { Context } from '@/context';
import { useAuto, useAutoK } from "@/components/Document/Creator/execute";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Action, Tool } from "@/context/tool";
import SvgIcon from "@/components/common/SvgIcon.vue";

import tool_scale_icon from '@/assets/icons/svg/tool-scale.svg';
import white_down_icon from '@/assets/icons/svg/white-down.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import drag_icon from '@/assets/icons/svg/drag.svg';

const t = useI18n().t;
const props = defineProps<{
    context: Context,
    params: {
        active: boolean,
        is_lable: boolean,
        edit: boolean,
        select: (action: string) => void
    }
}>();
const editable = props.params.edit && props.params.select;
const tips = ref<string>(`${t('home.object_selector')}  V`);
const icon = ref<string>(drag_icon);
const stashAction = ref<string>(Action.AutoV);
const popover = ref<boolean>(false);

function click() {
    if (stashAction.value === Action.AutoV) useAuto(props.context);
    else useAutoK(props.context);
}

function toolWatch(type: any) {
    if (type === Tool.CHANGE_ACTION && editable) {
        const action = props.context.tool.action;
        if (action === Action.AutoV) {
            stashAction.value = props.context.tool.action;
            icon.value = drag_icon;
            tips.value = `${t('home.object_selector')}  V`;
        } else if (action === Action.AutoK) {
            stashAction.value = props.context.tool.action;
            icon.value = tool_scale_icon;
            tips.value = `${t('home.scale')}  K`;
        }
    }
}

function blur(e: MouseEvent) {
    if (!(e.target && (e.target as Element).closest('.popover-auto-tool-0958, .tool-auto-menu-trigger'))) popover.value = false;
}

function showMenu() {
    if (popover.value) return popover.value = false;
    popover.value = true;
}

const stop = watch(() => popover.value, (v) => {
    if (v) {
        document.addEventListener('click', blur);
        props.context.escstack.save('auto-popover-1021', () => {
            const achieve = popover.value;
            popover.value = false;
            return achieve;
        })
    } else {
        document.removeEventListener('click', blur);
    }
})

function __use_v() {
    if (stashAction.value !== Action.AutoV) useAuto(props.context);
    popover.value = false;
}

function __use_k() {
    if (stashAction.value !== Action.AutoK) useAutoK(props.context);
    popover.value = false;
}

onMounted(() => {
    props.context.tool.watch(toolWatch);
});
onUnmounted(() => {
    props.context.tool.unwatch(toolWatch);
    stop();
    document.removeEventListener('click', blur);
})
</script>

<template>
    <div style="position: relative">
        <ToolButton :selected="props.params.active" :class="{ active: popover }" style="display: flex;">
            <el-tooltip class="box-item" effect="dark" :content="tips" placement="bottom" :show-after="600" :offset="10"
                :hide-after="0">
                <div class="svg-container" @click="click">
                    <SvgIcon :icon="icon" />
                </div>
            </el-tooltip>
            <div class="tool-auto-menu-trigger" @click="showMenu">
                <SvgIcon :icon="white_down_icon" />
            </div>
        </ToolButton>
        <div v-if="popover" class="popover-auto-tool-0958">
            <div class="item" @click="__use_v">
                <div style="display: flex; align-items: center;">
                    <div style="width: 18px">
                        <SvgIcon v-if="stashAction === Action.AutoV" :icon="page_select_icon"
                            style="width: 12px; height: 12px;fill: var(--theme-color-anti)" />
                    </div>
                    <div style="display: flex; align-items: center;gap: 8px">
                        <SvgIcon :icon="drag_icon" style="width: 14px; height: 14px" />
                        <span>{{ t('home.object_selector') }}</span>
                    </div>
                </div>
                <div>V</div>
            </div>
            <div class="item" @click="__use_k">
                <div style="display: flex; align-items: center;">
                    <div style="width: 18px">
                        <SvgIcon v-if="stashAction === Action.AutoK" :icon="page_select_icon"
                            style="width: 12px; height: 12px;fill: var(--theme-color-anti)" />
                    </div>
                    <div style="display: flex; align-items: center;gap: 8px">
                        <SvgIcon :icon="tool_scale_icon"
                            style="width: 14px; height: 14px; fill: var(--theme-color-anti)" />
                        <span>{{ t('home.scale') }}</span>
                    </div>
                </div>
                <div>K</div>
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">
.active {
    background-color: rgba(255, 255, 255, .1);
}

.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;

    >img {
        width: 18px;
        height: 18px;
        fill: var(--theme-color-anti);
    }
}

.tool-auto-menu-trigger {
    width: 16px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;

    >svg {
        transform: translateX(-1px);
        width: 12px;
        height: 12px;
        transition: 0.2s;
    }
}

.tool-auto-menu-trigger:hover {
    >svg {
        transform: translate(-1px, 2px);
    }
}

.popover-auto-tool-0958 {
    top: 41px;
    left: 0;
    position: absolute;
    width: 158px;
    box-sizing: border-box;
    padding: 6px 0;
    background-color: var(--theme-color);
    color: var(--theme-color-anti);
    border-radius: var(--default-radius);

    >.item {
        width: 100%;
        height: 32px;
        padding: 0 12px;
        font-size: 12px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:hover {
            background-color: var(--active-color);
        }
    }
}
</style>