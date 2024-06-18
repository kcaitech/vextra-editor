<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import SelectLayerInput from './SelectLayerInput.vue';
import { OverrideType, ShapeType, ShapeView, SymbolView, Variable, VariableType } from '@kcdesign/data';
import PopoverDefaultInput from './PopoverDefaultInput.vue';
import {
    create_var_by_type,
    get_symbol_by_layer,
    get_x_type_option,
    is_bind_x_vari,
    modify_variable
} from '@/utils/symbol';
import { message } from '@/utils/message';
import { Selection } from '@/context/selection';
import { v4 } from 'uuid';

const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();
const isLayerShow = ref(false);
const closeLayerShowPopup = () => {
    isLayerShow.value = false
}
const layerIsShow = () => {
    getDialogPosi(atrrdialog.value);
    isLayerShow.value = true;
    props.context.esctask.save(v4(), de_layer_is_show);
}

function de_layer_is_show() {
    const is_achieve_expected_results = isLayerShow.value;
    isLayerShow.value = false;
    return is_achieve_expected_results;
}

const atrrdialog = ref<HTMLDivElement>();
const card_ref = ref<HTMLDivElement>();
const dialog_posi = ref({ x: 0, y: 0 });
const default_name = ref('');
//选中图层的id
const selectId = ref<string[]>([]);
const getDialogPosi = (div: HTMLDivElement | undefined) => {
    if (div) {
        const el = div.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}

function edit_visible() {
    getDialogPosi(card_ref.value);
    isLayerShow.value = true;
    props.context.esctask.save(v4(), de_layer_is_show);
}

const is_bind = ref<Variable>();
const sym_layer = ref<SymbolView>();
const shape = ref<ShapeView>();
const dlt_value = ref<any>(true);

const isBind = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        const vari = is_bind_x_vari(shapes[0], OverrideType.Visible);

        sym_layer.value = get_symbol_by_layer(shapes[0])!;

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

            dlt_value.value = vari.value;
            default_name.value = vari.name;
        } else {
            default_name.value = shapes[0].name;
        }
    }
}

//默认值
function dlt_change(v: number) {
    dlt_value.value = !v;
}

function save_layer_show(type: VariableType, name: string) {
    if (is_bind.value) {
        if (!sym_layer.value) return;
        modify_variable(props.context, sym_layer.value, is_bind.value, name, dlt_value.value, selectId.value)
    } else {
        if (!name.trim()) {
            message('info', t('compos.validate_info_2'));
            return;
        }
        const shapes = props.context.selection.selectedShapes;
        const ids = shapes.map(item => item.id);
        if (!sym_layer.value) return;
        create_var_by_type(props.context, VariableType.Visible, name, dlt_value.value, ids, sym_layer.value);
    }
    isLayerShow.value = false;
}

const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        if (shape.value) shape.value.unwatch(layer_watcher);
        shape.value = (props.context.selection.selectedShapes[0]);
        if (shape.value) shape.value.watch(layer_watcher);
        isBind();
    }
}

function layer_watcher(args: any) {
    if (args === 'variables' || args === 'varbinds') isBind();
}

watch(() => sym_layer.value, (v, o) => {
    if (o) o.unwatch(layer_watcher);
    if (v) v.watch(layer_watcher);
})

function _delete() {
    if (!is_bind.value) return;
    const select = props.context.selection.selectedShapes;
    if (select.length === 1) {
        const editor = props.context.editor4Shape(select[0]);
        editor.removeBinds(OverrideType.Visible);
    }
}

onMounted(() => {
    shape.value = props.context.selection.selectedShapes[0];
    if (shape.value) shape.value.watch(layer_watcher);
    props.context.selection.watch(selected_watcher);
    isBind();
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    if (shape.value) shape.value.unwatch(layer_watcher);
})
</script>
<template>
    <div style="position: relative; box-sizing: border-box" ref="atrrdialog">
        <TypeHeader :title="t('compos.layer_isShow')" class="mt-24" :active="true">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="layerIsShow" v-if="!is_bind" :class="{ 'clicked': isLayerShow }">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <div class="attr_con" ref="card_ref" v-if="is_bind">
            <div class="module_item_left" @click="edit_visible">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <svg-icon icon-class="eye-open"></svg-icon>
                    </div>
                    <div class="name">
                        <span style="width: 40%;">{{ is_bind.name }}</span>
                        <span style="width: 60%;"> {{ dlt_value ? '显示' : '隐藏' }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <CompLayerShow :context="context" v-if="isLayerShow" @close-dialog="closeLayerShowPopup" right="250px"
                       :add-type="VariableType.Visible" :width="260" :title="t('compos.layer_isShow')"
                       :dialog_posi="dialog_posi"
                       :default_name="default_name" :variable="is_bind ? is_bind : undefined"
                       @save-layer-show="save_layer_show"
                       :symbol="sym_layer">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Visible"
                                  :context="props.context" :placeholder="t('compos.place_select_layer')"
                                  :selectId="selectId">
                </SelectLayerInput>
            </template>
            <template #default_value>
                <PopoverDefaultInput :context="context" :add-type="VariableType.Visible" :default_value="is_bind?.value"
                                     :dft_show="is_bind ? true : false" @select="dlt_change"></PopoverDefaultInput>
            </template>
        </CompLayerShow>
    </div>
</template>
<style lang="scss" scoped>
.edit-comps {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;

    .edit_svg {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--default-radius);

        > svg {
            width: 16px;
            height: 16px;
        }
    }

    .edit_svg:hover {
        background-color: #F5F5F5;
    }

    .edit_svg.clicked {
        background-color: #EBEBEB;
    }
}

.attr_con {
    display: flex;
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

        > svg {
            width: 14px;
            height: 14px;
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

            > svg {
                width: 14px;
                height: 14px;
            }
        }

        .name {
            flex: 1;
            display: flex;
            max-width: 100%;

            > span {
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

    > svg {
        width: 16px;
        height: 16px;
    }
    &:hover {
            background-color: #F5F5F5;
        }
    transition: .2s;
}
</style>