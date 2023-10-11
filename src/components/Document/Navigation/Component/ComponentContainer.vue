<script setup lang="ts">
import { Context } from '@/context';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import ComponentLocalData from './ComponentLocalData.vue';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
interface Props {
    context: Context
    search: string
}
const props = defineProps<Props>();
const { t } = useI18n();
const top_wrapper = ref<Element | null>(null);
const scroll_container = ref<Element | null>(null);
function register_container() {
    if (!top_wrapper.value) return;
    scroll_container.value = top_wrapper.value.querySelector('.el-scrollbar > .el-scrollbar__wrap');
}
import ContextMenu from '@/components/common/ContextMenu.vue'
import { Component } from '@/context/component';
import { Shape } from '@kcdesign/data';
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const contextMenuEl = ref<ContextMenuEl>();
interface MenuItem {
    name: string
    id: string
}
const compMenu = ref<boolean>(false)
const compMenuPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 }); //鼠标点击page所在的位置
let compMenuItems: MenuItem[] = [];
const component_menu_watcher = (t: number, shape?: Shape, e?: MouseEvent) => {
    if (t === Component.COMP_MENU) {
        if (shape && e) {
            compMenuMount(shape, e);
        }
    }
}

const compMenuMount = (shape: Shape, e: MouseEvent) => {
    const menu = props.context.menu
    const id = shape.id;
    menu.menuMount();
    compMenuPosition.value.x = e.clientX
    compMenuPosition.value.y = e.clientY - 72
    compMenuItems = [
        { name: '转到主组件', id: id },
        { name: '查看详情', id: id }
    ]

    compMenu.value = true
    e.stopPropagation()
    document.addEventListener('keydown', Menuesc);
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            const docH = document.body.clientHeight;
            if (el) {
                const rem = (el.clientHeight + e.clientY) - docH;
                el.style.borderRadius = 4 + 'px'
                el.style.width = 160 + 'px'
                if(rem > 0) {
                    el.style.top = compMenuPosition.value.y - rem + 'px';
                }
            }
        }

    })
}
function Menuesc(e: KeyboardEvent) {
    if (e.code === 'Escape') compMenuUnmount();
}

const compMenuUnmount = (e?: MouseEvent, item?: string, id?: string) => {
    document.removeEventListener('keydown', Menuesc);
    compMenu.value = false;
    props.context.component.set_brige_status(false);
}

onMounted(register_container);

onMounted(() => {
    props.context.component.watch(component_menu_watcher);
    register_container();
})
onUnmounted(() => {
    props.context.component.unwatch(component_menu_watcher);
})
</script>
<template>
    <div class="component-container-level-1" ref="top_wrapper">
        <el-scrollbar :always="true">
            <ComponentLocalData v-if="scroll_container" :context="props.context" :container="scroll_container">
            </ComponentLocalData>
            <ComponentRootCollapse v-if="scroll_container" :context="props.context" :extend="false"
                :container="scroll_container" :title="t('compos.lib_line')" :data="[]" :status_set="new Set()">
            </ComponentRootCollapse>
        </el-scrollbar>
        <ContextMenu v-if="compMenu" :x="compMenuPosition.x" :y="compMenuPosition.y" ref="contextMenuEl"
            :context="props.context" @close="compMenuUnmount">
            <div class="items-wrap" v-for="(item, index) in compMenuItems" :key="index"
                @click="(e: any) => compMenuUnmount(e, item.name, item.id)">
                <span>{{ item.name }}</span>
            </div>
        </ContextMenu>
    </div>
</template>
<style scoped lang="scss">
.component-container-level-1 {
    width: 100%;
    height: 100%;
}

.el-scrollbar {
    padding-right: 10px;
}

.items-wrap {
    font-size: var(--font-default-fontsize);
    line-height: 30px;
    padding: 0 10px;

    &:hover {
        background-color: var(--active-color);
    }
}
</style>