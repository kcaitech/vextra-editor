<script setup lang="ts">
import SubMenu from './SubMenu.vue';
import { nextTick, ref, onMounted, onUnmounted, reactive } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { XY } from '@/context/selection';

const { t } = useI18n();
interface Props {
    context: Context,
    site?: { x: number, y: number }
}
const props = defineProps<Props>();
const popoverVisible = ref<boolean>(false);
const childMenuVisible = ref<boolean>(false);
const trigger = ref<HTMLDivElement>(); // 按钮 Dom
const popover = ref<HTMLDivElement>(); // 菜单 Dom
const childMenuPosition: XY = reactive({ x: 0, y: 0 });

function showChildFileMenu(e: MouseEvent) {
    const targetWidth = (e.target as Element).getBoundingClientRect().width;
    childMenuPosition.x = targetWidth;
    childMenuPosition.y = -10;
    childMenuVisible.value = true
}
const closeChildFileMenu = () => {
    // todo
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
        popover.value.style.top = el.offsetHeight + 24 + 'px';
    })
    document.addEventListener('click', onMenuBlur);
}
function newFile() {
    // todo 
    popoverVisible.value = false;
}
const copiedFile = () => {
    // todo
    popoverVisible.value = false;
}
function rename() {
    // todo
    popoverVisible.value = false;
}
function close() {
    popoverVisible.value = false;
}
const guide = () => {
    // todo
    popoverVisible.value = false;
}
/**
 * @description 检测菜单是否失去焦点，若失去则关闭菜单
 */
function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover-f') && !e.target.closest('.icon')) {
        var timer = setTimeout(() => {
            popoverVisible.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onMenuBlur);
        }, 10)
    }
}
</script>
<template>
    <div class="file">
        <div class="icon" @click="showMenu" ref="trigger">
            <el-icon size="17">
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke-width="1.5">
                    <g id="group-0" stroke="currentColor" fill="currentColor">
                        <path d="M2.5 3H13.5M2.5 8H13.5M2.5 13H13.5" stroke-linecap="round" stroke-linejoin="miter"
                            fill="none" vector-effect="non-scaling-stroke"></path>
                    </g>
                </svg>
            </el-icon>
        </div>
        <div ref="popover" class="popover-f" v-if="popoverVisible">
            <span @click="newFile">{{ t('fileMenu.create_new') }}</span>
            <span @click="copiedFile">{{ t('fileMenu.create_copy') }}</span>
            <span @click="rename">{{ t('fileMenu.rename') }}</span>
            <span>{{ t('fileMenu.view') }}
                <div class="childMenu" @mouseenter="(e: MouseEvent) => showChildFileMenu(e)"
                    @mouseleave="closeChildFileMenu">
                    <div class="triangle"></div>
                    <SubMenu v-if="childMenuVisible" :context="props.context" :x="childMenuPosition.x"
                        :y="childMenuPosition.y" :width="180" :site="site" @close="close"></SubMenu>
                </div>
            </span>
            <span @click="guide">{{ t('fileMenu.guide') }}</span>
        </div>
    </div>
</template>
<style scoped lang="scss">
.file {
    margin-left: -6px;

    .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 3px;
        color: #ffffff;
    }

    .popover-f {
        position: absolute;
        color: #ffffff;
        z-index: 999;
        width: 150px;
        height: auto;
        font-size: var(--font-default-fontsize);
        background-color: var(--theme-color);
        border-radius: 4px;
        outline: none;
        padding: var(--default-padding-half) 0;

        >span {
            position: relative;
            width: 100%;
            height: 28px;
            padding: 0 var(--default-padding) 0 20px;
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;

            &:hover {
                background-color: var(--active-color);
            }

        }

        .childMenu {

            >.triangle {
                width: 0;
                height: 0;
                padding: 0;
                margin-left: 80px;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
                border-left: 10px solid var(--theme-color-anti);
                transition: 0.35s;
            }
        }
    }
}
</style>