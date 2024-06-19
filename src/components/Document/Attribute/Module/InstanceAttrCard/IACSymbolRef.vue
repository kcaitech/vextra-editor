<script setup lang="ts">
import { get_vari_value_for_ref, is_circular_ref2, modify_vari_value_for_ref, RefAttriListItem } from "@/utils/symbol";
import { onMounted, onUnmounted, onUpdated, ref, watch } from "vue";
import { Context } from "@/context";
import ComponentDialog from "@/components/Document/Attribute/Module/ComponentDialog.vue";
import { OverrideType, Shape } from "@kcdesign/data";
import { Component } from "@/context/component";
import { message } from "@/utils/message";
import { ArrowDown } from '@element-plus/icons-vue'
import { useI18n } from "vue-i18n";
import { v4 } from "uuid";


interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const showCompsDialog = ref(false);
const comps = ref<HTMLDivElement>();
const comps_posi = ref({ x: 0, y: 0 });
const vari_value = ref<string>('');
const vari_instance_from = ref<string>('');
const t = useI18n().t;
const compsDialog = () => {
    if (vari_instance_from.value) {
        props.context.component.set_scroll_target(vari_instance_from.value);
    }
    if (comps.value) {
        const el = comps.value.getBoundingClientRect();
        comps_posi.value.x = el.x - (el.width + 32);
        comps_posi.value.y = el.y;
    }
    showCompsDialog.value = true;
    props.context.escstack.save(v4(), de_symbol_is_show);
}
const closeDialog = () => {
    showCompsDialog.value = false;
}

function de_symbol_is_show() {
    const is_achieve_expected_results = showCompsDialog.value;
    showCompsDialog.value = false;
    return is_achieve_expected_results;
}

// function select(index: number) {
//     const symref = props.context.selection.symbolrefshape;
//     if (!symref) return console.log("wrong role");
//     const _v = props.data.values[index];
//     const overrides = symref.findOverride(props.data.variable.id, OverrideType.Variable);
//     const _var = overrides ? overrides[overrides.length - 1] : props.data.variable;
//     modify_vari_value_for_ref(props.context, _var, _v);
// }

function get_value() {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    const id = get_vari_value_for_ref(symref, props.data.variable);
    vari_value.value = props.context.data.getSymbolSync(id)?.name || 'Error';
    if (vari_value.value) vari_instance_from.value = id;
}

function component_watcher(type: number, val: Shape) {
    if (type !== Component.SELECTED_VAL || !showCompsDialog.value) {
        return;
    }

    const symbolref = props.context.selection.symbolrefshape;
    if (!symbolref) {
        return;
    }

    const sym = props.context.data.getSymbolSync(val.id);
    if (!sym) {
        message("info", t('compos.invalid_compos'));
        return;
    }

    const is_circular = is_circular_ref2(sym, symbolref.refId);
    if (is_circular) {
        message("danger", t('compos.circle_warning'));
        return;
    }

    modify_vari_value_for_ref(props.context, props.data.variable, val.id);
    closeDialog();
}

watch(() => props.data, get_value);
onUpdated(get_value);
onMounted(() => {
    get_value();
    props.context.component.watch(component_watcher);
})
onUnmounted(() => {
    props.context.component.unwatch(component_watcher);
})
</script>
<template>
    <div class="module_state_item" ref="comps">
        <div class="state_item">
            <div class="state_name">
                <span>{{ props.data.variable.name }}</span>
            </div>
            <div class="state_value border" @click="compsDialog"
                :style="{ backgroundColor: showCompsDialog ? '#EBEBEB' : '' }">
                <span>{{ vari_value }}</span>
                <div>
                    <el-icon>
                        <ArrowDown
                            :style="{ transform: showCompsDialog ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                    </el-icon>
                </div>
            </div>
        </div>
        <!-- <div class="delete"></div> -->
        <ComponentDialog v-if="showCompsDialog" :context="context" right="244px" top="0" @closeDialog="closeDialog"
            :current-instance-from="vari_instance_from" :comps_posi="comps_posi">
        </ComponentDialog>
    </div>
</template>
<style lang="scss" scoped>
.module_state_item {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .state_item {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;

        .state_name {
            flex: 1;
            max-width: 86px;
            box-sizing: border-box;

            span {
                display: block;
                width: 100%;
                color: #595959;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .state_value {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex: 0 0 126px;
            height: 32px;
            border-radius: 6px;
            padding: 9px 9px;
            box-sizing: border-box;

            >div {
                display: flex;
                align-items: center;
                justify-content: center;

                >svg {
                    width: 12px;
                    height: 12px;
                }
            }

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .el-select {
                font-size: 12px;

                >div {
                    height: 100%;
                }

                .el-option {
                    font-size: 12px
                }

                :deep(.el-input__wrapper) {
                    height: 30px;
                    font-size: 12px;
                    background-color: var(--grey-light);
                    box-shadow: none;

                    &:hover {
                        border-color: var(--grey-light);
                        box-shadow: none;
                    }
                }
            }

            .el-input {
                width: 100%;
                font-size: 12px;

                :deep(.el-input__inner) {
                    --el-input-inner-height: 100%;
                }

                :deep(.el-input__wrapper) {
                    background-color: var(--grey-light);
                    border-color: var(--grey-light);
                    box-shadow: none;

                    &:hover {
                        border-color: var(--grey-light);
                        box-shadow: none;
                    }
                }

                :deep(.el-input__wrapper.is-focus) {
                    box-shadow: 0 0 0 1px var(--active-color) inset;
                }
            }
        }

        .border {
            background-color: #F5F5F5;

            &:hover {
                background-color: #EBEBEB;
            }
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
}

:deep(.el-select-dropdown__item.selected) {
    color: #9775fa !important;
    font-size: 12px;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
    background-color: var(--grey-light);
}

:deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}
</style>