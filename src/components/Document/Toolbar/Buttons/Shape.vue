<script setup lang="ts">
import { Context } from '@/context';
import { Action, Tool } from '@/context/tool';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ShapeMenu from '../ShapeMenu.vue';
import ToolButton from '../ToolButton.vue';

const { t } = useI18n();
interface Props {
    context: Context
    active: boolean
}
type Button = InstanceType<typeof ToolButton>
const button = ref<Button>();
const props = defineProps<Props>();
const popoverVisible = ref(false);
const popover = ref<HTMLDivElement>();
const checked = ref<Action>(Action.AddRect);
const visible = ref(false);
const selected = ref<Action>(Action.AutoV);
const patterns = ((items: [string, Action, string][]) => (items.map(item => ({ value: item[0], content: item[1], key: item[2] }))))([
    ['rect', Action.AddRect, 'R'],
    ['oval', Action.AddEllipse, 'O'],
    ['line', Action.AddLine, 'L'],
    ['arrow', Action.AddArrow, 'Shift L']
]);

const is_active = ref<boolean>(false);
function is_base_active() {
    is_active.value = [Action.AddRect, Action.AddEllipse, Action.AddLine, Action.AddArrow].includes(props.context.tool.action);
}
const shortcut_keys = ref<string>(`${t('shape.rect')}\u00a0\u00a0\u00a0\u00a0R`)
function get_tooltip_class() {
    const tool = props.context.tool.action;
    if (tool === Action.AddRect) {
        shortcut_keys.value = `${t('shape.rect')}\u00a0\u00a0\u00a0\u00a0R`;
    } else if (tool === Action.AddEllipse) {
        shortcut_keys.value = `${t('shape.oval')}\u00a0\u00a0\u00a0\u00a0O`;
    } else if (tool === Action.AddLine) {
        shortcut_keys.value = `${t('shape.line')}\u00a0\u00a0\u00a0\u00a0L`;
    } else if (tool === Action.AddArrow) {
        shortcut_keys.value = `${t('shape.arrow')}\u00a0\u00a0\u00a0\u00a0Shift L`;
    }
}
const cur_class = ref<string>("pattern-rectangle");
function get_icon_class() {
    const tool = props.context.tool.action;
    if (tool === Action.AddRect) {
        cur_class.value = "pattern-rectangle"
    } else if (tool === Action.AddEllipse) {
        cur_class.value = "pattern-oval"
    } else if (tool === Action.AddLine) {
        cur_class.value = "pattern-line"
    } else if (tool === Action.AddArrow) {
        cur_class.value = "pattern-arrow"
    } 
    // else {
    //     cur_class.value = "pattern-rectangle"
    // }
}
const check_shape = (active: Action) => {
    checked.value = active;
    props.context.tool.setAction(active);
    popoverVisible.value = false
}
function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    if (button.value?.toolButtonEl) {
        const el = button.value?.toolButtonEl
        visible.value = false
        popoverVisible.value = true
        nextTick(() => {
            if (popover.value) {
                popover.value.style.left = el.offsetLeft + -5 + 'px';
                popover.value.style.top = el.offsetHeight + 9 + 'px';
            }
        })
        document.addEventListener('click', onMenuBlur)
    }
}
function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover') && !e.target.closest('.menu')) {
        let timer = setTimeout(() => {
            popoverVisible.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onMenuBlur);
        }, 10)
    }
}
const isLable = ref(props.context.tool.isLable);
function tool_watcher(t?: number) {
    if (t === Tool.CHANGE_ACTION) {
        selected.value = props.context.tool.action;
        is_base_active();
        get_tooltip_class();
        get_icon_class();
    } else if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}
var timer: any = null
const onMouseenter = () => {
    timer = setTimeout(() => {
        visible.value = true
        clearTimeout(timer)
    }, 600)
}
const onMouseleave = () => {
    clearTimeout(timer)
    visible.value = false
}
onMounted(() => {
    props.context.tool.watch(tool_watcher);
});
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
})
</script>
<template>
    <el-tooltip class="box-item" effect="dark" :content="shortcut_keys" placement="bottom" :show-after="600" :offset="10"
        :hide-after="0" :visible="popoverVisible ? false : visible">
        <ToolButton ref="button" :checked="props.active" @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave"
            :selected="is_active">
            <div class="svg-container">
                <svg-icon :icon-class="cur_class"></svg-icon>
            </div>
            <div class="menu" @click="showMenu">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </ToolButton>
    </el-tooltip>
    <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
        <template v-for="item in patterns" :key="item.value">
            <ShapeMenu @select="check_shape" :lg="item.value" :quick="item.key" :action="item.content"
                :is-active="checked === item.content"></ShapeMenu>
        </template>
    </div>
</template>
<style scoped lang="scss">
.menu {
    width: 10px;
    height: 28px;
    display: flex;
    padding-right: 4px;
    margin-right: 2px;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    transition: 0.3s;

    >svg {
        width: 80%;
        height: 60%;
    }
}

.menu:hover {
    transform: translateY(4px);
}

.popover {
    position: absolute;
    z-index: 999;
    width: 180px;
    height: auto;
    background-color: var(--theme-color);
    border-radius: 4px;
    outline: none;
    padding: var(--default-padding-half) 0;
}

.svg-container {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 3px;
    color: #ffffff;

    >svg {
        width: 17px;
        height: 17px;
    }
}
</style>