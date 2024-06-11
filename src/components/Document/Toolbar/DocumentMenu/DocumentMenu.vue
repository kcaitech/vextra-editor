<script setup lang="ts">
import SubMenu from './SubMenu.vue';
import {nextTick, ref, reactive, computed} from 'vue';
import {Context} from '@/context';
import {useI18n} from 'vue-i18n';
import {XY} from '@/context/selection';
import {new_file, copy_file} from '@/utils/document';
// import {useRoute} from 'vue-router';
import {Perm} from '@/context/workspace';
import {permIsEdit} from '@/utils/content';
import {ElMessage} from 'element-plus';
import SvgIcon from "@/components/common/SvgIcon.vue";
import { Menu } from '@/context/menu';

const {t} = useI18n();

interface Props {
    context: Context,
    site?: { x: number, y: number }
}

interface Emits {
    (e: 'rename'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const popoverVisible = ref<boolean>(false);
const childMenuVisible = ref<boolean>(false);
const trigger = ref<HTMLDivElement>(); // 按钮 Dom
const popover = ref<HTMLDivElement>(); // 菜单 Dom
const childMenuPosition: XY = reactive({x: 0, y: 0});
// const route = useRoute();
const without_editing_permissions = ref<boolean>(!permIsEdit(props.context) || props.context.tool.isLable);

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

async function newFile() {
    popoverVisible.value = false;
    props.context.workspace.setFreezeStatus(true); // 请求发起，进入loading状态
    const result = await new_file(props.context, t('system.new_file'), t('system.page1'));
    if (!result) {
        ElMessage.error({duration: 1500, message: t('homerightmenu.copyfile_no')})
    }
    props.context.workspace.setFreezeStatus(false); // 取消loading状态
}

async function copiedFile() {
    popoverVisible.value = false;
    // props.context.workspace.setFreezeStatus(true);
    // const doc_id = route.query.id;
    // if (!doc_id || typeof doc_id !== "string") {
    //     props.context.workspace.setFreezeStatus(false);
    //     return;
    // }
    // const result = await copy_file(doc_id);
    // if (!result) {
    //     ElMessage.error({duration: 1500, message: t('homerightmenu.copyfile_no')});
    // }
    // props.context.workspace.setFreezeStatus(false);
}

function rename() {
    emit("rename");
    popoverVisible.value = false;
}

const exportClick = () => {
    props.context.menu.setExportDialog(true);
    popoverVisible.value = false;
}

function close() {
    childMenuVisible.value = false;
    popoverVisible.value = false;
}

const guide = () => {
    // todo
    props.context.menu.notify(Menu.OPEN_SHORTCUTS);
    popoverVisible.value = false;
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

const isDisabled: any = computed(() => {
    if (Perm.isEdit != 3) {
        return {state: false, color: '#E0E0E0'};
    } else {
        return {state: true};
    }
});
</script>
<template>
        <div class="icon" @click="showMenu" ref="trigger">
            <!--            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke-width="1.5">-->
            <!--                <g id="group-0" stroke="currentColor" fill="currentColor">-->
            <!--                    <path d="M2.5 3H13.5M2.5 8H13.5M2.5 13H13.5" stroke-linecap="round" stroke-linejoin="miter"-->
            <!--                          fill="none" vector-effect="non-scaling-stroke">-->
            <!--                    </path>-->
            <!--                </g>-->
            <!--            </svg>-->
            <svg-icon icon-class="menu"></svg-icon>
        </div>
        <div ref="popover" class="popover-f" v-if="popoverVisible">
            <span @click="newFile">{{ t('fileMenu.create_new') }}</span>
            <span @click="copiedFile" :class="{ 'disabled': without_editing_permissions }">{{t('fileMenu.create_copy') }}</span>
            <span @click="rename" :class="{ 'disabled': without_editing_permissions }">{{ t('fileMenu.rename') }}</span>
            <span @click.stop="exportClick" >{{ t('cutoutExport.export_cutout') }}</span>
            <span @mouseenter="(e: MouseEvent) => showChildFileMenu(e)" @mouseleave="closeChildFileMenu">
                {{ t('fileMenu.view') }}
                <div class="childMenu">
<!--                    <div class="triangle"></div>-->
                    <svg-icon icon-class="arrowhead"></svg-icon>
                    <SubMenu v-if="childMenuVisible" :context="props.context" :x="childMenuPosition.x"
                             :y="childMenuPosition.y" :width="180" :site="site" @close="close"></SubMenu>
                </div>
            </span>
            <span @click="guide">{{ t('fileMenu.guide') }}</span>
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

        > svg {
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

        > div, > span {
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

        > .disabled {
            opacity: 0.4;
            pointer-events: none;
        }

        .childMenu {

            //> .triangle {
            //    width: 0;
            //    height: 0;
            //    padding: 0;
            //    margin-left: 80px;
            //    border-top: 5px solid transparent;
            //    border-bottom: 5px solid transparent;
            //    border-left: 10px solid var(--theme-color-anti);
            //    transition: 0.35s;
            //}
            >svg {
                height: 16px;
                width: 16px;
                margin-right: 8px;
                margin-left: 60px;
                margin-top: 4px;
            }
        }
    }

</style>