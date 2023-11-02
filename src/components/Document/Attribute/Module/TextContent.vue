<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import { OverrideType, SymbolShape, TextShape, Variable, VariableType } from '@kcdesign/data';
import SelectLayerInput from './SelectLayerInput.vue';
import PopoverDefaultInput from './PopoverDefaultInput.vue';
import { create_var_by_type, delete_variable, get_symbol_by_layer, is_bind_x_vari } from '@/utils/symbol';
import { Selection } from '@/context/selection';
import { message } from '@/utils/message';
const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();
const isTextShow = ref(false);
const closeLayerShowPopup = () => {
    isTextShow.value = false
}
const warn = ref(false);
const input_v = ref();
const textDialog = () => {
    if (textDefaultValue.value.trim().length < 1 && input_v.value) {
        input_v.value.focus();
        warn.value = true;
        return;
    }
    getDialogPosi(atrrdialog.value);
    isTextShow.value = true
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

const is_bind = ref<Variable>();
const sym_layer = ref<SymbolShape>();
const default_name = ref('');
const selectId = ref<string[]>([]);
const shape = ref(props.context.selection.selectedShapes[0]);
const textDefaultValue = ref('');
const isBind = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        get_text();
        const vari = is_bind_x_vari(shapes[0], OverrideType.Text);
        sym_layer.value = get_symbol_by_layer(shapes[0]);
        selectId.value = [shapes[0].id];
        is_bind.value = vari;
        if (vari) {
            default_name.value = vari.name;
        } else {
            default_name.value = shapes[0].name;
        }
    }
}
const card_ref = ref<HTMLDivElement>();
function edit_text() {
    getDialogPosi(card_ref.value);
    isTextShow.value = true;
}
//asdfg
function save_layer_show(type: VariableType, name: string) {
    if (is_bind.value) return isTextShow.value = false;
    if (!name.trim()) {
        message('info', '属性名不能为空');
        return;
    }
    const shapes = props.context.selection.selectedShapes;
    const ids = shapes.map(item => item.id);
    if (!sym_layer.value) return;
    const text = (shapes[0] as TextShape).text.getText(0, Infinity);
    create_var_by_type(props.context, VariableType.Text, name, text, ids, sym_layer.value);
    isTextShow.value = false;
}
const selected_watcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        isBind();
    }
}
function variable_watcher(args: any) {
    if (args === 'map') isBind();
}
function text_watcher(args: any) {
    if (args === 'text') get_text();
    if (args === 'map') isBind();
}

watch(() => shape.value, (v, o) => {
    if (o) {
        o.unwatch(text_watcher);
    }
    v.watch(text_watcher);
}, { immediate: true })

watch(() => sym_layer.value, (v, o) => {
    if (o) {
        o.unwatch(variable_watcher);
    }
    if (v) {
        v.watch(variable_watcher);
    }
}, { immediate: true })

const input = () => {
    if (textDefaultValue.value.trim().length > 0) {
        warn.value = false;
    }
}

const keysumbit = (e: KeyboardEvent) => {
    const { shiftKey, ctrlKey, metaKey } = e;
    if (e.key === 'Enter') {
        if (ctrlKey || metaKey || shiftKey) {
            input_v.value = input_v.value + '\n'
        } else {
            input_v.value.blur();
        }
    }
}

function _delete() {
    if (!is_bind.value) return;
    if (!sym_layer.value) return;
    const editor = props.context.editor4Shape(sym_layer.value);
    editor.removeVar(is_bind.value.id);
    isBind();
}

const change = () => {

}

const get_text = () => {
    const text = (shape.value as TextShape).text.getText(0, Infinity).slice(0, -1);
    textDefaultValue.value = text;
}

onMounted(() => {
    isBind();
    shape.value.watch(variable_watcher);
    props.context.selection.watch(selected_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    shape.value.unwatch(variable_watcher);

})
</script>
<template>
    <div style="position: relative; margin-bottom: 10px;" ref="atrrdialog">
        <TypeHeader :title="t('compos.text_content')" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="textDialog" v-if="!is_bind">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <div class="text" v-if="!is_bind">
            <el-input v-model="textDefaultValue" type="textarea" ref="input_v" :autosize="{ minRows: 2, maxRows: 4 }"
                resize="none" :placeholder="t('compos.default_text_input')" @keydown.stop="keysumbit" @input="input" @change="change"/>
        </div>
        <div class="warning" v-if="warn">
            <p class="warn">默认值不能为空</p>
        </div>
        <div class="attr_con" ref="card_ref" v-if="is_bind">
            <div class="module_item_left" @click="edit_text">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <svg-icon icon-class="text" style="width: 10px; height: 10px;"></svg-icon>
                    </div>
                    <div class="name">
                        <span style="width: 40%;">{{ is_bind?.name }}</span>
                        <span style="width: 60%;"> {{ is_bind?.value }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <CompLayerShow :context="context" v-if="isTextShow" @close-dialog="closeLayerShowPopup" right="250px"
            :add-type="VariableType.Status" :width="260" :title="t('compos.text_content')" :dialog_posi="dialog_posi"
            :default_name="default_name" :variable="is_bind ? is_bind : undefined" @save-layer-show="save_layer_show"
            :symbol="sym_layer">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Text" :context="props.context"
                    :placeholder="t('compos.place_select_layer')" :selectId="selectId"></SelectLayerInput>
            </template>
        </CompLayerShow>
    </div>
</template>
<style lang="scss" scoped>
.edit-comps {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;

    .edit_svg {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        >svg {
            width: 70%;
            height: 70%;
        }
    }
}

.text {
    :deep(.el-textarea) {
        width: 100%;

        .el-textarea__inner {
            font-size: 12px;
            min-height: 28px !important;
            background-color: var(--grey-light);
            box-shadow: none;

            &:focus {
                box-shadow: 0 0 0 1px var(--active-color) inset;
            }
        }
    }
}

.warning {
    width: 100%;
    height: 20px;
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .warn {
        font-size: 10px;
        padding: 0;
        color: red;
        margin: 3px;
        margin-left: 10px;
    }
}

:deep(.el-textarea__inner::-webkit-scrollbar) {
    width: 6px;
}

:deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
    border-radius: 3px;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    background-color: #c3c3c3;
}

:deep(.el-textarea__inner::-webkit-scrollbar-track) {
    background-color: transparent;
}

.attr_con {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.module_item_left {
    display: flex;
    align-items: center;
    border-radius: 4px;
    background-color: var(--grey-light);
    width: calc(100% - 22px);
    height: 30px;

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
                margin: 0px 10px;
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
    flex: 0 0 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;

    >svg {
        width: 11px;
        height: 11px;
    }

    transition: .2s;
}
</style>