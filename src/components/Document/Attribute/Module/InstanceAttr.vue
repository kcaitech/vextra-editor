/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import {onMounted, onUnmounted, ref} from 'vue'
import {get_shape_within_document, shape_track} from '@/utils/content';
import {Shape, ShapeType, ShapeView, SymbolRefShape, SymbolRefView, adapt2Shape} from '@kcdesign/data';
import {
    get_var_for_ref,
    is_able_to_unbind,
    is_symbolref_disa,
    RefAttriListItem,
    reset_all_attr_for_ref,
    is_part_of_symbol
} from "@/utils/symbol";
import { cardmap } from "./InstanceAttrCard/map";
import Status from "./InstanceAttrCard/IACStatus.vue"
import Visible from "./InstanceAttrCard/IACVisible.vue"
import { Selection } from '@/context/selection';
import { v4 } from "uuid";
import { Menu } from '@/context/menu';
import Key from '@/components/common/Key.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

interface Props {
    context: Context
    shapes: SymbolRefView[]
}

const { t } = useI18n();
const props = defineProps<Props>();
const resetMenu = ref(false);
const variables = ref<RefAttriListItem[]>([]);
const visible_variables = ref<RefAttriListItem[]>([]);
const untie_state = ref<boolean>(false);
const selectReset = (e: MouseEvent) => {
    props.context.menu.notify(Menu.CLOSE_COMP_MENU);
    if (resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('click', closeResetMenu);
    props.context.escstack.save(v4(), close_popover);
}

const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false;
    }
    document.removeEventListener('click', closeResetMenu);
}

function close_popover() {
    const is_exist = resetMenu.value;
    resetMenu.value = false;
    document.removeEventListener('click', closeResetMenu);
    return is_exist;
}

const editComps = () => {
    let shape: ShapeView | undefined
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    let refId = symref.refId;
    shape = get_shape_within_document(props.context, refId);
    if (!shape) return;
    shape_track(props.context, shape);
}
const untie = () => {
    if (!untie_state.value) return;
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    const shapes = editor.extractSymbol(props.shapes);
    if (!shapes) return;
    props.context.nextTick(page, () => {
        const select = shapes.reduce((pre, cur) => {
            const s = page.getShape(cur.id);
            if (s) {
                pre.push(s);
            }
            return pre;
        }, [] as ShapeView[])
        selection.rangeSelectShape(select);
    })
    resetMenu.value = false;
}

const shape_watcher = (arg: any) => { // todo 优化updateData时机
    if (arg === 'frame') {
        return;
    }

    updateData();
}

const updateData = () => {
    if (props.shapes.length === 1) {
        const symref = props.context.selection.symbolrefview;
        if (!symref) {
            return;
        }
        const result = get_var_for_ref(symref, t);
        variables.value = [];
        visible_variables.value = [];
        if (!result) {
            return;
        }

        variables.value = result.variables;
        visible_variables.value = result.visible_variables;

    } else if (props.shapes.length > 1) {
        // todo
    }
}

function reset_all_attr() {
    if (props.shapes.length === 1) {
        reset_all_attr_for_ref(props.context);
    } else {

    }
}

function updater_untie_state() {
    untie_state.value = is_able_to_unbind(props.context.selection.selectedShapes);
}

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        updater_untie_state();
        watchShapes();
        updateData();
    }
}

const watchedShapes = new Map();

function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.selectedShapes.length) {
        for (let i = 0, len = selection.selectedShapes.length; i < len; i++) {
            const v = selection.selectedShapes[i];
            if (v.type !== ShapeType.SymbolRef) continue;
            const p = get_ref_ref(v as SymbolRefView);
            if (p) needWatchShapes.set(p.id, p);
            needWatchShapes.set(v.id, v)
        }
    }
    watchedShapes.forEach((v, k) => {
        if (!needWatchShapes.has(k)) {
            v.unwatch(shape_watcher);
            watchedShapes.delete(k);
        }
    })
    needWatchShapes.forEach((v, k) => {
        if (!watchedShapes.has(k)) {
            v.watch(shape_watcher);
            watchedShapes.set(k, v);
        }
    })
}

function get_ref_ref(symref: SymbolRefView) {
    if (!symref.isVirtualShape) return;
    let p = symref.parent;
    while (p) {
        if (p.type === ShapeType.SymbolRef && !p.isVirtualShape) return p;
        p = p.parent;
    }
}

const menu_watcher = (t: number, e: MouseEvent) => {
    if (t === Menu.CLOSE_INSTANCE_ATTR_MENU) {
        closeResetMenu(e)
    }
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.menu.watch(menu_watcher);
    watchShapes();
    updater_untie_state();
    updateData();
})
onUnmounted(() => {
    document.removeEventListener('click', closeResetMenu);
    props.context.selection.unwatch(selection_watcher);
    props.context.menu.unwatch(menu_watcher);
    watchedShapes.forEach(v => v.unwatch(shape_watcher));
})

import reset_comp_icon from "@/assets/icons/svg/reset_comp.svg"
import comp_state_icon from "@/assets/icons/svg/comp-state.svg"
</script>

<template>
    <div class="instance-attr">
        <TypeHeader :title="t('compos.instance_attr')" :active="!!(variables.length || visible_variables.length)">
            <template #tool>
                <div class="edit-comps" v-if="!is_part_of_symbol(props.shapes[0])">
                    <div class="edit_svg" @click.stop="editComps" v-if="is_symbolref_disa(props.shapes)">
                        <SvgIcon :icon="comp_state_icon"/>
                    </div>
                    <div class="reset_svg" @click.stop="selectReset"
                        :style="{ backgroundColor: resetMenu ? '#EBEBEB' : '' }">
                        <SvgIcon :icon="reset_comp_icon"/>
                        <div class="reset_menu" v-if="resetMenu">
                            <div :class="{ untie, disabled: !untie_state }" @click="untie">
                                <span>{{ t('compos.untie') }}</span>
                                <span><Key code="Alt Ctrl B"></Key></span>
                            </div>
                            <div class="untie" @click="reset_all_attr">{{ t('compos.reset_all_attr') }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <div style="padding-top: 8px;">
            <div class="module_container" :style="{ marginBottom: variables.length > 0 ? '8px' : '0' }">
                <component v-for="item in variables" :key="item.variable.id + props.shapes[0].id"
                    :is="cardmap.get(item.variable.type) || Status" :context="props.context" :data="item"></component>
            </div>
            <div v-if="visible_variables.length" class="visible-var-container">
                <div class="show">
                    <div class="title">{{ t('compos.layer_show') }}</div>
                    <div class="items-wrap">
                        <component v-for="item in visible_variables" :key="item.variable.id + props.shapes[0].id"
                            :is="Visible" :context="props.context" :data="(item as RefAttriListItem)"></component>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.instance-attr {
    width: 100%;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .edit-comps {
        display: flex;
        align-items: center;

        .edit_svg {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            box-sizing: border-box;
            
            >svg {
                width: 16px;
                height: 16px;
            }

        }

        .edit_svg:hover {
            background-color: #EBEBEB;
        }


        .reset_svg {
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            box-sizing: border-box;

            >svg {
                width: 16px;
                height: 16px;
            }

            .reset_menu {
                position: absolute;
                top: 28px;
                right: 0;
                width: 150px;
                padding: 4px 0;
                border: 1px solid #EBEBEB;
                background-color: #fff;
                border-radius: 6px;
                box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                z-index: 100;

                .untie {
                    height: 32px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    box-sizing: border-box;

                    &:hover {
                        background-color: #F5F5F5;
                    }
                }

                .disabled {
                    pointer-events: none;
                    opacity: 0.2;
                }
            }
        }

        .reset_svg:hover {
            background-color: #EBEBEB;
        }

    }

    .module_container {
        font-size: var(--font-default-fontsize);
    }

    .visible-var-container {
        display: flex;
        width: 100%;
        align-items: center;

        .show {
            display: flex;
            justify-content: space-between;
            width: 100%;

            .title {
                color: #595959;
                width: 40%;
                line-height: 28px;
                padding-right: 10px;
            }

            .items-wrap {
                flex: 0 0 126px;
            }
        }

        .place {
            flex: 0 0 22px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 22px;
            height: 22px;
        }
    }

    :deep(.el-select-dropdown__item.selected) {
        color: #9775fa !important;
        font-size: 12px;
    }

    :deep(.el-select .el-input.is-focus .el-input__wrapper) {
        box-shadow: 0 0 0 1px var(--active-color) inset !important;
        background-color: var(--grey-light);
    }

    :deep(.el-select .el-input__wrapper.is-focus) {
        box-shadow: 0 0 0 1px var(--active-color) inset !important;
    }
}
</style>