<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import { OverrideType, Variable, VariableType, Text, SymbolView, ShapeType, ShapeView } from '@kcdesign/data';
import SelectLayerInput from './SelectLayerInput.vue';
import {
    create_var_by_type,
    get_symbol_by_layer, get_x_type_option,
    is_bind_x_vari,
    modify_variable
} from '@/utils/symbol';
import { Selection } from '@/context/selection';
import { message } from '@/utils/message';
import { v4 } from 'uuid';

interface Props {
    context: Context
}

const props = defineProps<Props>();
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
    props.context.esctask.save(v4(), de_text_is_show);
}
function de_text_is_show() {
    const is_achieve_expected_results = isTextShow.value;
    isTextShow.value = false;
    return is_achieve_expected_results;
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
const sym_layer = ref<SymbolView>();
const default_name = ref('');
const selectId = ref<string[]>([]);
const textDefaultValue = ref('');
const isBind = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        get_text();

        const vari = is_bind_x_vari(shapes[0], OverrideType.Text);

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

function edit_text() {
    isBind();
    getDialogPosi(card_ref.value);
    isTextShow.value = true;
    props.context.esctask.save(v4(), de_text_is_show);
}

function save_layer_show(type: VariableType, name: string) {
    if (is_bind.value) {
        if (!sym_layer.value) return;
        modify_variable(props.context, sym_layer.value, is_bind.value, name, is_bind.value.value, selectId.value)
    } else {
        if (!name.trim()) {
            message('info', t('compos.validate_info_2'));
            return;
        }
        const shapes = props.context.selection.selectedShapes;
        const ids = shapes.map(item => item.id);
        if (!sym_layer.value) return;
        create_var_by_type(props.context, VariableType.Text, name, textDefaultValue.value, ids, sym_layer.value);
    }
    isTextShow.value = false;
}

const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        update();
        watchShapes();
    }
}

function update() {
    isBind();
    get_text();
}

function text_watcher(args: any) {
    if (args === 'text') get_text();
    if (args === 'variables' || args === 'map') isBind();
}

watch(() => sym_layer.value, (v, o) => {
    if (o) {
        o.unwatch(text_watcher);
    }
    if (v) {
        v.watch(text_watcher);
    }
})

const input = () => {
    if (textDefaultValue.value.trim().length > 0) {
        warn.value = false;
    }
}

function _delete() {
    if (!is_bind.value) return;
    const shape = props.context.selection.textshape;
    if (!shape) return;
    const editor = props.context.editor4Shape(shape);
    editor.removeBinds(OverrideType.Text);
}

const get_text = () => {
    const shape = props.context.selection.textshape;
    if (!shape) return;
    textDefaultValue.value = shape.text.getText(0, Infinity).slice(0, -1);
}

/**
 * @description 调整监听对象
 * eg: 第一次选中了A、B,这个时候组件监听了A、B。
 *     第二次从A、B到C、D，这个时候所选图形发生了变化，监听对象从A、B调整为C、D。
 *     在调整过程中对C、D挂载(watch)监听的同时，还对A、B的监听进行了卸载(unwatch);
 */
const watchedShapes = new Map();

function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.selectedShapes.length) {
        for (let i = 0, len = selection.selectedShapes.length; i < len; i++) {
            const v = selection.selectedShapes[i];
            needWatchShapes.set(v.id, v)
        }
    }
    watchedShapes.forEach((v, k) => {
        if (!needWatchShapes.has(k)) {
            v.unwatch(update);
            watchedShapes.delete(k);
        }
    })
    needWatchShapes.forEach((v, k) => {
        if (!watchedShapes.has(k)) {
            v.watch(update);
            watchedShapes.set(k, v);
        }
    })
}

onMounted(() => {
    props.context.selection.watch(selected_watcher);
    update();
    watchShapes();
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    watchedShapes.forEach((v) => {
        v.unwatch(update);
    })
})
const getValue = (value: Text | string | undefined) => {
    return value instanceof Text ? value.getText(0, Number.MAX_VALUE) : value;
}
</script>
<template>
    <div class="line" style="width: 240px;height: 1px;border-bottom: 1px solid #F0F0F0;margin-left: -8px;"></div>
    <div style="position: relative; box-sizing: border-box" ref="atrrdialog">
        <TypeHeader :title="t('compos.text_content')" class="mt-24" :active="true">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="textDialog" v-if="!is_bind" :class="{ 'clicked': isTextShow }">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <div class="warning" v-if="warn">
            <p class="warn">默认值不能为空</p>
        </div>
        <div class="attr_con" ref="card_ref" v-if="is_bind">
            <div class="module_item_left" @click="edit_text">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <svg-icon icon-class="text"></svg-icon>
                    </div>
                    <div class="name">
                        <span style="width: 40%;">{{ is_bind?.name }}</span>
                        <span style="width: 60%;"> {{ getValue(is_bind?.value) }}</span>
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

        >svg {
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
    border-radius: var(--default-radius);
    background-color: #F5F5F5;
    width: calc(100% - 32px);
    height: 32px;

    .module_name {
        display: flex;
        align-items: center;
        width: 84px;

        >svg {
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

            >svg {
                width: 14px;
                height: 14px;
                color: #595959;
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

.module_item_left:hover {
    background-color: #EBEBEB;
}

.delete {
    flex: 0 0 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: var(--default-radius);

    >svg {
        width: 16px;
        height: 16px;
    }

    transition: .2s;
}

.delete:hover {
    background-color: #F5F5F5;
}
</style>