<script setup lang="ts">
import {get_vari_value_for_ref, modify_vari_value_for_ref, RefAttriListItem} from "@/utils/symbol";
import {ref, onMounted} from "vue";
import {Context} from "@/context";
interface Props {
    context: Context
    data: RefAttriListItem
}
const props = defineProps<Props>();
const textValue = ref('文本内容');
const inputRef = ref<HTMLInputElement>();

const selectAllText = () => {
    inputRef.value?.select()
}

function get_value() {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    textValue.value = get_vari_value_for_ref(symref, props.data.variable);
}
function change(v: boolean) {
    modify_vari_value_for_ref(props.context, props.data.variable, v);
}
onMounted(get_value);
</script>
<template>
    <div class="module_state_item">
        <div class="state_item">
            <div class="state_name"><span>{{ props.data.variable.name }}</span></div>
            <div class="state_value" style="padding: 0;">
                <el-input ref="inputRef" v-model="textValue" @focus="selectAllText" @change="change"/>
            </div>
        </div>
        <div class="delete"></div>
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

            >svg {
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

                >div {
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
                font-size: var(--font-default-fontsize);

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