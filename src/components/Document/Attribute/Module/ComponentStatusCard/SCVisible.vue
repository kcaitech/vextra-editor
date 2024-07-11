<script lang="ts" setup>
import { Context } from "@/context";
import { AttriListItem, delete_variable, modify_variable } from "@/utils/symbol";
import { nextTick, ref } from "vue";
import { Variable, VariableType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import CompLayerShow from "@/components/Document/Attribute/PopoverMenu/ComposAttri/CompLayerShow.vue";
import SelectLayerInput from "@/components/Document/Attribute/Module/SelectLayerInput.vue";
import PopoverDefaultInput from "@/components/Document/Attribute/Module/PopoverDefaultInput.vue";
import { v4 } from "uuid";

interface Props {
    context: Context
    item: AttriListItem
    variable: Variable
}

const props = defineProps<Props>();
const showRename = ref(false);
const input_s = ref<HTMLInputElement>();
const { t } = useI18n();
const card_ref = ref<HTMLDivElement>();
const dialog_posi = ref({ x: 0, y: 0 });
const iseditLayerShow = ref(false);

function rename() {
    showRename.value = true;
    nextTick(() => {
        const el = input_s.value;
        if (el) {
            (el as HTMLInputElement).focus();
            (el as HTMLInputElement).value = props.variable.name;
        }
    })
}

function save_name(v: string) {
    const shape = props.context.selection.symbolshape;
    if (!shape) return;
    const editor = props.context.editor4Shape(shape);
    editor.modifyVariableName(props.variable, v);
}

function get_dialog_posi(div: HTMLDivElement | undefined) {
    if (div) {
        const el = div.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}

function edit_visible() {
    get_dialog_posi(card_ref.value);
    iseditLayerShow.value = true;
    props.context.escstack.save(v4(), de_layer_is_show);
}

function de_layer_is_show() {
    const is_achieve_expected_results = iseditLayerShow.value;
    iseditLayerShow.value = false;
    return is_achieve_expected_results;
}
//选中图层的id
const layerIds = ref<string[]>();
const selectLayerId = (ids: string[]) => {
    layerIds.value = ids;
}
//默认值
const dlt_value = ref<boolean>(!!props.variable.value);
function default_value(v: number) {
    v === 0 ? dlt_value.value = true : dlt_value.value = false;
}
function save_layer_show(type: VariableType, name: string) {
    const symbol = props.context.selection.symbolview;
    if (!symbol || !layerIds.value?.length) return;
    modify_variable(props.context, symbol, props.variable, name, dlt_value.value, layerIds.value)
    iseditLayerShow.value = false;
}
function _delete() {
    delete_variable(props.context, props.variable);
}
</script>
<template>
    <div class="module_attr_item" ref="card_ref">
        <div class="attr_con">
            <div class="module_item_left" @click="edit_visible">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <svg-icon icon-class="eye-open"></svg-icon>
                    </div>
                    <div class="name">
                        <span style="width: 35%;">{{ props.variable.name }}</span>
                        <span style="width: 65%;"> {{ props.variable.value ? '显示' : '隐藏' }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <CompLayerShow :context="props.context" v-if="iseditLayerShow" @close-dialog="iseditLayerShow = false" right="250px"
            :width="260" :add-type="VariableType.Visible" :title="t('compos.layer_isShow')"
            @save-layer-show="save_layer_show" :dialog_posi="dialog_posi" :default_name="props.variable.name"
            :variable="props.variable">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Visible"
                    :context="props.context" :placeholder="t('compos.place_select_layer')" :variable="props.variable"
                    @change="selectLayerId"></SelectLayerInput>
            </template>
            <template #default_value>
                <PopoverDefaultInput :context="context" :add-type="VariableType.Visible"
                    :default_value="props.variable.value" :dft_show="true" @select="default_value"></PopoverDefaultInput>
            </template>
        </CompLayerShow>
    </div>
</template>
<style scoped lang="scss">
.module_attr_item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    width: 100%;

    .attr_con {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 32px;
        box-sizing: border-box;
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
                max-width: calc(100% - 30px);

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

    .module_input {
        display: flex;
        align-items: center;
        width: 100%;
        height: 32px;

        .el-input {
            font-size: 12px;
            height: 32px;
        }
    }

    .warn {
        color: red;
        font-size: 12px;
    }

    .delete {
        flex: 0 0 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);
        transition: .2s;

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .delete:hover {
        background-color: #F5F5F5;
    }
}

.module_item_left:hover {
    background-color: #EBEBEB;
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}
</style>