<script setup lang="ts">
import {modify_vari_value_for_ref, RefAttriListItem} from "@/utils/symbol";
import {ref} from "vue";
import {Context} from "@/context";
import ComponentDialog from "@/components/Document/Attribute/Module/ComponentDialog.vue";
interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const showCompsDialog = ref(false);
const comps = ref<HTMLDivElement>();
const comps_posi = ref({x: 0, y: 0});

const compsDialog = () => {
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

</script>
<template>
    <div class="module_state_item" ref="comps">
        <div class="state_item">
            <div class="state_name"><span>{{ 111 }}</span></div>
            <div class="state_value border" @click="compsDialog">
                <span style="color: #606266;">默认</span>
                <svg-icon icon-class="down" style="color: #a8abb2;"></svg-icon>
            </div>
        </div>
        <div class="delete"></div>
        <ComponentDialog v-if="showCompsDialog" :context="context" right="250px" top="0" @closeDialog="closeDialog"
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
        width: 100%;
        height: 30px;

        .state_name {
            display: flex;
            align-items: center;
            width: 40%;
            height: 100%;

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
            padding: 0 11px;
            flex: 1;
            height: 100%;
            border-radius: 4px;

            > svg {
                width: 10px;
                height: 10px;
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
                font-size: 10px;

                > div {
                    height: 100%;
                }

                .el-option {
                    font-size: 10px
                }

                :deep(.el-input__wrapper) {
                    height: 30px;
                    font-size: 10px;
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
                font-size: 10px;

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