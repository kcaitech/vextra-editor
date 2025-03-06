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
import { Context } from "@/context";
import { AttriListItem, delete_variable, modify_variable } from "@/utils/symbol";
import { nextTick, ref } from "vue";
import { SymbolRefShape, SymbolRefView, Variable, VariableType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import CompLayerShow from "@/components/Document/Attribute/PopoverMenu/ComposAttri/CompLayerShow.vue";
import SelectLayerInput from "@/components/Document/Attribute/Module/SelectLayerInput.vue";
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
const dialog_posi = ref({ x: 0, y: 0 });
const instance_card = ref<HTMLDivElement>();
const iseditToggle = ref(false);

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

function edit_instance() {
    get_dialog_posi(instance_card.value);
    iseditToggle.value = true;
    props.context.escstack.save(v4(), de_symbol_is_show);
}

function de_symbol_is_show() {
    const is_achieve_expected_results = iseditToggle.value;
    iseditToggle.value = false;
    return is_achieve_expected_results;
}

//选中图层的id
const layerIds = ref<string[]>([]);
const selectLayerId = (ids: string[]) => {
    layerIds.value = ids;
}

function save_instance(type: VariableType, name: string) {
    const symbol = props.context.selection.symbolview;
    if (!(symbol && layerIds.value.length)) return;
    const sym_ids: string[] = [];
    for (let i = 0, l = layerIds.value.length; i < l; i++) {
        const s = props.context.selection.getShapeById(layerIds.value[i]);
        if (!s) continue;
        sym_ids.push((s as SymbolRefView).refId);
    }
    if (!sym_ids.length) {
        return;
    }
    modify_variable(props.context, symbol, props.variable, name, sym_ids[0], sym_ids);
    iseditToggle.value = false;
}

const getValue = (id: string) => {
    const sym = props.context.data.getSymbolSync(id);
    return sym?.name || '';
}

function _delete() {
    delete_variable(props.context, props.variable);
}

import delete_icon from '@/assets/icons/svg/delete.svg';
import gray_symbol_ref_icon from '@/assets/icons/svg/gray-symbol-ref.svg';
import SvgIcon from "@/components/common/SvgIcon.vue";


</script>
<template>
    <div class="module_attr_item" ref="instance_card">
        <div class="attr_con">
            <div class="module_item_left" @click="edit_instance">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <SvgIcon :icon="gray_symbol_ref_icon"/>
                    </div>
                    <div class="name">
                        <span style="width: 35%;">{{ props.variable.name }}</span>
                        <span style="width: 65%;"> {{ getValue(props.variable.value) }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <SvgIcon :icon="delete_icon"/>
            </div>
        </div>
        <CompLayerShow :context="context" v-if="iseditToggle" @close-dialog="iseditToggle = false" right="250px"
            :width="260" :add-type="VariableType.SymbolRef" :title="t('compos.instance_toggle')"
            @save-layer-show="save_instance" :dialog_posi="dialog_posi" :default_name="props.variable.name"
            :variable="props.variable">
            <template #layer>
                <SelectLayerInput :title="t('compos.compos_instance')" :add-type="VariableType.SymbolRef"
                    :context="props.context" :placeholder="t('compos.place_select_instance')" :variable="props.variable"
                    @change="selectLayerId"></SelectLayerInput>
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
        background-color: #F5F5F5;
        width: calc(100% - 32px);
        height: 32px;
        border-radius: var(--default-radius);

        .module_name {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            color: #595959;
            margin-left: 8px;

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

    .module_item_left:hover {
        background-color: #EBEBEB;
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
        font-size: 12px;
        color: red;
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