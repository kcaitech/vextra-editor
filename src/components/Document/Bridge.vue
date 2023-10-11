<script lang="ts" setup>
import { Context } from '@/context';
import ComponentWonderCard from '@/components/Document/Navigation/Component/ComponentWonderCard.vue'
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { GroupShape, Shape } from '@kcdesign/data';
import { Component } from '@/context/component';
import { get_symbol_ref_name, is_content, ref_symbol } from '@/utils/content';
import ContextMenu from '@/components/common/ContextMenu.vue'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const contextMenuEl = ref<ContextMenuEl>();
interface Props {
    context: Context
}
interface MenuItem {
    name: string
    id: string
}
const props = defineProps<Props>();
const wonder = ref<Shape>();
const wonder_card_x = ref<number>();
const wonder_card_y = ref<number>();
let wonder_stash: Shape;
const compMenu = ref<boolean>(false)
const compMenuPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 }); //鼠标点击page所在的位置
let compMenuItems: MenuItem[] = [];
function component_watcher(t: number) {
    if (t === Component.WONDER_CHANGE) wonder.value = props.context.component.wonder;
}
function check_status() {
    const w = props.context.component.wonder;
    if (w) {
        wonder_stash = w;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    }
}
function move(e: MouseEvent) {
    if (!wonder.value && wonder_stash) wonder.value = wonder_stash;
    modify_wonder_xy(e);
}
function up(e: MouseEvent) {
    if (is_content(props.context, e) && wonder.value) {
        const locate = get_position_on_page(e);
        const name = get_symbol_ref_name(wonder.value.name, wonder.value.id, Array.from(props.context.selection.selectedPage!.shapes.values()));
        ref_symbol(props.context, locate, name, wonder.value);
    } else {
        console.log('区外');
    }
    props.context.component.set_brige_status(false);
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
function modify_wonder_xy(e: MouseEvent) {
    wonder_card_x.value = e.clientX - 50;
    wonder_card_y.value = e.clientY - 50;
}
function get_position_on_page(e: MouseEvent) {
    const matirx = props.context.workspace.matrix;
    const root = props.context.workspace.root;
    return matirx.inverseCoord(e.clientX - root.x, e.clientY - root.y);
}

const component_menu_watcher = (t: number, shape?: Shape, e?: MouseEvent) => {
    if(t === Component.COMP_MENU) {
        console.log(shape,e);
        
        if(shape && e) {
            compMenuMount(shape, e);
        }
    }
}

const compMenuMount = (shape: Shape, e: MouseEvent) => {
    const menu = props.context.menu
    const id = shape.id;
    menu.menuMount();
    console.log(shape,'dd');
    
        compMenuPosition.value.x = e.clientX
        compMenuPosition.value.y = e.clientY
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
            if (el) {
                el.style.borderRadius = 4 + 'px'
                el.style.width = 160 + 'px'
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

onMounted(() => {
    props.context.watch(component_watcher);
    props.context.component.watch(component_menu_watcher);
    check_status();
})
onUnmounted(() => {
    props.context.unwatch(component_watcher);
    props.context.component.unwatch(component_menu_watcher);
})
</script>
<template>
    <div class="bridge">
        <div class="wonder-wrap" :style="{ left: wonder_card_x + 'px', top: wonder_card_y + 'px' }">
            <ComponentWonderCard v-if="wonder" :data="(wonder as GroupShape)"></ComponentWonderCard>
        </div>
        <ContextMenu v-if="compMenu" :x="compMenuPosition.x" :y="compMenuPosition.y" ref="contextMenuEl" :context="props.context"
            @close="compMenuUnmount">
            <div class="items-wrap" v-for="(item, index) in compMenuItems" :key="index"
                @click="(e: any) => compMenuUnmount(e, item.name, item.id)">
                <span>{{ item.name }}</span>
            </div>
        </ContextMenu>
    </div>
</template>
<style scoped lang="scss">
.bridge {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1005;
    left: 0px;
    top: 0px;

    .wonder-wrap {
        position: absolute;
    }
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