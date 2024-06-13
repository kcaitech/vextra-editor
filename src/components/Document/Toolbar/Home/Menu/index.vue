<script setup lang="ts">
import { nextTick, ref, reactive, computed } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { XY } from '@/context/selection';
import SvgIcon from "@/components/common/SvgIcon.vue";
import ExportVue from "./Export.vue"
import ViewVue from "./View.vue"
import GuideVue from "./Guide.vue"

const { t } = useI18n();

interface Props {
    context: Context,
    params: any,
    site?: { x: number, y: number }
}

// interface Emits {
//     (e: 'rename'): void;
// }

const props = defineProps<Props>();
// const emit = defineEmits<Emits>();
const popoverVisible = ref<boolean>(false);
const childMenuVisible = ref<boolean>(false);
const trigger = ref<HTMLDivElement>(); // 按钮 Dom
const popover = ref<HTMLDivElement>(); // 菜单 Dom
const childMenuPosition: XY = reactive({ x: 0, y: 0 });
// const route = useRoute();
// const without_editing_permissions = ref<boolean>(!permIsEdit(props.context) || props.context.tool.isLable);

function showChildFileMenu(e: MouseEvent) {
    childMenuPosition.x = (e.target as Element).getBoundingClientRect().width;
    childMenuPosition.y = -10;
    childMenuVisible.value = true
}

const closeChildFileMenu = () => {
    childMenuVisible.value = false
}

/**
 * @description 打开菜单，根据按钮位置确定菜单位置
 */
function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    if (!trigger.value) return;
    const el = trigger.value;
    popoverVisible.value = true;
    nextTick(() => {
        if (!popover.value) return;
        popover.value.style.left = el.offsetLeft + 'px';
        popover.value.style.top = el.offsetHeight + 6 + 'px';
    })
    document.addEventListener('click', onMenuBlur);
}


/**
 * @description 检测菜单是否失去焦点，若失去则关闭菜单
 */
function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover-f') && !e.target.closest('.icon')) {
        let timer = setTimeout(() => {
            popoverVisible.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onMenuBlur);
        }, 10)
    }
}

const plugins = props.context.pluginsMgr.search2('toolbar.home.menu');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
comps.push({ component: ExportVue }, { component: ViewVue }, { component: GuideVue })
comps.push(...plugins.end)

</script>
<template>
    <div class="icon" @click="showMenu" ref="trigger">
        <svg-icon icon-class="menu"></svg-icon>
    </div>
    <div ref="popover" class="popover-f" v-if="popoverVisible">
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
</template>
<style scoped lang="scss">
.icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 32px;
    cursor: pointer;

    >svg {
        width: 18px;
        height: 18px;
        color: #FFFFFF;
    }
}

.icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.popover-f {
    position: absolute;
    color: #ffffff;
    z-index: 999;
    width: 136px;
    height: auto;
    font-size: var(--font-default-fontsize);
    background-color: #262626;
    border-radius: 4px;
    outline: none;
    padding: 4px 0;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);

    >div,
    >span {
        position: relative;
        width: 100%;
        height: 32px;
        padding: 9px 0 9px 28px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;

        &:hover {
            background-color: #434343;
        }
    }

    >.disabled {
        opacity: 0.4;
        pointer-events: none;
    }

}
</style>