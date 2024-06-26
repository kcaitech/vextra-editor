<script setup lang="ts">
import { Context } from '@/context';
import ComponentRootCollapse from './ComponentRootCollapse.vue';
import ComponentLocalData from './ComponentLocalData.vue';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/Document/Menu/ContextMenu.vue'
import { Component } from '@/context/component';
import { Shape } from '@kcdesign/data';
import { shape_track } from '@/utils/content';
import { SymbolListItem } from '@/utils/symbol';

interface Props {
    context: Context
    search: string
    isAttri: boolean
    cardType: 'alpha' | 'beta'
    root: Element | null
}

const props = defineProps<Props>();
const { t } = useI18n();
const top_wrapper = ref<Element | null>(null);
const scroll_container = ref<Element | null>(null);
const dlt_set = new Set<string>();
const null_data: SymbolListItem[] = [];

function register_container() {
    const el = props.root || top_wrapper.value;
    if (!el) return;
    scroll_container.value = el.querySelector('.el-scrollbar > .el-scrollbar__wrap');
}

type ContextMenuEl = InstanceType<typeof ContextMenu>;
const contextMenuEl = ref<ContextMenuEl>();

interface MenuItem {
    name: string
    shape: Shape
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
    menu.menuMount();
    compMenuPosition.value.x = e.clientX
    compMenuPosition.value.y = e.clientY - 72
    compMenuItems = [
        { name: 'gocomp', shape: shape },
        // { name: 'datail', shape: shape }
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
                if (rem > 0) {
                    el.style.top = compMenuPosition.value.y - rem + 'px';
                }
            }
        }

    })
}

function Menuesc(e: KeyboardEvent) {
    if (e.code === 'Escape') compMenuUnmount();
}

const compMenuUnmount = (e?: MouseEvent, name?: string, shape?: Shape) => {
    document.removeEventListener('keydown', Menuesc);
    if (name === 'gocomp') {
        if (shape) {
            const page = props.context.selection.selectedPage;
            if (!page) return;
            const s = page.getShape(shape.id);
            if (!s) return;
            shape_track(props.context, s);
        }
    } else if (name === 'datail') {

    }
    compMenu.value = false;
}

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
            <ComponentLocalData v-if="scroll_container" :context="props.context" :container="scroll_container"
                :is-attri="props.isAttri" :card-type="props.cardType">
            </ComponentLocalData>
            <!--            线框图-->
            <!--            <ComponentRootCollapse v-if="scroll_container" :context="props.context" :extend="false"-->
            <!--                                   :container="scroll_container" :title="t('compos.lib_line')" :data="null_data"-->
            <!--                                   :status_set="dlt_set" :is-attri="props.isAttri" :card-type="props.cardType">-->
            <!--            </ComponentRootCollapse>-->
        </el-scrollbar>
        <ContextMenu v-if="compMenu" :x="compMenuPosition.x" :y="compMenuPosition.y" ref="contextMenuEl"
            :context="props.context" @close="compMenuUnmount">
            <div class="items-wrap" v-for="(item, index) in compMenuItems" :key="index"
                @click="(e: any) => compMenuUnmount(e, item.name, item.shape)">
                <span>{{ t(`compos.${item.name}`) }}</span>
            </div>
        </ContextMenu>
    </div>
</template>
<style scoped lang="scss">
.component-container-level-1 {
    width: 100%;
    height: 100%;
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