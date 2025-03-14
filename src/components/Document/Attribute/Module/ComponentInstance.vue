/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import SelectLayerInput from './SelectLayerInput.vue';
import { ref, onUnmounted, onMounted, watch } from 'vue';
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import {
    OverrideType,
    Shape,
    ShapeView,
    SymbolRefShape,
    SymbolRefView,
    SymbolShape,
    SymbolView,
    Variable,
    adapt2Shape,
    ShapeType
} from '@kcdesign/data';
import { get_shape_within_document, shape_track } from '@/utils/content';
import { MoreFilled } from '@element-plus/icons-vue';
import { VariableType } from '@kcdesign/data';
import {
    create_var_by_type,
    get_symbol_by_layer, get_x_type_option,
    is_bind_x_vari,
    modify_variable,
    reset_all_attr_for_ref
} from "@/utils/symbol";
import { message } from '@/utils/message';
import { Selection } from '@/context/selection';
import Key from '@/components/common/Key.vue';
import { v4 } from 'uuid';

interface Props {
    context: Context
    shapes: SymbolRefView[]
}

const props = defineProps<Props>();
const { t } = useI18n();
const isInstanceShow = ref(false);
const saveExamplesToggle = () => {
    isInstanceShow.value = false
}
const layerIsShow = () => {
    getDialogPosi(atrrdialog.value);
    isInstanceShow.value = true;
    props.context.escstack.save(v4(), de_layer_is_show);
}

const resetMenu = ref(false)
const untie = () => {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.extractSymbol(props.shapes);
        if (shapes) {
            props.context.nextTick(page, () => {
                const select = shapes.reduce((pre, cur) => {
                    const s = page.getShape(cur.id)
                    if (s) pre.push(s);
                    return pre;
                }, [] as ShapeView[]);
                selection.rangeSelectShape(select);
            })
            resetMenu.value = false;
        }
    }
}
const editComps = () => {
    const refShape = props.context.selection.selectedShapes[0];
    const refId = refShape && (refShape instanceof SymbolRefView) ? refShape.refId : undefined
    if (!refId) return;
    const shape = get_shape_within_document(props.context, refId)
    if (shape) {
        shape_track(props.context, shape)
    }
}
const selectReset = (e: MouseEvent) => {
    if (resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('click', closeResetMenu)
}
const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false
    }
    document.removeEventListener('click', closeResetMenu)
}

const atrrdialog = ref<HTMLDivElement>();
const dialog_posi = ref({ x: 0, y: 0 });
const getDialogPosi = (div: HTMLDivElement | undefined) => {
    if (div) {
        const el = div.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}

function reset_all_attr() {
    reset_all_attr_for_ref(props.context);
}

const is_bind = ref<Variable>();
const sym_layer = ref<SymbolView>();
const default_name = ref('');
const selectId = ref<string[]>([]);
const shape = ref(props.context.selection.selectedShapes[0]);
const isBind = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        const vari = is_bind_x_vari(shapes[0], OverrideType.SymbolID);
        sym_layer.value = get_symbol_by_layer(shapes[0]);

        let __sym = sym_layer.value!;
        let union = sym_layer.value!;
        if (!__sym) {
            return;
        }
        if (__sym.parent?.type === ShapeType.SymbolUnion) {
            union = __sym.parent! as SymbolView;
        }

        selectId.value = [shapes[0].id];

        is_bind.value = vari;
        if (vari) {
            const _temp: ShapeView[] = [];
            get_x_type_option(union, __sym, vari.type, vari, _temp);
            selectId.value = _temp.map(i => i.id);

            default_name.value = vari.name;
        } else {
            default_name.value = shapes[0].name;
        }
    }
}
const card_ref = ref<HTMLDivElement>();

function edit_instance() {
    getDialogPosi(card_ref.value);
    isInstanceShow.value = true;
    props.context.escstack.save(v4(), de_layer_is_show);
}

function de_layer_is_show() {
    const is_achieve_expected_results = isInstanceShow.value;
    isInstanceShow.value = false;
    return is_achieve_expected_results;
}

function save_layer_show(type: VariableType, name: string) {
    if (is_bind.value) {
        if (!sym_layer.value) return;
        // modify_variable(props.context, (sym_layer.value), is_bind.value, name, is_bind.value.value, [is_bind.value.value])

        modify_variable(props.context, (sym_layer.value), is_bind.value, name, is_bind.value.value, selectId.value);
    } else {
        if (!name.trim()) {
            message('info', t('compos.validate_info_2'));
            return;
        }
        const shapes = props.context.selection.selectedShapes;
        const ids = shapes.map(item => item.id);
        if (!sym_layer.value) return;
        create_var_by_type(props.context, VariableType.SymbolRef, name, undefined, ids, (sym_layer.value));
    }
    isInstanceShow.value = false;
}

const getValue = (id: string) => {
    return props.context.data.getSymbolSync(id)?.name;
}
const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        isBind();
    }
}

function variable_watcher(args: any[]) {
    if (args && (args.includes('variables') || args.includes('childs'))) isBind();
}

watch(() => shape.value, (v, o) => {
    if (o) {
        o.unwatch(variable_watcher);
    }
    v.watch(variable_watcher);
}, { immediate: true })

function _delete() {
    if (!is_bind.value) return;
    const select = props.context.selection.selectedShapes;
    if (select.length === 1) {
        const editor = props.context.editor4Shape(select[0]);
        editor.removeBinds(OverrideType.SymbolID);
    }
}

onMounted(() => {
    isBind();
    shape.value.watch(variable_watcher);
    props.context.selection.watch(selected_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    shape.value.unwatch(variable_watcher);
    document.removeEventListener('click', closeResetMenu)

})

import SvgIcon from '@/components/common/SvgIcon.vue';
import relevance_icon from '@/assets/icons/svg/relevance.svg';
import comp_state_icon from "@/assets/icons/svg/comp-state.svg"
import gray_symbol_ref_icon from "@/assets/icons/svg/gray-symbol-ref.svg"
import delete_icon from "@/assets/icons/svg/delete.svg"

</script>

<template>
    <div style="position: relative;" ref="atrrdialog">
        <TypeHeader :title="t('compos.compos_instance')" class="mt-24" :active="true">
            <template #tool>
                <div class="edit-comps">
                    <div class="rele_svg" @click="layerIsShow" v-if="!is_bind">
                        <SvgIcon :icon="relevance_icon"/>
                    </div>
                    <div class="edit_svg" @click.stop="editComps">
                        <SvgIcon :icon="comp_state_icon"/>
                    </div>
                    <div class="reset_svg" @click.stop="selectReset">
                        <el-icon>
                            <MoreFilled />
                        </el-icon>
                        <div class="reset_menu" v-if="resetMenu">
                            <div class="untie" @click="untie">
                                <span>{{ t('compos.untie') }}</span>
                                <span>
                                    <Key code="Alt Ctrl B"></Key>
                                </span>
                            </div>
                            <div class="untie" @click="reset_all_attr">{{ t('compos.reset_all_attr') }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <div class="attr_con" v-if="is_bind" ref="card_ref">
            <div class="module_item_left" @click="edit_instance">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <SvgIcon :icon="gray_symbol_ref_icon"/>
                    </div>
                    <div class="name">
                        <span style="width: 40%;">{{ is_bind?.name }}</span>
                        <span style="width: 60%;"> {{ getValue(is_bind?.value) }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <SvgIcon :icon="delete_icon"/>
            </div>
        </div>
        <CompLayerShow :context="context" v-if="isInstanceShow" @close-dialog="saveExamplesToggle" right="250px"
            :add-type="VariableType.SymbolRef" :width="260" :title="t('compos.instance_toggle')"
            :dialog_posi="dialog_posi" :default_name="default_name" :variable="is_bind ? is_bind : undefined"
            @save-layer-show="save_layer_show" :symbol="sym_layer">
            <template #layer>
                <SelectLayerInput :title="t('compos.compos_instance')" :add-type="VariableType.SymbolRef"
                    :context="props.context" :placeholder="t('compos.place_select_instance')" :selectId="selectId">
                </SelectLayerInput>
            </template>
        </CompLayerShow>
    </div>
</template>

<style scoped lang="scss">
.edit-comps {
    width: 84px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .rele_svg {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--default-radius);

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .rele_svg:hover {
        background-color: #F5F5F5;
    }

    .edit_svg {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--default-radius);

        >svg {
            width: 16px;
            height: 16px;
        }

    }

    .edit_svg:hover {
        background-color: #F5F5F5;
    }

    .reset_svg {
        position: relative;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--default-radius);

        >svg {
            width: 16px;
            height: 16px;
        }

        .reset_menu {
            position: absolute;
            top: 25px;
            right: 0;
            width: 150px;
            padding: 8px 0;
            background-color: #fff;
            border-radius: 2px;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
            z-index: 100;

            .untie {
                height: 30px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
                box-sizing: border-box;

                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }
        }
    }

    .reset_svg:hover {
        background-color: #F5F5F5;
    }
}

.attr_con {
    display: flex;
    margin-bottom: 2px;
    margin-top: 6px;
    align-items: center;
    justify-content: space-between;
}

.module_item_left {
    display: flex;
    align-items: center;
    border-radius: 4px;
    background-color: #F5F5F5;
    width: calc(100% - 32px);
    height: 32px;

    &:hover {
        background-color: #EBEBEB;
    }

    .module_name {
        display: flex;
        align-items: center;
        width: 84px;

        >svg {
            width: 14px;
            height: 14px;
            margin: 0px 10px;
        }

        .name {
            max-width: 50px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .module_name-2 {
        display: flex;
        align-items: center;
        width: 100%;

        .svg {
            display: flex;
            align-items: center;
            justify-content: center;

            >svg {
                width: 14px;
                height: 14px;
            }
        }


        .name {
            flex: 1;
            display: flex;
            max-width: 100%;

            >span {
                display: block;
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-right: 10px;
            }
        }
    }

    .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.delete {
    flex: 0 0 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    transition: .2s;

    >svg {
        width: 16px;
        height: 16px;
    }

    &:hover {
        background-color: #F5F5F5;
    }
}
</style>