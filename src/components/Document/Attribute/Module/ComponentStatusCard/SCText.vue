<script lang="ts" setup>
import {Context} from "@/context";
import {AttriListItem, delete_variable, modify_variable} from "@/utils/symbol";
import {nextTick, ref} from "vue";
import {Variable, VariableType, Text} from "@kcdesign/data";
import {useI18n} from "vue-i18n";
import CompLayerShow from "@/components/Document/Attribute/PopoverMenu/ComposAttri/CompLayerShow.vue";
import SelectLayerInput from "@/components/Document/Attribute/Module/SelectLayerInput.vue";
import PopoverDefaultInput from "@/components/Document/Attribute/Module/PopoverDefaultInput.vue";

interface Props {
    context: Context
    item: AttriListItem
    variable: Variable
}

const props = defineProps<Props>();
const showRename = ref(false);
const input_s = ref<HTMLInputElement>();
const {t} = useI18n();
const card_ref = ref<HTMLDivElement>();
const dialog_posi = ref({x: 0, y: 0});
const iseditText = ref(false);

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

function get_dialog_posi(div: HTMLDivElement | undefined) {
    if (div) {
        const el = div.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}

function edit_text() {
    get_dialog_posi(card_ref.value);
    iseditText.value = true;
}

//选中图层的id
const layerIds = ref<string[]>();
const selectLayerId = (ids: string[]) => {
    layerIds.value = ids;
}
//默认值
const dlt_value = ref<string>('');

function text_dlt_change(v: string) {
    dlt_value.value = v;
}

const save_text = (type: VariableType, name: string) => {
    const symbol = props.context.selection.symbolview;
    if (!symbol || !layerIds.value) return;
    modify_variable(props.context, symbol, props.variable, name, dlt_value.value, layerIds.value)
    iseditText.value = false;
}

function _delete() {
    delete_variable(props.context, props.variable);
}

const getValue = (value: Text | string | undefined) => {
    return typeof value === 'string' ? value : value?.toString();
}
</script>
<template>
    <div v-if="props.variable.type === VariableType.Text" class="module_attr_item" ref="card_ref">
        <div class="attr_con">
            <div class="module_item_left" @click="edit_text">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <svg-icon icon-class="text" style="width: 10px; height: 10px;"></svg-icon>
                    </div>
                    <div class="name">
                        <span style="width: 40%;">{{ props.variable.name }}</span>
                        <span style="width: 60%;"> {{ getValue(props.variable.value) }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <CompLayerShow :context="context" v-if="iseditText" @close-dialog="iseditText = false" right="250px"
                       :width="260"
                       :add-type="VariableType.Text" :title="t('compos.text_content')" @save-layer-show="save_text"
                       :dialog_posi="dialog_posi" :default_name="props.variable.name" :variable="props.variable">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Text"
                                  :context="props.context" :placeholder="t('compos.place_select_layer')"
                                  :variable="props.variable" @change="selectLayerId"></SelectLayerInput>
            </template>
            <template #default_value>
                <PopoverDefaultInput :context="context" :add-type="VariableType.Text"
                                     :default_value="props.variable.value"
                                     @change="text_dlt_change"></PopoverDefaultInput>
            </template>
        </CompLayerShow>
    </div>
</template>
<style scoped lang="scss">
.module_attr_item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    width: 100%;

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

            > svg {
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

                > svg {
                    width: 14px;
                    height: 14px;
                    margin: 0px 10px;
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

    .module_input {
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;

        .el-input {
            font-size: 12px;
            height: 30px;
        }
    }

    .warn {
        font-size: 10px;
        color: red;
    }

    .delete {
        flex: 0 0 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 22px;
        height: 22px;

        > svg {
            width: 11px;
            height: 11px;
        }

        transition: .2s;
    }
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}
</style>