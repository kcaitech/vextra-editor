<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import SelectLayerInput from './SelectLayerInput.vue';
import { OverrideType, SymbolShape, Variable, VariableType } from '@kcdesign/data';
import PopoverDefaultInput from './PopoverDefaultInput.vue';
import { create_var_by_type, get_symbol_by_layer, is_bind_x_vari } from '@/utils/symbol';
import { message } from '@/utils/message';
import { Selection } from '@/context/selection';
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
    isLayerShow.value = true
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
}
const is_bind = ref<Variable>();
const sym_layer = ref<SymbolShape>();
const shape = ref(props.context.selection.selectedShapes[0]);
const isBind = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        const vari = is_bind_x_vari(shapes[0], OverrideType.Visible);
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
const dlt_value = ref<any>(true);
//默认值
function dlt_change(v: number) {
    dlt_value.value = !v;
}
//asdfg
function save_layer_show(type: VariableType, name: string) {
    if(is_bind.value) return isLayerShow.value = false;
    if (!name.trim()) {
        message('info', '属性名不能为空');
        return;
    }
    const shapes = props.context.selection.selectedShapes;
    const ids = shapes.map(item => item.id);
    if(!sym_layer.value) return;
    create_var_by_type(props.context, VariableType.Visible, name, dlt_value.value, ids, sym_layer.value);
    isLayerShow.value = false;
}

const selected_watcher = (t: number) => {
    if(t === Selection.CHANGE_SHAPE) {
        isBind();
    }
}
function variable_watcher(args: any[]) {
    if (args && (args.includes('map') || args.includes('childs'))) isBind();
}
watch(() => shape.value, (v, o) => {
    if(o) {
        o.unwatch(variable_watcher);
    }
    v.watch(variable_watcher);
},{immediate: true})

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
        <TypeHeader :title="t('compos.layer_isShow')" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="layerIsShow" v-if="!is_bind">
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
                        <span style="width: 60%;"> {{ is_bind.value ? '显示' : '隐藏' }}</span>
                    </div>
                </div>
            </div>
            <div class="delete">
            </div>
        </div>
        <CompLayerShow :context="context" v-if="isLayerShow" @close-dialog="closeLayerShowPopup" right="250px"
            :add-type="VariableType.Visible" :width="260" :title="t('compos.layer_isShow')" :dialog_posi="dialog_posi"
            :default_name="default_name" :variable="is_bind ? is_bind : undefined" @save-layer-show="save_layer_show" :symbol="sym_layer">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Visible"
                    :context="props.context" :placeholder="t('compos.place_select_layer')" :selectId="selectId">
                </SelectLayerInput>
            </template>
            <template #default_value>
                <PopoverDefaultInput :context="context" :add-type="VariableType.Visible" :default_value="is_bind?.value" @select="dlt_change"></PopoverDefaultInput>
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
    flex: 0 0 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;
}
</style>