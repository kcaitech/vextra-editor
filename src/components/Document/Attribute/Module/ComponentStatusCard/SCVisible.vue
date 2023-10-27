<script lang="ts" setup>
import {Context} from "@/context";
import {AttriListItem, delete_variable} from "@/utils/symbol";
import {nextTick, ref} from "vue";
import {Variable, VariableType} from "@kcdesign/data";
import {useI18n} from "vue-i18n";
import CompLayerShow from "@/components/Document/Attribute/PopoverMenu/CompLayerShow.vue";
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
}

function save_layer_show() {
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
                        <span style="width: 40%;">{{ props.variable.name }}</span>
                        <span style="width: 60%;"> {{ props.variable.value ? '显示' : '隐藏' }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <CompLayerShow :context="props.context" v-if="iseditLayerShow" @close-dialog="iseditLayerShow = false"
                       right="250px"
                       :width="260" :add-type="VariableType.Visible" :title="t('compos.layer_isShow')"
                       @save-layer-show="save_layer_show" :dialog_posi="dialog_posi" :default_name="props.variable.name" :variable="props.variable">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Visible"
                                  :context="props.context"
                                  :placeholder="t('compos.place_select_layer')"
                                  :variable="props.variable"></SelectLayerInput>
            </template>
            <template #default_value>
                <PopoverDefaultInput :context="context" :add-type="VariableType.Visible"></PopoverDefaultInput>
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
        height: 30px;

        .el-input {
            font-size: 10px;
            height: 30px;
        }
    }

    .warn {
        color: red;
        transform: scale(.9);
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