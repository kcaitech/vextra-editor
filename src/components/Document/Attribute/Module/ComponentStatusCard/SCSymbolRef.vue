<script lang="ts" setup>
import {Context} from "@/context";
import {AttriListItem} from "@/utils/symbol";
import {nextTick, ref} from "vue";
import {Variable, VariableType} from "@kcdesign/data";
import {useI18n} from "vue-i18n";
import CompLayerShow from "@/components/Document/Attribute/PopoverMenu/CompLayerShow.vue";
import SelectLayerInput from "@/components/Document/Attribute/Module/SelectLayerInput.vue";

interface Props {
    context: Context
    item: AttriListItem
    variable: Variable
}

const props = defineProps<Props>();
const showRename = ref(false);
const input_s = ref<HTMLInputElement>();
const {t} = useI18n();
const dialog_posi = ref({x: 0, y: 0});
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
}

function save_instance() {
    iseditToggle.value = false;
}
</script>
<template>
    <div class="module_attr_item" ref="instance_card">
        <div class="attr_con">
            <div class="module_item_left" @click="edit_instance">
                <div class="module_name-2">
                    <svg-icon icon-class="pattern-rectangle"
                              style="width: 10px; height: 10px; transform: rotate(45deg); margin-top: 0;"></svg-icon>
                    <span class="name">{{ props.variable.name }}</span>
                </div>
            </div>
            <div class="delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <CompLayerShow :context="context" v-if="iseditToggle" @close-dialog="iseditToggle = false" right="250px"
                       :width="260" :add-type="VariableType.SymbolRef" :title="t('compos.instance_toggle')"
                       @save-layer-show="save_instance" :dialog_posi="dialog_posi">
            <template #layer>
                <SelectLayerInput :title="t('compos.compos_instance')" :add-type="VariableType.SymbolRef"
                                  :context="props.context"
                                  :placeholder="t('compos.place_select_instance')"></SelectLayerInput>
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

            > svg {
                width: 14px;
                height: 14px;
                margin: 0px 10px;
            }

            .name {
                max-width: 64%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 120px;
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