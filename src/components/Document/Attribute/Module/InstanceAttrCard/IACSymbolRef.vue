<script setup lang="ts">
import {get_vari_value_for_ref, is_circular_ref2, modify_vari_value_for_ref, RefAttriListItem} from "@/utils/symbol";
import {onMounted, onUnmounted, onUpdated, ref, watch} from "vue";
import {Context} from "@/context";
import ComponentDialog from "@/components/Document/Attribute/Module/ComponentDialog.vue";
import {Shape} from "@kcdesign/data";
import {Component} from "@/context/component";
import {message} from "@/utils/message";
import {ArrowDown} from '@element-plus/icons-vue'

interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const showCompsDialog = ref(false);
const comps = ref<HTMLDivElement>();
const comps_posi = ref({x: 0, y: 0});
const vari_value = ref<string>('');
const vari_instance_from = ref<string>('');
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
}
const closeDialog = () => {
    showCompsDialog.value = false;
}

function select(index: number) {
    const _v = props.data.values[index];
    modify_vari_value_for_ref(props.context, props.data.variable, _v);
}

function get_value() {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    const id = get_vari_value_for_ref(symref, props.data.variable);
    vari_value.value = props.context.data.symbolsMgr.getSync(id)?.name || 'Error';
    if (vari_value.value) vari_instance_from.value = id;
}

function component_watcher(t: number, val: Shape) {
    if (t === Component.SELECTED_VAL) {
        const symbolref = props.context.selection.symbolrefshape;
        if (!symbolref) return;
        const sym = props.context.data.symbolsMgr.getSync(val.id);
        if (!sym) return;
        const is_circular = is_circular_ref2(sym, symbolref.refId);
        if (is_circular) {
            message("danger", '存在循环引用');
            return;
        }
        modify_vari_value_for_ref(props.context, props.data.variable, val.id);
        closeDialog();
    }
}
watch(() => props.data, (v) => {
    get_value();
})

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
            <div class="state_value border" @click="compsDialog">
                <span style="color: #606266;">{{ vari_value }}</span>
                <div style="width: 30px;">
                    <el-icon>
                        <ArrowDown/>
                    </el-icon>
                </div>
            </div>
        </div>
        <div class="delete"></div>
        <ComponentDialog v-if="showCompsDialog" :context="context" right="250px" top="0" @closeDialog="closeDialog" :current-instance-from="vari_instance_from"
                         :comps_posi="comps_posi">
        </ComponentDialog>
    </div>
</template>
<style lang="scss" scoped>
.module_state_item {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 3px;

    .state_item {
        display: flex;
        align-items: center;
        width: calc(100% - 22px);
        height: 30px;

        .state_name {
            display: flex;
            align-items: center;
            width: 40%;
            height: 100%;
            box-sizing: border-box;
            padding-right: 10px;

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .state_value {
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            width: 60%;
            padding-left: 11px;
            flex: 1;
            height: 100%;
            border-radius: 4px;

            > div {
                display: flex;
                align-items: center;
                justify-content: center;

                > svg {
                    width: 12px;
                    height: 12px;
                }
            }

            span {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .input {
                position: relative;
                width: 100%;
                height: 30px;
                border-radius: 4px;
                padding-left: 11px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                background-color: var(--grey-light);

                span {
                    flex: 1;
                }

                .el-icon {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }

            .el-select {
                width: 100%;
                height: 30px;
                font-size: 12px;

                > div {
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
                height: 30px;
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
            background-color: var(--grey-light);
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